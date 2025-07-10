import { JavaEntry } from './JavaEntry';

/**
 * 项目类型枚举
 */
export enum ProjectType {
    MAVEN = 'maven',
    GRADLE = 'gradle',
    PLAIN_JAVA = 'plain-java',
    UNKNOWN = 'unknown'
}

/**
 * 项目构建信息
 */
export interface BuildInfo {
    /**
     * 构建工具类型
     */
    type: ProjectType;

    /**
     * 构建文件路径
     */
    buildFilePath: string;

    /**
     * 源代码目录
     */
    sourceDirectories: string[];

    /**
     * 测试代码目录
     */
    testDirectories: string[];

    /**
     * 编译输出目录
     */
    outputDirectory: string;

    /**
     * 依赖信息
     */
    dependencies: string[];
}

/**
 * 项目信息模型
 */
export class ProjectInfo {
    /**
     * 项目名称
     */
    public readonly name: string;

    /**
     * 项目根目录路径
     */
    public readonly rootPath: string;

    /**
     * 项目类型
     */
    public readonly type: ProjectType;

    /**
     * 构建信息
     */
    public readonly buildInfo: BuildInfo;

    /**
     * 发现的 Java 入口点
     */
    public readonly javaEntries: JavaEntry[];

    /**
     * 是否是多模块项目
     */
    public readonly isMultiModule: boolean;

    /**
     * 子模块信息（如果是多模块项目）
     */
    public readonly subModules: ProjectInfo[];

    /**
     * 扫描时间戳
     */
    public readonly scannedAt: Date;

    constructor(
        name: string,
        rootPath: string,
        type: ProjectType,
        buildInfo: BuildInfo,
        javaEntries: JavaEntry[] = [],
        isMultiModule: boolean = false,
        subModules: ProjectInfo[] = []
    ) {
        this.name = name;
        this.rootPath = rootPath;
        this.type = type;
        this.buildInfo = buildInfo;
        this.javaEntries = javaEntries;
        this.isMultiModule = isMultiModule;
        this.subModules = subModules;
        this.scannedAt = new Date();
    }

    /**
     * 获取所有的 Java 入口点（包括子模块）
     */
    public getAllJavaEntries(): JavaEntry[] {
        const allEntries = [...this.javaEntries];

        if (this.isMultiModule) {
            this.subModules.forEach(subModule => {
                allEntries.push(...subModule.getAllJavaEntries());
            });
        }

        return allEntries;
    }

    /**
     * 获取 Spring Boot 应用入口点
     */
    public getSpringBootEntries(): JavaEntry[] {
        return this.getAllJavaEntries().filter(entry => entry.isSpringBootApp());
    }

    /**
     * 获取测试入口点
     */
    public getTestEntries(): JavaEntry[] {
        return this.getAllJavaEntries().filter(entry => entry.isTestEntry());
    }

    /**
     * 获取普通 Java 应用入口点
     */
    public getJavaApplicationEntries(): JavaEntry[] {
        return this.getAllJavaEntries().filter(entry => 
            !entry.isTestEntry() && !entry.isSpringBootApp()
        );
    }

    /**
     * 根据类名查找入口点
     */
    public findEntryByClassName(className: string): JavaEntry | undefined {
        return this.getAllJavaEntries().find(entry => entry.className === className);
    }

    /**
     * 根据文件路径查找入口点
     */
    public findEntriesByFilePath(filePath: string): JavaEntry[] {
        return this.getAllJavaEntries().filter(entry => entry.filePath === filePath);
    }

    /**
     * 是否是 Maven 项目
     */
    public isMavenProject(): boolean {
        return this.type === ProjectType.MAVEN;
    }

    /**
     * 是否是 Gradle 项目
     */
    public isGradleProject(): boolean {
        return this.type === ProjectType.GRADLE;
    }

    /**
     * 是否包含 Spring Boot 应用
     */
    public hasSpringBootApp(): boolean {
        return this.getSpringBootEntries().length > 0;
    }

    /**
     * 是否包含测试
     */
    public hasTests(): boolean {
        return this.getTestEntries().length > 0;
    }

    /**
     * 获取统计信息
     */
    public getStatistics(): {
        totalEntries: number;
        springBootApps: number;
        javaApplications: number;
        testClasses: number;
        testMethods: number;
        subModules: number;
    } {
        const allEntries = this.getAllJavaEntries();
        const springBootEntries = this.getSpringBootEntries();
        const testEntries = this.getTestEntries();
        const javaAppEntries = this.getJavaApplicationEntries();

        return {
            totalEntries: allEntries.length,
            springBootApps: springBootEntries.length,
            javaApplications: javaAppEntries.length,
            testClasses: testEntries.filter(entry => !entry.methodName).length,
            testMethods: testEntries.filter(entry => entry.methodName).length,
            subModules: this.subModules.length
        };
    }

    /**
     * 转换为 JSON 对象
     */
    public toJSON(): any {
        return {
            name: this.name,
            rootPath: this.rootPath,
            type: this.type,
            buildInfo: this.buildInfo,
            javaEntries: this.javaEntries.map(entry => entry.toJSON()),
            isMultiModule: this.isMultiModule,
            subModules: this.subModules.map(subModule => subModule.toJSON()),
            scannedAt: this.scannedAt.toISOString()
        };
    }

    /**
     * 从 JSON 对象创建实例
     */
    public static fromJSON(json: any): ProjectInfo {
        const javaEntries = json.javaEntries?.map((entryJson: any) => 
            JavaEntry.fromJSON(entryJson)
        ) || [];

        const subModules = json.subModules?.map((subModuleJson: any) => 
            ProjectInfo.fromJSON(subModuleJson)
        ) || [];

        const project = new ProjectInfo(
            json.name,
            json.rootPath,
            json.type,
            json.buildInfo,
            javaEntries,
            json.isMultiModule,
            subModules
        );

        // 恢复扫描时间
        if (json.scannedAt) {
            (project as any).scannedAt = new Date(json.scannedAt);
        }

        return project;
    }
} 