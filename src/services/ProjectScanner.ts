import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { glob } from 'glob';
import { ProjectInfo, ProjectType, BuildInfo } from '../models/ProjectInfo';
import { JavaEntry } from '../models/JavaEntry';
import { JavaClassAnalyzer } from './JavaClassAnalyzer';
import { FileSystemManager } from './FileSystemManager';
import { I18nService } from './I18nService';

/**
 * 项目扫描服务
 */
export class ProjectScanner {
    private javaClassAnalyzer: JavaClassAnalyzer;
    private fileSystemManager: FileSystemManager;
    private i18n: I18nService;

    constructor() {
        this.javaClassAnalyzer = new JavaClassAnalyzer();
        this.fileSystemManager = new FileSystemManager();
        this.i18n = I18nService.getInstance();
    }

    /**
     * 扫描项目
     */
    async scanProject(rootPath: string): Promise<ProjectInfo> {
        console.log(`开始扫描项目: ${rootPath}`);

        try {
            // 1. 检测项目类型
            const projectType = await this.detectProjectType(rootPath);
            console.log(`检测到项目类型: ${projectType}`);

            // 2. 获取构建信息
            const buildInfo = await this.getBuildInfo(rootPath, projectType);
            console.log(`获取构建信息完成`);

            // 3. 扫描 Java 文件
            const javaFiles = await this.findJavaFiles(rootPath, buildInfo);
            console.log(`找到 ${javaFiles.length} 个 Java 文件`);

            // 4. 获取项目名称
            const projectName = await this.getProjectName(rootPath, buildInfo);

            // 5. 分析 Java 入口点
            const javaEntries = await this.analyzeJavaEntries(javaFiles, rootPath);
            console.log(`分析出 ${javaEntries.length} 个 Java 入口点`);

            // 6. 检查是否是多模块项目
            const isMultiModule = await this.isMultiModuleProject(rootPath, projectType);
            const subModules = isMultiModule ? await this.scanSubModules(rootPath, projectType) : [];

            // 7. 创建项目信息
            const projectInfo = new ProjectInfo(
                projectName,
                rootPath,
                projectType,
                buildInfo,
                javaEntries,
                isMultiModule,
                subModules
            );

            console.log(`项目扫描完成: ${projectInfo.getStatistics().totalEntries} 个入口点`);
            return projectInfo;

        } catch (error) {
            console.error(`扫描项目失败: ${error}`);
            throw new Error(this.i18n.localize('scan.projectFailed', error));
        }
    }

    /**
     * 检测项目类型
     */
    private async detectProjectType(rootPath: string): Promise<ProjectType> {
        const pomPath = path.join(rootPath, 'pom.xml');
        const buildGradlePath = path.join(rootPath, 'build.gradle');
        const buildGradleKtsPath = path.join(rootPath, 'build.gradle.kts');

        if (await this.fileSystemManager.exists(pomPath)) {
            return ProjectType.MAVEN;
        } else if (await this.fileSystemManager.exists(buildGradlePath) || 
                   await this.fileSystemManager.exists(buildGradleKtsPath)) {
            return ProjectType.GRADLE;
        } else {
            // 检查是否有 Java 文件
            const javaFiles = await glob('**/*.java', { cwd: rootPath });
            if (javaFiles.length > 0) {
                return ProjectType.PLAIN_JAVA;
            }
        }

        return ProjectType.UNKNOWN;
    }

    /**
     * 获取构建信息
     */
    private async getBuildInfo(rootPath: string, projectType: ProjectType): Promise<BuildInfo> {
        switch (projectType) {
            case ProjectType.MAVEN:
                return this.getMavenBuildInfo(rootPath);
            case ProjectType.GRADLE:
                return this.getGradleBuildInfo(rootPath);
            case ProjectType.PLAIN_JAVA:
                return this.getPlainJavaBuildInfo(rootPath);
            default:
                throw new Error(this.i18n.localize('scan.unsupportedProjectType', projectType));
        }
    }

    /**
     * 获取 Maven 构建信息
     */
    private async getMavenBuildInfo(rootPath: string): Promise<BuildInfo> {
        const pomPath = path.join(rootPath, 'pom.xml');
        
        return {
            type: ProjectType.MAVEN,
            buildFilePath: pomPath,
            sourceDirectories: [
                path.join(rootPath, 'src', 'main', 'java'),
                path.join(rootPath, 'src', 'main', 'resources')
            ],
            testDirectories: [
                path.join(rootPath, 'src', 'test', 'java'),
                path.join(rootPath, 'src', 'test', 'resources')
            ],
            outputDirectory: path.join(rootPath, 'target', 'classes'),
            dependencies: [] // TODO: 解析 pom.xml 获取依赖
        };
    }

    /**
     * 获取 Gradle 构建信息
     */
    private async getGradleBuildInfo(rootPath: string): Promise<BuildInfo> {
        const buildGradlePath = path.join(rootPath, 'build.gradle');
        const buildGradleKtsPath = path.join(rootPath, 'build.gradle.kts');
        
        const buildFilePath = await this.fileSystemManager.exists(buildGradlePath) 
            ? buildGradlePath 
            : buildGradleKtsPath;

        return {
            type: ProjectType.GRADLE,
            buildFilePath,
            sourceDirectories: [
                path.join(rootPath, 'src', 'main', 'java'),
                path.join(rootPath, 'src', 'main', 'resources')
            ],
            testDirectories: [
                path.join(rootPath, 'src', 'test', 'java'),
                path.join(rootPath, 'src', 'test', 'resources')
            ],
            outputDirectory: path.join(rootPath, 'build', 'classes'),
            dependencies: [] // TODO: 解析 build.gradle 获取依赖
        };
    }

    /**
     * 获取普通 Java 项目构建信息
     */
    private async getPlainJavaBuildInfo(rootPath: string): Promise<BuildInfo> {
        // 尝试找到 src 目录
        const srcDir = path.join(rootPath, 'src');
        const hasSrcDir = await this.fileSystemManager.exists(srcDir);

        return {
            type: ProjectType.PLAIN_JAVA,
            buildFilePath: '',
            sourceDirectories: hasSrcDir ? [srcDir] : [rootPath],
            testDirectories: [],
            outputDirectory: path.join(rootPath, 'out'),
            dependencies: []
        };
    }

    /**
     * 查找 Java 文件
     */
    private async findJavaFiles(rootPath: string, buildInfo: BuildInfo): Promise<string[]> {
        const javaFiles: string[] = [];

        // 扫描源代码目录
        for (const sourceDir of buildInfo.sourceDirectories) {
            if (await this.fileSystemManager.exists(sourceDir)) {
                const files = await glob('**/*.java', { cwd: sourceDir });
                javaFiles.push(...files.map(file => path.join(sourceDir, file)));
            }
        }

        // 扫描测试目录
        for (const testDir of buildInfo.testDirectories) {
            if (await this.fileSystemManager.exists(testDir)) {
                const files = await glob('**/*.java', { cwd: testDir });
                javaFiles.push(...files.map(file => path.join(testDir, file)));
            }
        }

        // 如果没有找到文件，直接在根目录搜索
        if (javaFiles.length === 0) {
            const files = await glob('**/*.java', { 
                cwd: rootPath,
                ignore: ['**/node_modules/**', '**/target/**', '**/build/**', '**/.git/**']
            });
            javaFiles.push(...files.map(file => path.join(rootPath, file)));
        }

        return javaFiles;
    }

    /**
     * 分析 Java 入口点
     */
    private async analyzeJavaEntries(javaFiles: string[], rootPath: string): Promise<JavaEntry[]> {
        const javaEntries: JavaEntry[] = [];

        for (const javaFile of javaFiles) {
            try {
                const entries = await this.javaClassAnalyzer.analyzeFile(javaFile, rootPath);
                javaEntries.push(...entries);
            } catch (error) {
                console.warn(`分析 Java 文件失败: ${javaFile}, 错误: ${error}`);
                // 继续处理其他文件
            }
        }

        return javaEntries;
    }

    /**
     * 获取项目名称
     */
    private async getProjectName(rootPath: string, buildInfo: BuildInfo): Promise<string> {
        // 尝试从构建文件中获取项目名称
        if (buildInfo.type === ProjectType.MAVEN) {
            const projectName = await this.parseProjectNameFromPom(buildInfo.buildFilePath);
            if (projectName) {
                return projectName;
            }
        } else if (buildInfo.type === ProjectType.GRADLE) {
            const projectName = await this.parseProjectNameFromGradle(buildInfo.buildFilePath);
            if (projectName) {
                return projectName;
            }
        }
        
        // 默认使用目录名
        return path.basename(rootPath);
    }

    /**
     * 从 pom.xml 解析项目名称 (artifactId)
     */
    private async parseProjectNameFromPom(pomPath: string): Promise<string | null> {
        try {
            const pomContent = await this.fileSystemManager.readFile(pomPath);
            
            // 解析 artifactId
            const artifactIdMatch = pomContent.match(/<artifactId>([^<]+)<\/artifactId>/);
            if (artifactIdMatch) {
                return artifactIdMatch[1].trim();
            }
            
            console.warn(`无法从 pom.xml 中解析 artifactId: ${pomPath}`);
            return null;
        } catch (error) {
            console.warn(`读取 pom.xml 失败: ${pomPath}, 错误: ${error}`);
            return null;
        }
    }

    /**
     * 从 build.gradle 解析项目名称
     */
    private async parseProjectNameFromGradle(gradlePath: string): Promise<string | null> {
        try {
            const gradleContent = await this.fileSystemManager.readFile(gradlePath);
            
            // 尝试解析项目名称的几种可能格式
            // 1. rootProject.name = 'project-name'
            let nameMatch = gradleContent.match(/rootProject\.name\s*=\s*['"]([^'"]+)['"]/);
            if (nameMatch) {
                return nameMatch[1].trim();
            }
            
            // 2. project.name = 'project-name'
            nameMatch = gradleContent.match(/project\.name\s*=\s*['"]([^'"]+)['"]/);
            if (nameMatch) {
                return nameMatch[1].trim();
            }
            
            // 3. name = 'project-name'
            nameMatch = gradleContent.match(/name\s*=\s*['"]([^'"]+)['"]/);
            if (nameMatch) {
                return nameMatch[1].trim();
            }
            
            console.warn(`无法从 build.gradle 中解析项目名称: ${gradlePath}`);
            return null;
        } catch (error) {
            console.warn(`读取 build.gradle 失败: ${gradlePath}, 错误: ${error}`);
            return null;
        }
    }

    /**
     * 检查是否是多模块项目
     */
    private async isMultiModuleProject(rootPath: string, projectType: ProjectType): Promise<boolean> {
        if (projectType === ProjectType.MAVEN) {
            const pomPath = path.join(rootPath, 'pom.xml');
            try {
                const pomContent = await this.fileSystemManager.readFile(pomPath);
                return pomContent.includes('<modules>') || pomContent.includes('<module>');
            } catch (error) {
                console.warn(`读取 pom.xml 失败: ${error}`);
                return false;
            }
        } else if (projectType === ProjectType.GRADLE) {
            const settingsPath = path.join(rootPath, 'settings.gradle');
            const settingsKtsPath = path.join(rootPath, 'settings.gradle.kts');
            
            try {
                const settingsFile = await this.fileSystemManager.exists(settingsPath) 
                    ? settingsPath 
                    : settingsKtsPath;

                if (await this.fileSystemManager.exists(settingsFile)) {
                    const settingsContent = await this.fileSystemManager.readFile(settingsFile);
                    return settingsContent.includes('include') || settingsContent.includes('project');
                }
            } catch (error) {
                console.warn(`读取 settings.gradle 失败: ${error}`);
                return false;
            }
        }

        return false;
    }

    /**
     * 扫描子模块
     */
    private async scanSubModules(rootPath: string, projectType: ProjectType): Promise<ProjectInfo[]> {
        const subModules: ProjectInfo[] = [];

        // TODO: 实现子模块扫描
        // 1. 解析构建文件找到子模块目录
        // 2. 递归扫描每个子模块
        // 3. 创建子模块的 ProjectInfo

        return subModules;
    }
} 