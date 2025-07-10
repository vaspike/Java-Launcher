/**
 * Java 入口点类型枚举
 */
export enum JavaEntryType {
    SPRING_BOOT_APPLICATION = 'spring-boot-application',
    MAIN_CLASS = 'main-class',
    JUNIT_TEST_CLASS = 'junit-test-class',
    JUNIT_TEST_METHOD = 'junit-test-method',
    TESTNG_TEST_CLASS = 'testng-test-class',
    TESTNG_TEST_METHOD = 'testng-test-method'
}

/**
 * Java 入口点模型
 */
export class JavaEntry {
    /**
     * 入口点类型
     */
    public readonly type: JavaEntryType;

    /**
     * 类的全限定名
     */
    public readonly className: string;

    /**
     * 方法名（如果是方法级别的入口点）
     */
    public readonly methodName?: string;

    /**
     * 文件路径
     */
    public readonly filePath: string;

    /**
     * 项目名称
     */
    public readonly projectName: string;

    /**
     * 显示名称
     */
    public readonly displayName: string;

    /**
     * 描述信息
     */
    public readonly description?: string;

    /**
     * 额外的注解信息
     */
    public readonly annotations: Map<string, any>;

    /**
     * 行号
     */
    public readonly lineNumber: number;

    constructor(
        type: JavaEntryType,
        className: string,
        filePath: string,
        projectName: string,
        displayName: string,
        lineNumber: number,
        methodName?: string,
        description?: string,
        annotations?: Map<string, any>
    ) {
        this.type = type;
        this.className = className;
        this.methodName = methodName;
        this.filePath = filePath;
        this.projectName = projectName;
        this.displayName = displayName;
        this.description = description;
        this.annotations = annotations || new Map();
        this.lineNumber = lineNumber;
    }

    /**
     * 获取完整的标识符
     */
    public getFullIdentifier(): string {
        if (this.methodName) {
            return `${this.className}.${this.methodName}`;
        }
        return this.className;
    }

    /**
     * 是否是测试入口点
     */
    public isTestEntry(): boolean {
        return this.type === JavaEntryType.JUNIT_TEST_CLASS ||
               this.type === JavaEntryType.JUNIT_TEST_METHOD ||
               this.type === JavaEntryType.TESTNG_TEST_CLASS ||
               this.type === JavaEntryType.TESTNG_TEST_METHOD;
    }

    /**
     * 是否是 Spring Boot 应用
     */
    public isSpringBootApp(): boolean {
        return this.type === JavaEntryType.SPRING_BOOT_APPLICATION;
    }

    /**
     * 转换为 JSON 对象
     */
    public toJSON(): any {
        return {
            type: this.type,
            className: this.className,
            methodName: this.methodName,
            filePath: this.filePath,
            projectName: this.projectName,
            displayName: this.displayName,
            description: this.description,
            annotations: Array.from(this.annotations.entries()),
            lineNumber: this.lineNumber
        };
    }

    /**
     * 从 JSON 对象创建实例
     */
    public static fromJSON(json: any): JavaEntry {
        const annotations = new Map<string, any>(json.annotations || []);
        return new JavaEntry(
            json.type,
            json.className,
            json.filePath,
            json.projectName,
            json.displayName,
            json.lineNumber,
            json.methodName,
            json.description,
            annotations
        );
    }
} 