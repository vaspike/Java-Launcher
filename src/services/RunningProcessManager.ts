import * as vscode from 'vscode';
import { JavaEntry } from '../models/JavaEntry';

/**
 * 运行中的Java进程信息
 */
export interface RunningJavaProcess {
    id: string;              // 唯一标识符
    name: string;            // 显示名称
    debugSession: vscode.DebugSession;  // VS Code调试会话
    startTime: Date;         // 启动时间
    javaEntry?: JavaEntry;   // 关联的Java入口点（如果有）
    isAggregated: boolean;   // 是否为聚合配置
}

/**
 * 运行中进程管理器
 */
export class RunningProcessManager {
    private static instance: RunningProcessManager;
    private runningProcesses: Map<string, RunningJavaProcess> = new Map();
    private _onDidChangeProcesses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeProcesses: vscode.Event<void> = this._onDidChangeProcesses.event;

    // 私有构造函数，使用单例模式
    private constructor() {
        // 监听调试会话开始事件
        vscode.debug.onDidStartDebugSession(session => {
            // 仅处理Java类型的调试会话
            if (session.type === 'java') {
                this.addProcess(session);
            }
        });

        // 监听调试会话结束事件
        vscode.debug.onDidTerminateDebugSession(session => {
            this.removeProcess(session);
        });

        // 初始化时加载当前活动的会话
        this.loadActiveSessions();
    }

    /**
     * 获取单例实例
     */
    public static getInstance(): RunningProcessManager {
        if (!RunningProcessManager.instance) {
            RunningProcessManager.instance = new RunningProcessManager();
        }
        return RunningProcessManager.instance;
    }

         /**
     * 加载当前活动的调试会话
     */
    private loadActiveSessions(): void {
        // 获取当前活动的调试会话
        if (vscode.debug.activeDebugSession) {
            if (vscode.debug.activeDebugSession.type === 'java') {
                this.addProcess(vscode.debug.activeDebugSession);
            }
        }
    }

    /**
     * 添加进程
     */
    private addProcess(session: vscode.DebugSession): void {
        const id = session.id;
        const name = session.name;
        
        // 检查是否已存在
        if (!this.runningProcesses.has(id)) {
            const process: RunningJavaProcess = {
                id,
                name,
                debugSession: session,
                startTime: new Date(),
                isAggregated: name.includes('Aggregated')
            };
            
            this.runningProcesses.set(id, process);
            this._onDidChangeProcesses.fire();
        }
    }

    /**
     * 移除进程
     */
    private removeProcess(session: vscode.DebugSession): void {
        if (this.runningProcesses.has(session.id)) {
            this.runningProcesses.delete(session.id);
            this._onDidChangeProcesses.fire();
        }
    }

    /**
     * 获取所有运行中的进程
     */
    public getRunningProcesses(): RunningJavaProcess[] {
        return Array.from(this.runningProcesses.values());
    }

    /**
     * 停止指定进程
     */
    public async stopProcess(processId: string): Promise<boolean> {
        const process = this.runningProcesses.get(processId);
        if (!process) {
            return false;
        }

        try {
            await vscode.debug.stopDebugging(process.debugSession);
            return true;
        } catch (error) {
            console.error('停止进程失败:', error);
            return false;
        }
    }

    /**
     * 停止所有进程
     */
    public async stopAllProcesses(): Promise<boolean> {
        try {
            const promises = Array.from(this.runningProcesses.values()).map(
                process => vscode.debug.stopDebugging(process.debugSession)
            );
            await Promise.all(promises);
            return true;
        } catch (error) {
            console.error('停止所有进程失败:', error);
            return false;
        }
    }

         /**
     * 重启指定进程
     */
    public async restartProcess(processId: string): Promise<boolean> {
        const process = this.runningProcesses.get(processId);
        if (!process) {
            return false;
        }

        try {
            // 获取当前进程的配置信息
            const config = process.debugSession.configuration;
            if (!config) {
                console.error('无法获取进程配置信息');
                return false;
            }
            
            // 先停止进程
            await vscode.debug.stopDebugging(process.debugSession);
            
            // 等待进程完全停止
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 使用原始配置重新启动
            const folder = vscode.workspace.workspaceFolders?.[0];
            await vscode.debug.startDebugging(folder, config);
            return true;
        } catch (error) {
            console.error('重启进程失败:', error);
            return false;
        }
    }

    /**
     * 重启所有进程
     */
    public async restartAllProcesses(): Promise<boolean> {
        try {
            // 保存所有进程的配置
            const processConfigs = Array.from(this.runningProcesses.values()).map(p => ({
                config: p.debugSession.configuration,
                name: p.name
            }));
            
            // 过滤掉没有配置的进程
            const validProcesses = processConfigs.filter(p => p.config);
            
            if (validProcesses.length === 0) {
                console.error('没有找到有效的进程配置');
                return false;
            }
            
            // 停止所有进程
            await this.stopAllProcesses();
            
            // 等待进程完全停止
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 重新启动所有进程
            const folder = vscode.workspace.workspaceFolders?.[0];
            for (const proc of validProcesses) {
                try {
                    await vscode.debug.startDebugging(folder, proc.config);
                } catch (err) {
                    console.error(`重启进程 ${proc.name} 失败:`, err);
                }
            }
            return true;
        } catch (error) {
            console.error('重启所有进程失败:', error);
            return false;
        }
    }
} 