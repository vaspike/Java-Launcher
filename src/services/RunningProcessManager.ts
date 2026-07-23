import * as vscode from 'vscode';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { JavaEntry } from '../models/JavaEntry';
import { I18nService } from './I18nService';

const execFileAsync = promisify(execFile);

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
    pid?: number;            // JVM 进程 ID
    shellProcessId?: number; // 终端 shell 进程 ID（integratedTerminal 常见）
}

/**
 * 运行中进程管理器
 *
 * integratedTerminal 下 vscode.debug.stopDebugging 往往只结束调试会话，
 * 不会可靠杀掉终端里的 JVM。需要监听 processid 事件拿到 PID 后强制终止。
 */
export class RunningProcessManager {
    private static instance: RunningProcessManager;
    private runningProcesses: Map<string, RunningJavaProcess> = new Map();
    private _onDidChangeProcesses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeProcesses: vscode.Event<void> = this._onDidChangeProcesses.event;
    private i18n: I18nService;

    private constructor() {
        this.i18n = I18nService.getInstance();

        vscode.debug.onDidStartDebugSession(session => {
            if (session.type === 'java') {
                this.addProcess(session);
            }
        });

        vscode.debug.onDidTerminateDebugSession(session => {
            this.removeProcess(session);
        });

        // Java debugger 上报 PID：
        // - 有的版本: event === 'processid'
        // - 有的版本: body.type === 'processid'（Spring Boot Tools 使用此格式）
        // body 可能只有 shellProcessId（终端启动），不一定有 processId
        vscode.debug.onDidReceiveDebugSessionCustomEvent(event => {
            if (event.session.type !== 'java') {
                return;
            }
            if (!this.isProcessIdEvent(event)) {
                return;
            }
            void this.handleProcessIdEvent(event.session, event.body);
        });

        this.loadActiveSessions();
    }

    public static getInstance(): RunningProcessManager {
        if (!RunningProcessManager.instance) {
            RunningProcessManager.instance = new RunningProcessManager();
        }
        return RunningProcessManager.instance;
    }

    private isProcessIdEvent(event: vscode.DebugSessionCustomEvent): boolean {
        if (event.event === 'processid' || event.event === 'processId') {
            return true;
        }
        const bodyType = event.body?.type;
        return bodyType === 'processid' || bodyType === 'processId';
    }

    private async handleProcessIdEvent(session: vscode.DebugSession, body: any): Promise<void> {
        const shellProcessId = this.parsePositiveInt(body?.shellProcessId);
        let pid = this.parsePositiveInt(body?.processId);

        if (!pid && shellProcessId) {
            pid = await this.findJavaChildPid(shellProcessId);
        }

        this.ensureProcess(session);
        const processInfo = this.runningProcesses.get(session.id);
        if (!processInfo) {
            return;
        }

        if (pid) {
            processInfo.pid = pid;
        }
        if (shellProcessId) {
            processInfo.shellProcessId = shellProcessId;
        }
        this._onDidChangeProcesses.fire();
        console.log(`[java-launcher] tracked process session=${session.id} name=${session.name} pid=${processInfo.pid} shell=${processInfo.shellProcessId}`);
    }

    private parsePositiveInt(value: unknown): number | undefined {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        const n = typeof value === 'number' ? value : parseInt(String(value), 10);
        if (Number.isNaN(n) || n <= 0) {
            return undefined;
        }
        return n;
    }

    /**
     * 在 shell 子进程树中查找 Java 进程
     */
    private async findJavaChildPid(shellProcessId: number): Promise<number | undefined> {
        try {
            const descendants = await this.listDescendantPids(shellProcessId);
            if (descendants.length === 0) {
                return undefined;
            }

            // 优先匹配 java / javaw 进程
            const commands = await this.getProcessCommands(descendants);
            const javaPid = commands.find(c => /(^|\/)java(w)?(\s|$)/i.test(c.command) || /org\.springframework\.boot|\.jar/i.test(c.command))?.pid;
            if (javaPid) {
                return javaPid;
            }

            // 找不到明确 java 时，取最深层子进程
            return descendants[descendants.length - 1];
        } catch (error) {
            console.warn('[java-launcher] findJavaChildPid failed:', error);
            return undefined;
        }
    }

    private async listDescendantPids(rootPid: number): Promise<number[]> {
        // 使用 ps 构建整棵子树，兼容 macOS / Linux
        const { stdout } = await execFileAsync('ps', ['-axo', 'pid=,ppid=']);
        const childrenMap = new Map<number, number[]>();

        for (const line of stdout.split('\n')) {
            const parts = line.trim().split(/\s+/);
            if (parts.length < 2) {
                continue;
            }
            const pid = parseInt(parts[0], 10);
            const ppid = parseInt(parts[1], 10);
            if (Number.isNaN(pid) || Number.isNaN(ppid)) {
                continue;
            }
            const list = childrenMap.get(ppid) || [];
            list.push(pid);
            childrenMap.set(ppid, list);
        }

        const result: number[] = [];
        const queue = [...(childrenMap.get(rootPid) || [])];
        while (queue.length > 0) {
            const current = queue.shift()!;
            result.push(current);
            const kids = childrenMap.get(current);
            if (kids) {
                queue.push(...kids);
            }
        }
        return result;
    }

    private async getProcessCommands(pids: number[]): Promise<Array<{ pid: number; command: string }>> {
        if (pids.length === 0) {
            return [];
        }
        try {
            const { stdout } = await execFileAsync('ps', ['-o', 'pid=,command=', '-p', pids.join(',')]);
            return stdout
                .split('\n')
                .map(line => line.trim())
                .filter(Boolean)
                .map(line => {
                    const match = line.match(/^(\d+)\s+(.*)$/);
                    if (!match) {
                        return undefined;
                    }
                    return { pid: parseInt(match[1], 10), command: match[2] };
                })
                .filter((item): item is { pid: number; command: string } => !!item && !Number.isNaN(item.pid));
        } catch {
            return pids.map(pid => ({ pid, command: '' }));
        }
    }

    private loadActiveSessions(): void {
        if (vscode.debug.activeDebugSession?.type === 'java') {
            this.addProcess(vscode.debug.activeDebugSession);
        }
    }

    private ensureProcess(session: vscode.DebugSession): void {
        if (!this.runningProcesses.has(session.id)) {
            this.addProcess(session);
        }
    }

    private addProcess(session: vscode.DebugSession): void {
        const id = session.id;
        if (this.runningProcesses.has(id)) {
            return;
        }

        const processInfo: RunningJavaProcess = {
            id,
            name: session.name,
            debugSession: session,
            startTime: new Date(),
            isAggregated: session.name.includes('Aggregated')
        };

        this.runningProcesses.set(id, processInfo);
        this._onDidChangeProcesses.fire();
    }

    private removeProcess(session: vscode.DebugSession): void {
        if (this.runningProcesses.has(session.id)) {
            this.runningProcesses.delete(session.id);
            this._onDidChangeProcesses.fire();
        }
    }

    public getRunningProcesses(): RunningJavaProcess[] {
        return Array.from(this.runningProcesses.values());
    }

    /**
     * 尝试通过 DAP 请求补齐 PID
     */
    private async resolvePid(running: RunningJavaProcess): Promise<number | undefined> {
        if (running.pid && running.pid > 0) {
            return running.pid;
        }

        // 1) DAP processId 请求（java-debug API）
        try {
            const response = await running.debugSession.customRequest('processId');
            const pid = this.parsePositiveInt(response?.processId ?? response);
            if (pid) {
                running.pid = pid;
                return pid;
            }
        } catch {
            // 部分版本不支持
        }

        // 2) 从 shell 子进程树查找
        if (running.shellProcessId) {
            const childPid = await this.findJavaChildPid(running.shellProcessId);
            if (childPid) {
                running.pid = childPid;
                return childPid;
            }
        }

        // 3) 按 mainClass 兜底查找
        const mainClass = running.debugSession.configuration?.mainClass;
        if (typeof mainClass === 'string' && mainClass.length > 0) {
            const pid = await this.findPidByMainClass(mainClass);
            if (pid) {
                running.pid = pid;
                return pid;
            }
        }

        return undefined;
    }

    private async findPidByMainClass(mainClass: string): Promise<number | undefined> {
        try {
            const { stdout } = await execFileAsync('jps', ['-l']);
            const simpleName = mainClass.includes('.') ? mainClass.substring(mainClass.lastIndexOf('.') + 1) : mainClass;
            for (const line of stdout.split('\n')) {
                const trimmed = line.trim();
                if (!trimmed) {
                    continue;
                }
                const match = trimmed.match(/^(\d+)\s+(\S+)/);
                if (!match) {
                    continue;
                }
                const pid = parseInt(match[1], 10);
                const name = match[2];
                if (name === mainClass || name.endsWith(mainClass) || name.endsWith(simpleName)) {
                    return pid;
                }
            }
        } catch (error) {
            console.warn('[java-launcher] jps lookup failed:', error);
        }
        return undefined;
    }

    private isProcessAlive(pid: number): boolean {
        try {
            process.kill(pid, 0);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 强制终止目标 PID 及其子进程树
     */
    private async forceKillProcessTree(pid: number): Promise<void> {
        let targets: number[] = [pid];
        try {
            const descendants = await this.listDescendantPids(pid);
            targets = [...descendants.reverse(), pid];
        } catch {
            targets = [pid];
        }

        for (const target of targets) {
            try {
                process.kill(target, 'SIGTERM');
            } catch {
                // 已退出
            }
        }

        await new Promise(resolve => setTimeout(resolve, 400));

        for (const target of targets) {
            if (!this.isProcessAlive(target)) {
                continue;
            }
            try {
                process.kill(target, 'SIGKILL');
            } catch {
                // ignore
            }
            // 进程组兜底（负 PID）
            try {
                process.kill(-target, 'SIGKILL');
            } catch {
                // ignore
            }
        }
    }

    /**
     * 停止调试会话并尽量确保 JVM 被终止
     */
    private async terminateSession(running: RunningJavaProcess): Promise<void> {
        const pid = await this.resolvePid(running);
        const shellPid = running.shellProcessId;

        console.log(`[java-launcher] stopping session=${running.id} name=${running.name} pid=${pid} shell=${shellPid}`);

        // 先杀 JVM / shell，再结束 debug session
        if (pid) {
            await this.forceKillProcessTree(pid);
        } else if (shellPid) {
            await this.forceKillProcessTree(shellPid);
        }

        try {
            await running.debugSession.customRequest('disconnect', {
                restart: false,
                terminateDebuggee: true
            });
        } catch {
            // 忽略
        }

        try {
            await vscode.debug.stopDebugging(running.debugSession);
        } catch {
            // 会话可能已结束
        }

        // 最终确认：若仍存活再杀一次
        const finalPid = running.pid || pid;
        if (finalPid && this.isProcessAlive(finalPid)) {
            await this.forceKillProcessTree(finalPid);
        } else if (shellPid && this.isProcessAlive(shellPid)) {
            await this.forceKillProcessTree(shellPid);
        }
    }

    public async stopProcess(processId: string): Promise<boolean> {
        const processInfo = this.runningProcesses.get(processId);
        if (!processInfo) {
            return false;
        }

        try {
            await this.terminateSession(processInfo);
            return true;
        } catch (error) {
            console.error('[java-launcher] 停止进程失败:', error);
            return false;
        }
    }

    public async stopAllProcesses(): Promise<boolean> {
        try {
            const processes = Array.from(this.runningProcesses.values());
            await Promise.all(processes.map(p => this.terminateSession(p)));
            return true;
        } catch (error) {
            console.error('[java-launcher] 停止所有进程失败:', error);
            return false;
        }
    }

    public async restartProcess(processId: string): Promise<boolean> {
        const processInfo = this.runningProcesses.get(processId);
        if (!processInfo) {
            return false;
        }

        try {
            const config = processInfo.debugSession.configuration;
            if (!config) {
                console.error(this.i18n.localize('process.cannotGetConfig'));
                return false;
            }

            await this.terminateSession(processInfo);
            await new Promise(resolve => setTimeout(resolve, 1000));

            const folder = vscode.workspace.workspaceFolders?.[0];
            await vscode.debug.startDebugging(folder, config);
            return true;
        } catch (error) {
            console.error(this.i18n.localize('process.restartFailed.single', processInfo.name), error);
            return false;
        }
    }

    public async restartAllProcesses(): Promise<boolean> {
        try {
            const processConfigs = Array.from(this.runningProcesses.values()).map(p => ({
                config: p.debugSession.configuration,
                name: p.name
            }));

            const validProcesses = processConfigs.filter(p => p.config);
            if (validProcesses.length === 0) {
                console.error(this.i18n.localize('process.noValidConfigs'));
                return false;
            }

            await this.stopAllProcesses();
            await new Promise(resolve => setTimeout(resolve, 1000));

            const folder = vscode.workspace.workspaceFolders?.[0];
            for (const proc of validProcesses) {
                try {
                    await vscode.debug.startDebugging(folder, proc.config);
                } catch (err) {
                    console.error(this.i18n.localize('process.restartFailedSingle', proc.name, err));
                }
            }
            return true;
        } catch (error) {
            console.error(this.i18n.localize('process.restartAllFailed', error));
            return false;
        }
    }
}
