/**
 * Launch 配置类型枚举
 */
export enum LaunchConfigType {
    JAVA_APPLICATION = 'java',
    JAVA_TEST = 'java'
}

/**
 * Launch 配置模型
 */
export class LaunchConfig {
    /**
     * 配置类型
     */
    public readonly type: LaunchConfigType;

    /**
     * 配置名称
     */
    public readonly name: string;

    /**
     * 请求类型
     */
    public readonly request: 'launch' | 'attach';

    /**
     * 主类名
     */
    public readonly mainClass: string;

    /**
     * 项目名称
     */
    public readonly projectName: string;

    /**
     * 程序参数
     */
    public readonly args: string;

    /**
     * VM 参数
     */
    public readonly vmArgs: string;

    /**
     * 环境变量文件路径
     */
    public readonly envFile?: string;

    /**
     * 环境变量
     */
    public readonly env?: { [key: string]: string };

    /**
     * 工作目录
     */
    public readonly cwd?: string;

    /**
     * 控制台类型
     */
    public readonly console?: 'internalConsole' | 'integratedTerminal' | 'externalTerminal';

    /**
     * 是否停止在入口点
     */
    public readonly stopOnEntry?: boolean;

    /**
     * 额外的配置选项
     */
    public readonly additionalOptions: { [key: string]: any };

    constructor(
        type: LaunchConfigType,
        name: string,
        request: 'launch' | 'attach',
        mainClass: string,
        projectName: string,
        args: string = '',
        vmArgs: string = '',
        envFile?: string,
        env?: { [key: string]: string },
        cwd?: string,
        console?: 'internalConsole' | 'integratedTerminal' | 'externalTerminal',
        stopOnEntry?: boolean,
        additionalOptions?: { [key: string]: any }
    ) {
        this.type = type;
        this.name = name;
        this.request = request;
        this.mainClass = mainClass;
        this.projectName = projectName;
        this.args = args;
        this.vmArgs = vmArgs;
        this.envFile = envFile;
        this.env = env;
        this.cwd = cwd;
        this.console = console;
        this.stopOnEntry = stopOnEntry;
        this.additionalOptions = additionalOptions || {};
    }

    /**
     * 转换为 VSCode launch.json 格式
     */
    public toVSCodeConfig(): any {
        const config: any = {
            type: this.type,
            name: this.name,
            request: this.request,
            mainClass: this.mainClass,
            projectName: this.projectName
        };

        if (this.args) {
            config.args = this.args;
        }

        if (this.vmArgs) {
            config.vmArgs = this.vmArgs;
        }

        if (this.envFile) {
            config.envFile = this.envFile;
        }

        if (this.env) {
            config.env = this.env;
        }

        if (this.cwd) {
            config.cwd = this.cwd;
        }

        if (this.console) {
            config.console = this.console;
        }

        if (this.stopOnEntry !== undefined) {
            config.stopOnEntry = this.stopOnEntry;
        }

        // 添加额外的配置选项
        Object.keys(this.additionalOptions).forEach(key => {
            config[key] = this.additionalOptions[key];
        });

        return config;
    }

    /**
     * 获取默认的VM参数（包含JMX禁用设置）
     */
    private static getDefaultVmArgs(): string {
        return [
            '-Dcom.sun.management.jmxremote=false',  // 禁用JMX远程管理
            '-Djava.awt.headless=true',              // 禁用图形界面
            '-XX:+DisableAttachMechanism'            // 禁用JVM attach机制
        ].join(' ');
    }

    /**
     * 合并VM参数
     */
    private static mergeVmArgs(customVmArgs: string): string {
        const defaultArgs = this.getDefaultVmArgs();
        if (customVmArgs && customVmArgs.trim()) {
            return `${defaultArgs} ${customVmArgs}`;
        }
        return defaultArgs;
    }

    /**
     * 创建 Spring Boot 应用配置
     */
    public static createSpringBootConfig(
        name: string,
        mainClass: string,
        projectName: string,
        profile: string = 'dev'
    ): LaunchConfig {
        const customVmArgs = `-Dspring.profiles.active=${profile}`;
        const vmArgs = this.mergeVmArgs(customVmArgs);
        
        return new LaunchConfig(
            LaunchConfigType.JAVA_APPLICATION,
            name,
            'launch',
            mainClass,
            projectName,
            '',
            vmArgs,
            '${workspaceFolder}/.env',
            undefined,
            '${workspaceFolder}',
            'integratedTerminal'
        );
    }

    /**
     * 创建标准 Java 应用配置
     */
    public static createJavaApplicationConfig(
        name: string,
        mainClass: string,
        projectName: string
    ): LaunchConfig {
        const vmArgs = this.getDefaultVmArgs();
        
        return new LaunchConfig(
            LaunchConfigType.JAVA_APPLICATION,
            name,
            'launch',
            mainClass,
            projectName,
            '',
            vmArgs,
            undefined,
            undefined,
            '${workspaceFolder}',
            'integratedTerminal'
        );
    }

    /**
     * 创建测试配置
     */
    public static createTestConfig(
        name: string,
        mainClass: string,
        projectName: string,
        testMethod?: string
    ): LaunchConfig {
        const customVmArgs = '-ea'; // 启用断言
        const vmArgs = this.mergeVmArgs(customVmArgs);
        const args = testMethod ? `--tests ${mainClass}.${testMethod}` : '';
        
        return new LaunchConfig(
            LaunchConfigType.JAVA_TEST,
            name,
            'launch',
            mainClass,
            projectName,
            args,
            vmArgs,
            undefined,
            undefined,
            '${workspaceFolder}',
            'integratedTerminal'
        );
    }

    /**
     * 从 JSON 对象创建实例
     */
    public static fromJSON(json: any): LaunchConfig {
        return new LaunchConfig(
            json.type,
            json.name,
            json.request,
            json.mainClass,
            json.projectName,
            json.args,
            json.vmArgs,
            json.envFile,
            json.env,
            json.cwd,
            json.console,
            json.stopOnEntry,
            json.additionalOptions
        );
    }
} 