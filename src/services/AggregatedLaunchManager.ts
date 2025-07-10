import * as vscode from 'vscode';
import * as path from 'path';
import { AggregatedLaunchConfig, AggregatedLaunchItem } from '../models/AggregatedLaunchConfig';
import { FileSystemManager } from './FileSystemManager';
import { I18nService } from './I18nService';

/**
 * 聚合启动管理器
 */
export class AggregatedLaunchManager {
    private fileSystemManager: FileSystemManager;
    private configFilePath: string;
    private aggregatedConfigs: AggregatedLaunchConfig[] = [];
    private i18n: I18nService;

    constructor() {
        this.fileSystemManager = new FileSystemManager();
        this.i18n = I18nService.getInstance();
        this.configFilePath = this.getConfigFilePath();
    }

    /**
     * 获取配置文件路径
     */
    private getConfigFilePath(): string {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error(this.i18n.localize('workspace.notFound'));
        }
        
        const vscodeDir = path.join(workspaceFolder.uri.fsPath, '.vscode');
        return path.join(vscodeDir, 'aggregated-launch.json');
    }

    /**
     * 加载聚合启动配置
     */
    public async loadConfigs(): Promise<AggregatedLaunchConfig[]> {
        try {
            if (await this.fileSystemManager.exists(this.configFilePath)) {
                const content = await this.fileSystemManager.readFile(this.configFilePath);
                const jsonData = JSON.parse(content);
                
                this.aggregatedConfigs = (jsonData.configs || []).map((config: any) => 
                    AggregatedLaunchConfig.fromJSON(config)
                );
            } else {
                this.aggregatedConfigs = [];
            }
            
            return this.aggregatedConfigs;
        } catch (error) {
            console.error(this.i18n.localize('aggregated.loadFailed', error));
            this.aggregatedConfigs = [];
            return this.aggregatedConfigs;
        }
    }

    /**
     * 保存聚合启动配置
     */
    public async saveConfigs(): Promise<void> {
        try {
            // 确保.vscode目录存在
            const vscodeDir = path.dirname(this.configFilePath);
            if (!(await this.fileSystemManager.exists(vscodeDir))) {
                await this.fileSystemManager.ensureDirectoryExists(vscodeDir);
            }

            const configData = {
                version: '1.0.0',
                configs: this.aggregatedConfigs.map(config => config.toJSON())
            };

            await this.fileSystemManager.writeFile(
                this.configFilePath,
                JSON.stringify(configData, null, 2)
            );
            
            console.log(this.i18n.localize('aggregated.saveSuccess'));
        } catch (error) {
            console.error(this.i18n.localize('aggregated.saveFailed', error));
            throw new Error(this.i18n.localize('aggregated.saveFailed', error));
        }
    }

    /**
     * 获取所有聚合启动配置
     */
    public getConfigs(): AggregatedLaunchConfig[] {
        return this.aggregatedConfigs;
    }

    /**
     * 根据名称获取聚合启动配置
     */
    public getConfigByName(name: string): AggregatedLaunchConfig | undefined {
        return this.aggregatedConfigs.find(config => config.name === name);
    }

    /**
     * 创建聚合启动配置
     */
    public async createConfig(
        name: string,
        description: string = '',
        items: AggregatedLaunchItem[] = []
    ): Promise<AggregatedLaunchConfig> {
        // 检查名称是否已存在
        if (this.getConfigByName(name)) {
            throw new Error(this.i18n.localize('aggregated.nameExists', name));
        }

        const config = new AggregatedLaunchConfig(name, description, items);
        this.aggregatedConfigs.push(config);
        await this.saveConfigs();
        
        return config;
    }

    /**
     * 更新聚合启动配置
     */
    public async updateConfig(
        name: string,
        updates: {
            description?: string;
            items?: AggregatedLaunchItem[];
        }
    ): Promise<AggregatedLaunchConfig> {
        const index = this.aggregatedConfigs.findIndex(config => config.name === name);
        if (index === -1) {
            throw new Error(this.i18n.localize('aggregated.notFound', name));
        }

        const oldConfig = this.aggregatedConfigs[index];
        const newConfig = new AggregatedLaunchConfig(
            name,
            updates.description !== undefined ? updates.description : oldConfig.description,
            updates.items !== undefined ? updates.items : oldConfig.items,
            oldConfig.createdAt,
            new Date()
        );

        this.aggregatedConfigs[index] = newConfig;
        await this.saveConfigs();
        
        return newConfig;
    }

    /**
     * 删除聚合启动配置
     */
    public async deleteConfig(name: string): Promise<void> {
        const index = this.aggregatedConfigs.findIndex(config => config.name === name);
        if (index === -1) {
            throw new Error(this.i18n.localize('aggregated.notFound', name));
        }

        this.aggregatedConfigs.splice(index, 1);
        await this.saveConfigs();
    }

    /**
     * 执行聚合启动配置
     */
    public async executeAggregatedLaunch(configName: string): Promise<void> {
        const config = this.getConfigByName(configName);
        if (!config) {
            throw new Error(this.i18n.localize('aggregated.notFound', configName));
        }

        const enabledItems = config.getEnabledItems();
        if (enabledItems.length === 0) {
            vscode.window.showWarningMessage(this.i18n.localize('aggregated.noEnabledItems', configName));
            return;
        }

        // 显示进度
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: this.i18n.localize('aggregated.executing', configName),
            cancellable: true
        }, async (progress, token) => {
            const totalItems = enabledItems.length;
            
            for (let i = 0; i < enabledItems.length; i++) {
                if (token.isCancellationRequested) {
                    break;
                }

                const item = enabledItems[i];
                const progressPercent = ((i + 1) / totalItems) * 100;
                
                progress.report({
                    increment: i === 0 ? progressPercent : (100 / totalItems),
                    message: this.i18n.localize('aggregated.launching', item.name, i + 1, totalItems)
                });

                try {
                    // 如果设置了延迟，等待指定时间
                    if (item.delay && item.delay > 0) {
                        await new Promise(resolve => setTimeout(resolve, item.delay));
                    }

                    // 执行启动配置
                    const success = await vscode.debug.startDebugging(
                        vscode.workspace.workspaceFolders![0],
                        item.name
                    );

                    if (!success) {
                        throw new Error(this.i18n.localize('aggregated.launchFailed', item.name));
                    }

                } catch (error) {
                    const errorMessage = this.i18n.localize('aggregated.launchFailed', item.name, error);
                    console.error(errorMessage);
                    
                    const action = await vscode.window.showErrorMessage(
                        errorMessage,
                        this.i18n.localize('aggregated.continue'),
                        this.i18n.localize('aggregated.stop')
                    );
                    
                    if (action === this.i18n.localize('aggregated.stop')) {
                        break;
                    }
                }
            }
        });
    }

    /**
     * 执行单个启动配置
     */
    private async executeLaunchConfig(configName: string): Promise<void> {
        try {
            // 获取工作区文件夹
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                throw new Error(this.i18n.localize('workspace.folderNotFound'));
            }
            
            // 使用VS Code的调试API启动配置，传入正确的工作区文件夹
            const success = await vscode.debug.startDebugging(workspaceFolder, configName);
            if (!success) {
                throw new Error(this.i18n.localize('config.launchNotFoundOrFailed', configName));
            }
        } catch (error) {
            throw new Error(this.i18n.localize('config.executeLaunchFailed', error));
        }
    }

    /**
     * 获取可用的启动配置列表
     */
    public async getAvailableLaunchConfigs(): Promise<string[]> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            console.warn('未找到工作区文件夹');
            return [];
        }

        const launchJsonPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'launch.json');
        console.log('尝试读取launch.json路径:', launchJsonPath);
        
        try {
            const exists = await this.fileSystemManager.exists(launchJsonPath);
            console.log('launch.json文件是否存在:', exists);
            
            if (exists) {
                const content = await this.fileSystemManager.readFile(launchJsonPath);
                console.log('launch.json文件内容长度:', content.length);
                
                const launchJson = JSON.parse(content);
                const configurations = launchJson.configurations || [];
                console.log('找到的启动配置数量:', configurations.length);
                
                const configNames = configurations
                    .map((config: any) => config.name)
                    .filter((name: string) => name && name.trim().length > 0);
                
                console.log('有效的配置名称:', configNames);
                return configNames;
            } else {
                console.warn('launch.json文件不存在于路径:', launchJsonPath);
            }
        } catch (error) {
            console.error('读取launch.json失败:', error);
            vscode.window.showErrorMessage(this.i18n.localize('config.readLaunchJsonFailed', error));
        }

        return [];
    }

    /**
     * 验证启动配置是否存在
     */
    public async validateLaunchConfig(configName: string): Promise<boolean> {
        const availableConfigs = await this.getAvailableLaunchConfigs();
        const exists = availableConfigs.includes(configName);
        console.log(`验证启动配置 "${configName}":`, exists ? '存在' : '不存在');
        console.log('可用的启动配置:', availableConfigs);
        return exists;
    }

    /**
     * 获取launch.json的完整内容（用于调试）
     */
    public async getLaunchJsonContent(): Promise<any> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error(this.i18n.localize('workspace.folderNotFound'));
        }

        const launchJsonPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'launch.json');
        
        if (await this.fileSystemManager.exists(launchJsonPath)) {
            const content = await this.fileSystemManager.readFile(launchJsonPath);
            return JSON.parse(content);
        } else {
            throw new Error(this.i18n.localize('config.launchJsonNotFoundPath', launchJsonPath));
        }
    }
} 