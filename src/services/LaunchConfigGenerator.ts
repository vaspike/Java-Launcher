import * as path from 'path';
import { ProjectInfo } from '../models/ProjectInfo';
import { JavaEntry, JavaEntryType } from '../models/JavaEntry';
import { LaunchConfig } from '../models/LaunchConfig';
import { FileSystemManager } from './FileSystemManager';

/**
 * 启动配置生成器
 */
export class LaunchConfigGenerator {
    private fileSystemManager: FileSystemManager;

    constructor() {
        this.fileSystemManager = new FileSystemManager();
    }

    /**
     * 生成启动配置
     */
    async generateConfigs(projectInfo: ProjectInfo, workspaceRoot: string): Promise<void> {
        try {
            console.log('开始生成启动配置...');

            // 1. 获取所有 Java 入口点
            const javaEntries = projectInfo.getAllJavaEntries();
            if (javaEntries.length === 0) {
                console.log('没有找到 Java 入口点，跳过配置生成');
                return;
            }

            // 2. 生成启动配置
            const launchConfigs = await this.createLaunchConfigs(javaEntries, projectInfo);
            
            // 3. 读取现有的 launch.json 文件（如果存在）
            const launchJsonPath = path.join(workspaceRoot, '.vscode', 'launch.json');
            const existingConfig = await this.readExistingLaunchJson(launchJsonPath);

            // 4. 合并配置
            const mergedConfig = this.mergeConfigurations(existingConfig, launchConfigs);

            // 5. 写入 launch.json 文件
            await this.writeLaunchJson(launchJsonPath, mergedConfig);

            console.log(`成功生成 ${launchConfigs.length} 个启动配置`);

        } catch (error) {
            console.error('生成启动配置失败:', error);
            throw error;
        }
    }

    /**
     * 创建启动配置
     */
    private async createLaunchConfigs(javaEntries: JavaEntry[], projectInfo: ProjectInfo): Promise<LaunchConfig[]> {
        const launchConfigs: LaunchConfig[] = [];

        for (const entry of javaEntries) {
            try {
                const config = await this.createLaunchConfig(entry, projectInfo);
                if (config) {
                    launchConfigs.push(config);
                }
            } catch (error) {
                console.warn(`创建启动配置失败: ${entry.className}, 错误: ${error}`);
            }
        }

        return launchConfigs;
    }

    /**
     * 创建单个启动配置
     */
    private async createLaunchConfig(entry: JavaEntry, projectInfo: ProjectInfo): Promise<LaunchConfig | null> {
        switch (entry.type) {
            case JavaEntryType.SPRING_BOOT_APPLICATION:
                return this.createSpringBootConfig(entry, projectInfo);
            
            case JavaEntryType.MAIN_CLASS:
                return this.createJavaApplicationConfig(entry, projectInfo);
            
            case JavaEntryType.JUNIT_TEST_CLASS:
            case JavaEntryType.TESTNG_TEST_CLASS:
                return this.createTestClassConfig(entry, projectInfo);
            
            case JavaEntryType.JUNIT_TEST_METHOD:
            case JavaEntryType.TESTNG_TEST_METHOD:
                return this.createTestMethodConfig(entry, projectInfo);
            
            default:
                console.warn(`不支持的入口点类型: ${entry.type}`);
                return null;
        }
    }

    /**
     * 创建 Spring Boot 应用配置
     */
    private createSpringBootConfig(entry: JavaEntry, projectInfo: ProjectInfo): LaunchConfig {
        const name = `${entry.displayName}`;
        const profile = this.getSpringProfile(entry, projectInfo);
        
        return LaunchConfig.createSpringBootConfig(
            name,
            entry.className,
            entry.projectName,
            profile
        );
    }

    /**
     * 创建 Java 应用配置
     */
    private createJavaApplicationConfig(entry: JavaEntry, projectInfo: ProjectInfo): LaunchConfig {
        const name = `${entry.displayName}`;
        
        return LaunchConfig.createJavaApplicationConfig(
            name,
            entry.className,
            entry.projectName
        );
    }

    /**
     * 创建测试类配置
     */
    private createTestClassConfig(entry: JavaEntry, projectInfo: ProjectInfo): LaunchConfig {
        const name = `${entry.displayName}`;
        
        return LaunchConfig.createTestConfig(
            name,
            entry.className,
            entry.projectName
        );
    }

    /**
     * 创建测试方法配置
     */
    private createTestMethodConfig(entry: JavaEntry, projectInfo: ProjectInfo): LaunchConfig {
        const name = `${entry.displayName}`;
        
        return LaunchConfig.createTestConfig(
            name,
            entry.className,
            entry.projectName,
            entry.methodName
        );
    }

    /**
     * 获取 Spring 配置文件
     */
    private getSpringProfile(entry: JavaEntry, projectInfo: ProjectInfo): string {
        // 默认使用 dev 配置
        // TODO: 可以根据项目配置文件检测实际的 profile
        return 'dev';
    }

    /**
     * 读取现有的 launch.json 文件
     */
    private async readExistingLaunchJson(launchJsonPath: string): Promise<any> {
        try {
            if (await this.fileSystemManager.exists(launchJsonPath)) {
                const config = await this.fileSystemManager.readJsonFile(launchJsonPath);
                return config;
            }
        } catch (error) {
            console.warn(`读取现有 launch.json 文件失败: ${error}`);
        }

        // 返回默认配置结构
        return {
            version: '0.2.0',
            configurations: []
        };
    }

    /**
     * 合并配置
     */
    private mergeConfigurations(existingConfig: any, newConfigs: LaunchConfig[]): any {
        const mergedConfig = {
            version: '0.2.0',
            configurations: [...(existingConfig.configurations || [])]
        };

        // 将新配置转换为 VSCode 格式
        const vscodeConfigs = newConfigs.map(config => config.toVSCodeConfig());

        // 合并配置，避免重复
        for (const newConfig of vscodeConfigs) {
            const existingIndex = mergedConfig.configurations.findIndex(
                (config: any) => config.name === newConfig.name
            );

            if (existingIndex !== -1) {
                // 更新现有配置
                mergedConfig.configurations[existingIndex] = newConfig;
                console.log(`更新现有配置: ${newConfig.name}`);
            } else {
                // 添加新配置
                mergedConfig.configurations.push(newConfig);
                console.log(`添加新配置: ${newConfig.name}`);
            }
        }

        return mergedConfig;
    }

    /**
     * 写入 launch.json 文件
     */
    private async writeLaunchJson(launchJsonPath: string, config: any): Promise<void> {
        try {
            await this.fileSystemManager.writeJsonFile(launchJsonPath, config);
            console.log(`成功写入 launch.json 文件: ${launchJsonPath}`);
        } catch (error) {
            throw new Error(`写入 launch.json 文件失败: ${error}`);
        }
    }

    /**
     * 验证配置
     */
    private validateConfiguration(config: any): boolean {
        if (!config.configurations || !Array.isArray(config.configurations)) {
            return false;
        }

        for (const cfg of config.configurations) {
            if (!cfg.type || !cfg.name || !cfg.request) {
                return false;
            }
        }

        return true;
    }

    /**
     * 生成配置预览
     */
    async generatePreview(projectInfo: ProjectInfo): Promise<string> {
        try {
            const javaEntries = projectInfo.getAllJavaEntries();
            const launchConfigs = await this.createLaunchConfigs(javaEntries, projectInfo);
            
            const previewConfig = {
                version: '0.2.0',
                configurations: launchConfigs.map(config => config.toVSCodeConfig())
            };

            return JSON.stringify(previewConfig, null, 2);
        } catch (error) {
            throw new Error(`生成配置预览失败: ${error}`);
        }
    }

    /**
     * 检查是否需要更新配置
     */
    async needsUpdate(projectInfo: ProjectInfo, workspaceRoot: string): Promise<boolean> {
        const launchJsonPath = path.join(workspaceRoot, '.vscode', 'launch.json');
        
        if (!await this.fileSystemManager.exists(launchJsonPath)) {
            return true;
        }

        try {
            const existingConfig = await this.readExistingLaunchJson(launchJsonPath);
            const javaEntries = projectInfo.getAllJavaEntries();
            const expectedConfigCount = javaEntries.length;
            const actualConfigCount = existingConfig.configurations?.length || 0;

            // 简单检查：如果配置数量不匹配，则需要更新
            return expectedConfigCount !== actualConfigCount;
        } catch (error) {
            console.warn(`检查配置更新状态失败: ${error}`);
            return true;
        }
    }
} 