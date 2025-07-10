import * as fs from 'fs';
import * as path from 'path';
import { JavaEntry, JavaEntryType } from '../models/JavaEntry';
import { FileSystemManager } from './FileSystemManager';
import { I18nService } from './I18nService';

/**
 * Java 类分析器
 */
export class JavaClassAnalyzer {
    private fileSystemManager: FileSystemManager;
    private i18n: I18nService;

    constructor() {
        this.fileSystemManager = new FileSystemManager();
        this.i18n = I18nService.getInstance();
    }

    /**
     * 分析 Java 文件
     */
    async analyzeFile(filePath: string, rootPath: string): Promise<JavaEntry[]> {
        const entries: JavaEntry[] = [];

        try {
            const content = await this.fileSystemManager.readFile(filePath);
            const lines = content.split('\n');
            
            // 获取类名和包名
            const className = this.extractClassName(content, filePath);
            const packageName = this.extractPackageName(content);
            const fullClassName = packageName ? `${packageName}.${className}` : className;
            
            // 获取当前Java文件所属的项目名称
            const projectName = await this.getProjectName(filePath, rootPath);

            // 分析 Spring Boot 应用
            const springBootEntries = this.analyzeSpringBootApp(
                content, fullClassName, filePath, projectName, lines
            );
            entries.push(...springBootEntries);

            // 分析 Main 方法
            const mainEntries = this.analyzeMainMethods(
                content, fullClassName, filePath, projectName, lines
            );
            entries.push(...mainEntries);

            // 分析测试类和方法
            const testEntries = this.analyzeTestEntries(
                content, fullClassName, filePath, projectName, lines
            );
            entries.push(...testEntries);

        } catch (error) {
            console.error(`分析 Java 文件失败: ${filePath}, 错误: ${error}`);
            throw error;
        }

        return entries;
    }

    /**
     * 分析 Spring Boot 应用
     */
    private analyzeSpringBootApp(
        content: string, 
        className: string, 
        filePath: string, 
        projectName: string,
        lines: string[]
    ): JavaEntry[] {
        const entries: JavaEntry[] = [];

        // 查找 @SpringBootApplication 注解
        const springBootAppRegex = /@SpringBootApplication/;
        const mainMethodRegex = /public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*\w+\s*\)/;

        if (springBootAppRegex.test(content) && mainMethodRegex.test(content)) {
            // 找到注解和 main 方法的行号
            const annotationLineIndex = lines.findIndex(line => springBootAppRegex.test(line));
            const mainMethodLineIndex = lines.findIndex(line => mainMethodRegex.test(line));
            
            if (annotationLineIndex !== -1 && mainMethodLineIndex !== -1) {
                const annotations = new Map<string, any>();
                annotations.set('SpringBootApplication', true);

                const entry = new JavaEntry(
                    JavaEntryType.SPRING_BOOT_APPLICATION,
                    className,
                    filePath,
                    projectName,
                    `🍃 ${className.split('.').pop()}`,
                    annotationLineIndex + 1,
                    undefined,
                    this.i18n.localize('entry.springBoot.description'),
                    annotations
                );

                entries.push(entry);
            }
        }

        return entries;
    }

    /**
     * 分析 Main 方法
     */
    private analyzeMainMethods(
        content: string, 
        className: string, 
        filePath: string, 
        projectName: string,
        lines: string[]
    ): JavaEntry[] {
        const entries: JavaEntry[] = [];

        // 查找 main 方法（排除已经作为 Spring Boot 应用的）
        const mainMethodRegex = /public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*\w+\s*\)/;
        const springBootAppRegex = /@SpringBootApplication/;

        if (mainMethodRegex.test(content) && !springBootAppRegex.test(content)) {
            const mainMethodLineIndex = lines.findIndex(line => mainMethodRegex.test(line));
            
            if (mainMethodLineIndex !== -1) {
                const entry = new JavaEntry(
                    JavaEntryType.MAIN_CLASS,
                    className,
                    filePath,
                    projectName,
                    `☕ ${className.split('.').pop()}`,
                    mainMethodLineIndex + 1,
                    'main',
                    this.i18n.localize('entry.javaApp.description')
                );

                entries.push(entry);
            }
        }

        return entries;
    }

    /**
     * 分析测试入口点
     */
    private analyzeTestEntries(
        content: string, 
        className: string, 
        filePath: string, 
        projectName: string,
        lines: string[]
    ): JavaEntry[] {
        const entries: JavaEntry[] = [];

        // 检查是否是测试类
        const isTestClass = this.isTestClass(content, filePath);
        
        if (isTestClass) {
            // 分析测试类
            const testClassEntry = this.analyzeTestClass(
                content, className, filePath, projectName, lines
            );
            if (testClassEntry) {
                entries.push(testClassEntry);
            }

            // 分析测试方法
            const testMethodEntries = this.analyzeTestMethods(
                content, className, filePath, projectName, lines
            );
            entries.push(...testMethodEntries);
        }

        return entries;
    }

    /**
     * 检查是否是测试类
     */
    private isTestClass(content: string, filePath: string): boolean {
        // 检查文件路径是否包含测试目录
        const isInTestDir = filePath.includes('/test/') || filePath.includes('\\test\\');
        
        // 检查类名是否以 Test 结尾
        const classNameRegex = /class\s+(\w+)/;
        const match = content.match(classNameRegex);
        const isTestClassName = match && match[1].endsWith('Test');

        // 检查是否包含测试注解
        const hasTestAnnotations = /@Test|@RunWith|@ExtendWith|@TestMethodOrder/.test(content);

        return isInTestDir || isTestClassName || hasTestAnnotations;
    }

    /**
     * 分析测试类
     */
    private analyzeTestClass(
        content: string, 
        className: string, 
        filePath: string, 
        projectName: string,
        lines: string[]
    ): JavaEntry | null {
        // 检查测试框架
        const isJUnit4 = /@RunWith|@Test/.test(content) && !/@ExtendWith/.test(content);
        const isJUnit5 = /@ExtendWith|@TestMethodOrder/.test(content) || 
                        (/@Test/.test(content) && /org\.junit\.jupiter/.test(content));
        const isTestNG = /@Test/.test(content) && /org\.testng/.test(content);

        let entryType: JavaEntryType;
        let framework: string;

        if (isJUnit4) {
            entryType = JavaEntryType.JUNIT_TEST_CLASS;
            framework = this.i18n.localize('entry.framework.junit4');
        } else if (isJUnit5) {
            entryType = JavaEntryType.JUNIT_TEST_CLASS;
            framework = this.i18n.localize('entry.framework.junit5');
        } else if (isTestNG) {
            entryType = JavaEntryType.TESTNG_TEST_CLASS;
            framework = this.i18n.localize('entry.framework.testng');
        } else {
            entryType = JavaEntryType.JUNIT_TEST_CLASS;
            framework = this.i18n.localize('entry.framework.junit');
        }

        // 找到类声明的行号
        const classDeclarationIndex = lines.findIndex(line => /class\s+\w+/.test(line));
        
        if (classDeclarationIndex !== -1) {
            const annotations = new Map<string, any>();
            annotations.set('framework', framework);

            return new JavaEntry(
                entryType,
                className,
                filePath,
                projectName,
                `🧪 ${className.split('.').pop()}`,
                classDeclarationIndex + 1,
                undefined,
                this.i18n.localize('entry.testClass.description', framework),
                annotations
            );
        }

        return null;
    }

    /**
     * 分析测试方法
     */
    private analyzeTestMethods(
        content: string, 
        className: string, 
        filePath: string, 
        projectName: string,
        lines: string[]
    ): JavaEntry[] {
        const entries: JavaEntry[] = [];

        // 查找测试方法
        const testMethodRegex = /@Test[\s\S]*?(?:public|private|protected)?\s+\w+\s+(\w+)\s*\(/g;
        let match;

        while ((match = testMethodRegex.exec(content)) !== null) {
            const methodName = match[1];
            
            // 找到方法的行号
            const methodLineIndex = lines.findIndex(line => 
                line.includes(methodName) && /@Test/.test(lines[lines.indexOf(line) - 1] || '')
            );

            if (methodLineIndex !== -1) {
                // 确定测试框架
                const isJUnit4 = /@RunWith/.test(content) && !/@ExtendWith/.test(content);
                const isJUnit5 = /@ExtendWith/.test(content) || /org\.junit\.jupiter/.test(content);
                const isTestNG = /org\.testng/.test(content);

                let entryType: JavaEntryType;
                let framework: string;

                if (isJUnit4) {
                    entryType = JavaEntryType.JUNIT_TEST_METHOD;
                    framework = this.i18n.localize('entry.framework.junit4');
                } else if (isJUnit5) {
                    entryType = JavaEntryType.JUNIT_TEST_METHOD;
                    framework = this.i18n.localize('entry.framework.junit5');
                } else if (isTestNG) {
                    entryType = JavaEntryType.TESTNG_TEST_METHOD;
                    framework = this.i18n.localize('entry.framework.testng');
                } else {
                    entryType = JavaEntryType.JUNIT_TEST_METHOD;
                    framework = this.i18n.localize('entry.framework.junit');
                }

                const annotations = new Map<string, any>();
                annotations.set('framework', framework);

                // 提取简单类名（不包含包名）
                const simpleClassName = className.split('.').pop() || className;

                const entry = new JavaEntry(
                    entryType,
                    className,
                    filePath,
                    projectName,
                    `🔬 ${simpleClassName}-${methodName}`,
                    methodLineIndex + 1,
                    methodName,
                    this.i18n.localize('entry.testMethod.description', framework),
                    annotations
                );

                entries.push(entry);
            }
        }

        return entries;
    }

    /**
     * 提取类名
     */
    private extractClassName(content: string, filePath: string): string {
        // 尝试从内容中提取类名
        const classMatch = content.match(/(?:public\s+)?class\s+(\w+)/);
        if (classMatch) {
            return classMatch[1];
        }

        // 如果提取失败，使用文件名
        const fileName = path.basename(filePath, '.java');
        return fileName;
    }

    /**
     * 提取包名
     */
    private extractPackageName(content: string): string | null {
        const packageMatch = content.match(/package\s+([\w.]+);/);
        return packageMatch ? packageMatch[1] : null;
    }

    /**
     * 获取当前Java文件所属的项目名称
     * 通过向上查找最近的pom.xml并解析其artifactId
     */
    private async getProjectName(filePath: string, rootPath: string): Promise<string> {
        try {
            // 从Java文件所在目录开始向上查找pom.xml
            const pomPath = await this.findNearestPom(filePath, rootPath);
            
            if (pomPath) {
                const artifactId = await this.parseArtifactIdFromPom(pomPath);
                if (artifactId) {
                    return artifactId;
                }
            }

            // 如果没有找到pom.xml或解析失败，尝试从路径推断模块名
        const relativePath = path.relative(rootPath, filePath);
        const pathParts = relativePath.split(path.sep);
        
            // 如果是Maven项目结构，尝试获取模块名
        if (pathParts.includes('src')) {
            const srcIndex = pathParts.indexOf('src');
            if (srcIndex > 0) {
                return pathParts[srcIndex - 1];
            }
        }

        // 默认使用根目录名
        return path.basename(rootPath);
        } catch (error) {
            console.warn(`获取项目名称失败: ${filePath}, 错误: ${error}`);
            return path.basename(rootPath);
        }
    }

    /**
     * 从Java文件路径向上查找最近的pom.xml文件
     */
    private async findNearestPom(filePath: string, rootPath: string): Promise<string | null> {
        let currentDir = path.dirname(filePath);
        const rootDir = path.resolve(rootPath);

        while (currentDir && currentDir !== path.dirname(currentDir)) {
            const pomPath = path.join(currentDir, 'pom.xml');
            
            if (await this.fileSystemManager.exists(pomPath)) {
                return pomPath;
            }

            // 如果已经到达项目根目录，停止查找
            if (path.resolve(currentDir) === rootDir) {
                break;
            }

            currentDir = path.dirname(currentDir);
        }

        return null;
    }

    /**
     * 从pom.xml解析artifactId
     */
    private async parseArtifactIdFromPom(pomPath: string): Promise<string | null> {
        try {
            const pomContent = await this.fileSystemManager.readFile(pomPath);
            
            // 找到project根节点后的第一个artifactId，排除parent中的artifactId
            const artifactId = this.extractProjectArtifactId(pomContent);
            if (artifactId) {
                return artifactId.trim();
            }
            
            console.warn(`无法从pom.xml解析artifactId: ${pomPath}`);
            return null;
        } catch (error) {
            console.warn(`读取pom.xml失败: ${pomPath}, 错误: ${error}`);
            return null;
        }
    }

    /**
     * 从pom.xml内容中提取project的artifactId（排除parent中的）
     */
    private extractProjectArtifactId(pomContent: string): string | null {
        try {
            // 移除注释和CDATA
            let cleanContent = pomContent.replace(/<!--[\s\S]*?-->/g, '').replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
            
            // 查找project标签的开始和结束位置
            const projectStartMatch = cleanContent.match(/<project[^>]*>/);
            if (!projectStartMatch) {
                return null;
            }
            
            const projectEndMatch = cleanContent.match(/<\/project\s*>/);
            if (!projectEndMatch) {
                return null;
            }
            
            // 提取project标签内的内容
            const projectStartIndex = projectStartMatch.index! + projectStartMatch[0].length;
            const projectEndIndex = projectEndMatch.index!;
            const projectContent = cleanContent.substring(projectStartIndex, projectEndIndex);
            
            // 解析project的直接子节点
            return this.parseDirectChildArtifactId(projectContent);
            
        } catch (error) {
            console.warn(`解析pom.xml内容失败: ${error}`);
            return null;
        }
    }

    /**
     * 解析project的直接子节点artifactId
     * 跳过嵌套在其他标签（如parent、dependencies等）中的artifactId
     */
    private parseDirectChildArtifactId(projectContent: string): string | null {
        // 将内容按行分割，逐行解析
        const lines = projectContent.split('\n').map(line => line.trim());
        let depth = 0;
        let inParentBlock = false;
        
        for (const line of lines) {
            // 跳过空行和注释
            if (!line || line.startsWith('<!--')) {
                continue;
            }
            
            // 检查是否进入或退出parent块
            if (line.includes('<parent>') || line.includes('<parent ')) {
                inParentBlock = true;
                continue;
            }
            if (line.includes('</parent>')) {
                inParentBlock = false;
                continue;
            }
            
            // 如果在parent块内，跳过
            if (inParentBlock) {
                continue;
            }
            
            // 检查是否进入或退出其他嵌套块（如dependencies、properties等）
            if (line.includes('<dependencies>') || line.includes('<properties>') || 
                line.includes('<build>') || line.includes('<profiles>') ||
                line.includes('<modules>')) {
                depth++;
                continue;
            }
            if (line.includes('</dependencies>') || line.includes('</properties>') || 
                line.includes('</build>') || line.includes('</profiles>') ||
                line.includes('</modules>')) {
                depth--;
                continue;
            }
            
            // 如果在嵌套块内，跳过
            if (depth > 0) {
                continue;
            }
            
            // 查找artifactId标签（确保是project的直接子节点）
            const artifactIdMatch = line.match(/<artifactId>\s*([^<]+)\s*<\/artifactId>/);
            if (artifactIdMatch) {
                return artifactIdMatch[1].trim();
            }
        }
        
        return null;
    }
} 