import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { JavaEntry } from '../models/JavaEntry';
import { FileSystemManager } from './FileSystemManager';
import { I18nService } from './I18nService';

/**
 * 最近启动记录项
 */
export interface LaunchHistoryItem {
    className: string;
    methodName?: string;
    lastLaunchTime: number;
    launchCount: number;
}

/**
 * 最近启动管理器
 */
export class RecentLaunchManager {
    private fileSystemManager: FileSystemManager;
    private historyFilePath: string;
    private launchHistory: LaunchHistoryItem[] = [];
    private i18n: I18nService;

    constructor() {
        this.fileSystemManager = new FileSystemManager();
        this.historyFilePath = this.getHistoryFilePath();
        this.i18n = I18nService.getInstance();
    }

    /**
     * 获取历史记录文件路径
     */
    private getHistoryFilePath(): string {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error(this.i18n.localize('workspace.notFound'));
        }
        
        const vscodeDir = path.join(workspaceFolder.uri.fsPath, '.vscode');
        return path.join(vscodeDir, 'java-launch-history.json');
    }

    /**
     * 加载历史记录
     */
    public async loadHistory(): Promise<LaunchHistoryItem[]> {
        try {
            if (await this.fileSystemManager.exists(this.historyFilePath)) {
                const content = await this.fileSystemManager.readFile(this.historyFilePath);
                const jsonData = JSON.parse(content);
                
                this.launchHistory = jsonData.history || [];
            }
            
            console.log(this.i18n.localize('recent.historyLoaded'));
            return this.launchHistory;
        } catch (error) {
            console.error(this.i18n.localize('recent.loadHistoryFailed', error));
            this.launchHistory = [];
            return this.launchHistory;
        }
    }

    /**
     * 保存历史记录
     */
    public async saveHistory(): Promise<void> {
        try {
            // 确保.vscode目录存在
            const vscodeDir = path.dirname(this.historyFilePath);
            if (!(await this.fileSystemManager.exists(vscodeDir))) {
                await this.fileSystemManager.ensureDirectoryExists(vscodeDir);
            }

            const historyData = {
                version: '1.0.0',
                history: this.launchHistory
            };

            await this.fileSystemManager.writeFile(
                this.historyFilePath,
                JSON.stringify(historyData, null, 2)
            );
            
            console.log(this.i18n.localize('recent.historySaved'));
        } catch (error) {
            console.error(this.i18n.localize('recent.saveHistoryFailed', error));
        }
    }

    /**
     * 记录Java入口点启动
     */
    public async recordLaunch(javaEntry: JavaEntry): Promise<void> {
        await this.loadHistory();
        
        const identifier = javaEntry.getFullIdentifier();
        const index = this.launchHistory.findIndex(
            item => item.className === javaEntry.className && 
                   item.methodName === javaEntry.methodName
        );

        if (index !== -1) {
            // 更新现有记录
            this.launchHistory[index].lastLaunchTime = Date.now();
            this.launchHistory[index].launchCount++;
        } else {
            // 添加新记录
            this.launchHistory.push({
                className: javaEntry.className,
                methodName: javaEntry.methodName,
                lastLaunchTime: Date.now(),
                launchCount: 1
            });
        }

        // 保存历史记录
        await this.saveHistory();
    }

    /**
     * 获取Java入口点的启动信息
     */
    public async getLaunchInfo(className: string, methodName?: string): Promise<LaunchHistoryItem | null> {
        await this.loadHistory();
        
        const item = this.launchHistory.find(
            item => item.className === className && item.methodName === methodName
        );

        return item || null;
    }

    /**
     * 获取按最近启动时间排序的历史记录
     */
    public async getRecentLaunches(limit?: number): Promise<LaunchHistoryItem[]> {
        await this.loadHistory();
        
        // 按最近启动时间排序
        const sorted = [...this.launchHistory].sort(
            (a, b) => b.lastLaunchTime - a.lastLaunchTime
        );

        return limit ? sorted.slice(0, limit) : sorted;
    }

    /**
     * 更新launch.json配置顺序，按最近启动时间排序
     */
    public async updateLaunchJsonOrder(): Promise<void> {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                throw new Error(this.i18n.localize('workspace.folderNotFound'));
            }
            
            const launchJsonPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'launch.json');
            
            // 如果launch.json不存在，直接返回
            if (!(await this.fileSystemManager.exists(launchJsonPath))) {
                return;
            }
            
            // 读取launch.json
            const content = await this.fileSystemManager.readFile(launchJsonPath);
            const launchJson = JSON.parse(content);
            
            if (!launchJson.configurations || !Array.isArray(launchJson.configurations)) {
                return;
            }
            
            // 按最近启动时间给configurations排序
            launchJson.configurations.sort((a: any, b: any) => {
                const aIndex = this.launchHistory.findIndex(
                    item => item.className === a.mainClass && 
                            (a.testClass ? item.methodName === a.testClass : true)
                );
                
                const bIndex = this.launchHistory.findIndex(
                    item => item.className === b.mainClass && 
                            (b.testClass ? item.methodName === b.testClass : true)
                );
                
                // 如果找不到，排在后面
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;
                
                // 按最近启动时间排序
                return this.launchHistory[bIndex].lastLaunchTime - this.launchHistory[aIndex].lastLaunchTime;
            });
            
            // 保存更新后的launch.json
            await this.fileSystemManager.writeFile(
                launchJsonPath, 
                JSON.stringify(launchJson, null, 4)
            );
            
            console.log(this.i18n.localize('recent.launchJsonOrderUpdated'));
        } catch (error) {
            console.error(this.i18n.localize('recent.updateLaunchJsonOrderFailed', error));
        }
    }
} 