// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ProjectScanner } from './services/ProjectScanner';
import { LaunchConfigGenerator } from './services/LaunchConfigGenerator';
import { AggregatedLaunchManager } from './services/AggregatedLaunchManager';
import { ProjectInfo } from './models/ProjectInfo';
import { AggregatedLaunchItem, AggregatedLaunchConfig } from './models/AggregatedLaunchConfig';
import { JavaLauncherTreeDataProvider, JavaLauncherTreeItem } from './views/JavaLauncherTreeDataProvider';
import { JavaEntry, JavaEntryType } from './models/JavaEntry';
import { FileSystemManager } from './services/FileSystemManager';
import { RecentLaunchManager } from './services/RecentLaunchManager';
import { RunningProcessManager, RunningJavaProcess } from './services/RunningProcessManager';
import { I18nService } from './services/I18nService';
import * as path from 'path';

// 初始化国际化服务
const i18n = I18nService.getInstance();

/**
 * 插件激活函数
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Java Launcher 插件已激活');

    // 创建服务实例
    const projectScanner = new ProjectScanner();
    const launchConfigGenerator = new LaunchConfigGenerator();
    const aggregatedLaunchManager = new AggregatedLaunchManager();
    const recentLaunchManager = new RecentLaunchManager();

    // 创建Tree View Provider
    const treeDataProvider = new JavaLauncherTreeDataProvider(projectScanner, aggregatedLaunchManager, recentLaunchManager);
    const treeView = vscode.window.createTreeView('javaLauncherView', {
        treeDataProvider: treeDataProvider,
        showCollapseAll: true
    });
    


    // 注册命令：生成启动配置
    const generateLaunchConfigsCommand = vscode.commands.registerCommand(
        'java-launcher.generateLaunchConfigs',
        async () => {
            try {
                await generateLaunchConfigs(projectScanner, launchConfigGenerator);
            } catch (error) {
                vscode.window.showErrorMessage(`${i18n.localize('command.generateConfigs')} ${i18n.localize('common.failed')}: ${error}`);
                console.error('生成启动配置失败:', error);
            }
        }
    );

    // 注册命令：扫描 Java 入口点
    const scanJavaEntriesCommand = vscode.commands.registerCommand(
        'java-launcher.scanJavaEntries',
        async () => {
            try {
                await scanAndShowJavaEntries(projectScanner);
            } catch (error) {
                vscode.window.showErrorMessage(`${i18n.localize('command.scanEntries')} ${i18n.localize('common.failed')}: ${error}`);
                console.error('扫描 Java 入口点失败:', error);
            }
        }
    );

    // 注册命令：创建聚合启动配置
    const createAggregatedLaunchCommand = vscode.commands.registerCommand(
        'java-launcher.createAggregatedLaunch',
        async () => {
            try {
                await createAggregatedLaunchConfig(aggregatedLaunchManager);
            } catch (error) {
                vscode.window.showErrorMessage(`${i18n.localize('command.createAggregated')} ${i18n.localize('common.failed')}: ${error}`);
                console.error('创建聚合启动配置失败:', error);
            }
        }
    );

    // 注册命令：管理聚合启动配置
    const manageAggregatedLaunchCommand = vscode.commands.registerCommand(
        'java-launcher.manageAggregatedLaunch',
        async () => {
            try {
                await manageAggregatedLaunchConfigs(aggregatedLaunchManager);
            } catch (error) {
                vscode.window.showErrorMessage(`${i18n.localize('command.manageAggregated')} ${i18n.localize('common.failed')}: ${error}`);
                console.error('管理聚合启动配置失败:', error);
            }
        }
    );

    // 注册命令：执行聚合启动配置
    const executeAggregatedLaunchCommand = vscode.commands.registerCommand(
        'java-launcher.executeAggregatedLaunch',
        async () => {
            try {
                await executeAggregatedLaunchConfig(aggregatedLaunchManager);
            } catch (error) {
                vscode.window.showErrorMessage(`${i18n.localize('command.executeAggregated')} ${i18n.localize('common.failed')}: ${error}`);
                console.error('执行聚合启动配置失败:', error);
            }
        }
    );

    // 注册命令：调试聚合启动配置
    const debugAggregatedLaunchCommand = vscode.commands.registerCommand(
        'java-launcher.debugAggregatedLaunch',
        async () => {
            try {
                await debugAggregatedLaunchConfig(aggregatedLaunchManager);
            } catch (error) {
                vscode.window.showErrorMessage(`${i18n.localize('command.debugAggregated')} ${i18n.localize('common.failed')}: ${error}`);
                console.error('调试聚合启动配置失败:', error);
            }
        }
    );

    // 注册命令：显示所有命令
    const showAllCommandsCommand = vscode.commands.registerCommand(
        'java-launcher.showAllCommands',
        async () => {
            try {
                await showAllJavaLauncherCommands();
            } catch (error) {
                vscode.window.showErrorMessage(`${i18n.localize('command.showAllCommands')} ${i18n.localize('common.failed')}: ${error}`);
                console.error('显示命令列表失败:', error);
            }
        }
    );

    // 注册命令：设置Spring Profile
    const setSpringProfileCommand = vscode.commands.registerCommand(
        'java-launcher.setSpringProfile',
        async (javaEntryOrTreeItem?: JavaEntry | JavaLauncherTreeItem) => {
            try {
                await setSpringActiveProfile(javaEntryOrTreeItem, treeDataProvider);
            } catch (error) {
                vscode.window.showErrorMessage(`${i18n.localize('command.setSpringProfile')} ${i18n.localize('common.failed')}: ${error}`);
                console.error('设置Spring Profile失败:', error);
            }
        }
    );

    // 注册命令：批量设置所有Spring Boot应用的Profile
    const setAllSpringProfilesCommand = vscode.commands.registerCommand(
        'java-launcher.setAllSpringProfiles',
        async () => {
            try {
                await setAllSpringBootProfiles(treeDataProvider);
            } catch (error) {
                vscode.window.showErrorMessage(`${i18n.localize('command.setAllSpringProfiles')} ${i18n.localize('common.failed')}: ${error}`);
                console.error('批量设置Spring Profile失败:', error);
            }
        }
    );

    // 注册命令：设置所有启动配置的JMX远程管理状态
    const setAllJmxRemoteStatusCommand = vscode.commands.registerCommand(
        'java-launcher.setAllJmxRemoteStatus',
        async () => {
            try {
                await setAllJmxRemoteStatus();
            } catch (error) {
                vscode.window.showErrorMessage(`${i18n.localize('command.setAllJmxRemoteStatus')} ${i18n.localize('common.failed')}: ${error}`);
                console.error('设置JMX远程管理状态失败:', error);
            }
        }
    );

    // 注册搜索命令
    const searchJavaEntriesCommand = vscode.commands.registerCommand(
        'java-launcher.searchAndRun',
        async () => {
            try {
                await searchJavaEntries(treeDataProvider);
            } catch (error) {
                const i18n = I18nService.getInstance();
                vscode.window.showErrorMessage(i18n.localize('search.failed', error));
                console.error(i18n.localize('search.failed', error), error);
            }
        }
    );

    // 注册管理运行中Java进程的命令
    const manageRunningProcessesCommand = vscode.commands.registerCommand(
        'java-launcher.manageRunningProcesses',
        async () => {
            try {
                await manageRunningJavaProcesses();
            } catch (error) {
                const i18n = I18nService.getInstance();
                vscode.window.showErrorMessage(`${i18n.localize('process.manage')} ${i18n.localize('common.failed')}: ${error}`);
                console.error(`${i18n.localize('process.manage')} ${i18n.localize('common.failed')}:`, error);
            }
        }
    );

    // Tree View视图状态
    const treeViewState = {
        searchActive: false
    };

    // 设置上下文
    vscode.commands.executeCommand('setContext', 'java-launcher.searchEnabled', true);

    // 注册Tree View相关命令
            const runJavaEntryCommand = vscode.commands.registerCommand(
        'java-launcher.runJavaEntry',
        async (javaEntryOrTreeItem: JavaEntry | JavaLauncherTreeItem) => {
            try {
                let javaEntry: JavaEntry;
                
                // 判断传入的是TreeItem还是直接的JavaEntry对象
                if ('itemType' in javaEntryOrTreeItem) {
                    // 这是TreeItem对象，从data属性获取JavaEntry
                    javaEntry = (javaEntryOrTreeItem as JavaLauncherTreeItem).data;
                } else {
                    // 这是直接的JavaEntry对象
                    javaEntry = javaEntryOrTreeItem as JavaEntry;
                }
                
                if (!javaEntry || !javaEntry.className) {
                    vscode.window.showErrorMessage('Java入口点无效，请重新选择');
                    return;
                }
                await runJavaEntryFromTree(javaEntry, launchConfigGenerator, projectScanner);
                
                // 更新TreeDataProvider中的启动历史
                await treeDataProvider.recordLaunch(javaEntry);
            } catch (error) {
                vscode.window.showErrorMessage(`${i18n.localize('command.runJavaEntry')} ${i18n.localize('common.failed')}: ${error}`);
                console.error('运行Java入口点失败:', error);
            }
        }
    );

    const runAggregatedConfigCommand = vscode.commands.registerCommand(
        'java-launcher.runAggregatedConfig',
        async (configOrTreeItem: AggregatedLaunchConfig | JavaLauncherTreeItem) => {
            try {
                let config: AggregatedLaunchConfig;
                
                // 判断传入的是TreeItem还是直接的配置对象
                if ('itemType' in configOrTreeItem) {
                    // 这是TreeItem对象，从data属性获取配置
                    config = (configOrTreeItem as JavaLauncherTreeItem).data;
                } else {
                    // 这是直接的配置对象
                    config = configOrTreeItem as AggregatedLaunchConfig;
                }
                
                if (!config || !config.name) {
                    vscode.window.showErrorMessage('聚合启动配置无效，请重新选择');
                    return;
                }
                await aggregatedLaunchManager.executeAggregatedLaunch(config.name);
            } catch (error) {
                vscode.window.showErrorMessage(`${i18n.localize('command.runAggregatedConfig')} ${i18n.localize('common.failed')}: ${error}`);
                console.error('执行聚合启动失败:', error);
            }
        }
    );

    const refreshTreeViewCommand = vscode.commands.registerCommand(
        'java-launcher.refreshTreeView',
        async () => {
            try {
                await treeDataProvider.reloadData();
                vscode.window.showInformationMessage(i18n.localize('view.refreshed'));
            } catch (error) {
                vscode.window.showErrorMessage(i18n.localize('view.refreshFailed', error));
                console.error('刷新视图失败:', error);
            }
        }
    );

    const addToAggregatedConfigCommand = vscode.commands.registerCommand(
        'java-launcher.addToAggregatedConfig',
        async (javaEntryOrTreeItem: JavaEntry | JavaLauncherTreeItem) => {
            try {
                let javaEntry: JavaEntry;
                
                // 判断传入的是TreeItem还是直接的JavaEntry对象
                if ('itemType' in javaEntryOrTreeItem) {
                    // 这是TreeItem对象，从data属性获取JavaEntry
                    javaEntry = (javaEntryOrTreeItem as JavaLauncherTreeItem).data;
                } else {
                    // 这是直接的JavaEntry对象
                    javaEntry = javaEntryOrTreeItem as JavaEntry;
                }
                
                if (!javaEntry || !javaEntry.className) {
                    vscode.window.showErrorMessage('Java入口点无效，请重新选择');
                    return;
                }
                await addJavaEntryToAggregatedConfig(javaEntry, aggregatedLaunchManager, treeDataProvider);
            } catch (error) {
                vscode.window.showErrorMessage(`${i18n.localize('command.addToAggregatedConfig')} ${i18n.localize('common.failed')}: ${error}`);
                console.error('添加到聚合配置失败:', error);
            }
        }
    );

    // 将命令添加到订阅列表
    context.subscriptions.push(generateLaunchConfigsCommand);
    context.subscriptions.push(scanJavaEntriesCommand);
    context.subscriptions.push(createAggregatedLaunchCommand);
    context.subscriptions.push(manageAggregatedLaunchCommand);
    context.subscriptions.push(executeAggregatedLaunchCommand);
    context.subscriptions.push(debugAggregatedLaunchCommand);
    context.subscriptions.push(runJavaEntryCommand);
    context.subscriptions.push(runAggregatedConfigCommand);
    context.subscriptions.push(refreshTreeViewCommand);
    context.subscriptions.push(addToAggregatedConfigCommand);
    context.subscriptions.push(showAllCommandsCommand);
    context.subscriptions.push(setSpringProfileCommand);
    context.subscriptions.push(setAllSpringProfilesCommand);
    context.subscriptions.push(setAllJmxRemoteStatusCommand);
    context.subscriptions.push(searchJavaEntriesCommand); // 添加搜索命令到订阅
    context.subscriptions.push(manageRunningProcessesCommand); // 添加管理进程命令到订阅
    context.subscriptions.push(treeView);

    // 初始化国际化服务
    const i18n = I18nService.getInstance();
    console.log("当前语言：", i18n.getLocale());

    // 创建状态栏项
    const javaLauncherStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    javaLauncherStatusBarItem.text = '$(debug) Java Launcher';
    javaLauncherStatusBarItem.tooltip = 'Java Launcher';
    javaLauncherStatusBarItem.command = 'java-launcher.showAllCommands';
    javaLauncherStatusBarItem.show();
    context.subscriptions.push(javaLauncherStatusBarItem);


    // 初始化运行中进程管理器
    RunningProcessManager.getInstance();

    // 监听工作区变化
    const workspaceWatcher = vscode.workspace.onDidChangeWorkspaceFolders(() => {
        console.log('工作区文件夹已更改');
        treeDataProvider.reloadData();
    });

    context.subscriptions.push(workspaceWatcher);

    // 监听 Java 文件变化
    const javaFileWatcher = vscode.workspace.createFileSystemWatcher('**/*.java');
    
    javaFileWatcher.onDidCreate(() => {
        console.log('Java 文件已创建');
        // 延迟刷新，避免频繁更新
        setTimeout(() => treeDataProvider.refresh(), 1000);
    });

    javaFileWatcher.onDidDelete(() => {
        console.log('Java 文件已删除');
        // 延迟刷新，避免频繁更新
        setTimeout(() => treeDataProvider.refresh(), 1000);
    });

    javaFileWatcher.onDidChange(() => {
        console.log('Java 文件已修改');
        // 延迟刷新，避免频繁更新
        setTimeout(() => treeDataProvider.refresh(), 2000);
    });

    context.subscriptions.push(javaFileWatcher);

    // 监听聚合启动配置文件变化
    const aggregatedConfigWatcher = vscode.workspace.createFileSystemWatcher('**/.vscode/aggregated-launch.json');
    
    aggregatedConfigWatcher.onDidCreate(() => {
        console.log('聚合启动配置文件已创建');
        treeDataProvider.refresh();
    });

    aggregatedConfigWatcher.onDidChange(() => {
        console.log('聚合启动配置文件已修改');
        treeDataProvider.refresh();
    });

    aggregatedConfigWatcher.onDidDelete(() => {
        console.log('聚合启动配置文件已删除');
        treeDataProvider.refresh();
    });

    context.subscriptions.push(aggregatedConfigWatcher);

    // 显示激活成功消息
    vscode.window.showInformationMessage(i18n.localize('extension.activated'));
}

/**
 * 生成启动配置
 */
async function generateLaunchConfigs(
    projectScanner: ProjectScanner,
    launchConfigGenerator: LaunchConfigGenerator
): Promise<void> {
    const i18n = I18nService.getInstance();
    
    // 检查是否有工作区
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        vscode.window.showWarningMessage(i18n.localize('workspace.openFirst'));
        return;
    }

    // 显示进度条
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: i18n.localize('config.generating'),
        cancellable: true
    }, async (progress, token) => {
        try {
            // 步骤1: 扫描项目
            progress.report({ increment: 0, message: i18n.localize('config.scanningProject') });
            const workspaceRoot = vscode.workspace.workspaceFolders![0].uri.fsPath;
            const projectInfo = await projectScanner.scanProject(workspaceRoot);

            if (token.isCancellationRequested) {
                return;
            }

            // 步骤2: 分析 Java 入口点
            progress.report({ increment: 30, message: i18n.localize('config.analyzingEntries') });
            const javaEntries = projectInfo.getAllJavaEntries();

            if (javaEntries.length === 0) {
                vscode.window.showWarningMessage(i18n.localize('config.noEntries'));
                return;
            }

            if (token.isCancellationRequested) {
                return;
            }

            // 步骤3: 生成启动配置
            progress.report({ increment: 60, message: i18n.localize('config.generating') });
            await launchConfigGenerator.generateConfigs(projectInfo, workspaceRoot);

            if (token.isCancellationRequested) {
                return;
            }

            // 步骤4: 完成
            progress.report({ increment: 100, message: i18n.localize('common.success') });

            // 显示成功消息
            const stats = projectInfo.getStatistics();
            vscode.window.showInformationMessage(
                i18n.localize('config.generateSuccess') + '\n' +
                i18n.localize('config.stats', 
                    stats.totalEntries,
                    stats.springBootApps,
                    stats.javaApplications,
                    stats.testClasses,
                    stats.testMethods
                )
            );

        } catch (error) {
            throw error;
        }
    });
}

/**
 * 扫描并显示 Java 入口点
 */
async function scanAndShowJavaEntries(projectScanner: ProjectScanner): Promise<void> {
    const i18n = I18nService.getInstance();
    
    // 检查是否有工作区
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        vscode.window.showWarningMessage(i18n.localize('workspace.openFirst'));
        return;
    }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: i18n.localize('scan.scanning'),
        cancellable: true
    }, async (progress, token) => {
        try {
            const workspaceRoot = vscode.workspace.workspaceFolders![0].uri.fsPath;
            
            progress.report({ increment: 0, message: i18n.localize('scan.scanningProject') });
            const projectInfo = await projectScanner.scanProject(workspaceRoot);

            if (token.isCancellationRequested) {
                return;
            }

            progress.report({ increment: 100, message: i18n.localize('common.success') });

            // 显示扫描结果
            const javaEntries = projectInfo.getAllJavaEntries();
            const stats = projectInfo.getStatistics();

            if (javaEntries.length === 0) {
                vscode.window.showWarningMessage(i18n.localize('config.noEntries'));
                return;
            }

            // 创建详细的结果信息
            const resultMessage = i18n.localize('config.stats',
                stats.totalEntries,
                stats.springBootApps,
                stats.javaApplications,
                stats.testClasses,
                stats.testMethods
            );

            // 显示结果
            const action = await vscode.window.showInformationMessage(
                i18n.localize('scan.complete', stats.totalEntries),
                i18n.localize('scan.viewDetails'),
                i18n.localize('scan.generateConfig')
            );

            if (action === i18n.localize('scan.viewDetails')) {
                // 在新的文档中显示详细信息
                const doc = await vscode.workspace.openTextDocument({
                    content: resultMessage,
                    language: 'plaintext'
                });
                vscode.window.showTextDocument(doc);
            } else if (action === i18n.localize('scan.generateConfig')) {
                // 直接生成配置
                const launchConfigGenerator = new LaunchConfigGenerator();
                await launchConfigGenerator.generateConfigs(projectInfo, workspaceRoot);
                vscode.window.showInformationMessage(i18n.localize('scan.configGenerated'));
            }

        } catch (error) {
            throw error;
        }
    });
}

/**
 * 创建聚合启动配置
 */
async function createAggregatedLaunchConfig(aggregatedLaunchManager: AggregatedLaunchManager): Promise<void> {
    const i18n = I18nService.getInstance();
    // 加载现有配置
    await aggregatedLaunchManager.loadConfigs();
    
    // 获取可用的启动配置
    console.log('开始获取可用的启动配置...');
    const availableConfigs = await aggregatedLaunchManager.getAvailableLaunchConfigs();
    console.log('获取到的启动配置:', availableConfigs);
    
    if (availableConfigs.length === 0) {
        // 尝试获取launch.json内容进行调试
        try {
            const launchContent = await aggregatedLaunchManager.getLaunchJsonContent();
            console.log('launch.json完整内容:', JSON.stringify(launchContent, null, 2));
            vscode.window.showWarningMessage(
                i18n.localize('config.noConfigs') + '\n' +
                i18n.localize('config.checkConsole')
            );
        } catch (error) {
            console.error('获取launch.json内容失败:', error);
            vscode.window.showWarningMessage(
                i18n.localize('config.readConfigFailed', error) + '\n' +
                i18n.localize('config.ensureConfigFile')
            );
        }
        return;
    }

    // 输入聚合启动配置名称
    const name = await vscode.window.showInputBox({
        prompt: i18n.localize('config.inputNamePrompt'),
        placeHolder: i18n.localize('config.inputNamePlaceholder'),
        validateInput: (value) => {
            if (!value || value.trim().length === 0) {
                return i18n.localize('config.nameEmpty');
            }
            if (aggregatedLaunchManager.getConfigByName(value.trim())) {
                return i18n.localize('config.nameExists');
            }
            return null;
        }
    });

    if (!name) {
        return;
    }

    // 输入描述
    const description = await vscode.window.showInputBox({
        prompt: i18n.localize('config.inputDescriptionPrompt'),
        placeHolder: i18n.localize('config.inputDescriptionPlaceholder')
    });

    // 选择要包含的启动配置
    const selectedConfigs = await vscode.window.showQuickPick(
        availableConfigs.map(config => ({
            label: config,
            picked: false
        })),
        {
            canPickMany: true,
            placeHolder: i18n.localize('config.selectConfigs')
        }
    );

    if (!selectedConfigs || selectedConfigs.length === 0) {
        vscode.window.showWarningMessage(i18n.localize('config.selectAtLeastOne'));
        return;
    }

    // 创建聚合启动项
    const items: AggregatedLaunchItem[] = selectedConfigs.map(config => ({
        name: config.label,
        enabled: true,
        delay: 0
    }));

    try {
        await aggregatedLaunchManager.createConfig(name.trim(), description || '', items);
        vscode.window.showInformationMessage(i18n.localize('config.aggregatedCreated', name));
    } catch (error) {
        throw error;
    }
}

/**
 * 管理聚合启动配置
 */
async function manageAggregatedLaunchConfigs(aggregatedLaunchManager: AggregatedLaunchManager): Promise<void> {
    const i18n = I18nService.getInstance();
    await aggregatedLaunchManager.loadConfigs();
    const configs = aggregatedLaunchManager.getConfigs();

    if (configs.length === 0) {
        const action = await vscode.window.showInformationMessage(
            i18n.localize('config.noAggregated'),
            i18n.localize('config.createConfig')
        );
        if (action === i18n.localize('config.createConfig')) {
            await createAggregatedLaunchConfig(aggregatedLaunchManager);
        }
        return;
    }

    // 选择要管理的配置
    const configOptions = configs.map(config => ({
        label: `📦 ${config.name}`,
        description: config.description,
        detail: `${config.getEnabledItemCount()}/${config.getItemCount()} ${i18n.localize('config.enabledItems')}`,
        config: config
    }));

    const selected = await vscode.window.showQuickPick(configOptions, {
        placeHolder: i18n.localize('config.selectToManage')
    });

    if (!selected) {
        return;
    }

    // 显示管理选项
    const action = await vscode.window.showQuickPick([
        { label: i18n.localize('config.edit'), value: 'edit' },
        { label: i18n.localize('config.execute'), value: 'execute' },
        { label: i18n.localize('config.delete'), value: 'delete' },
        { label: i18n.localize('config.viewDetails'), value: 'details' }
    ], {
        placeHolder: i18n.localize('config.manageConfig', selected.config.name)
    });

    if (!action) {
        return;
    }

    switch (action.value) {
        case 'edit':
            await editAggregatedLaunchConfig(aggregatedLaunchManager, selected.config.name);
            break;
        case 'execute':
            await aggregatedLaunchManager.executeAggregatedLaunch(selected.config.name);
            break;
        case 'delete':
            const confirm = await vscode.window.showWarningMessage(
                i18n.localize('config.confirmDelete', selected.config.name),
                i18n.localize('config.delete'),
                i18n.localize('config.cancel')
            );
            if (confirm === i18n.localize('config.delete')) {
                await aggregatedLaunchManager.deleteConfig(selected.config.name);
                vscode.window.showInformationMessage(i18n.localize('config.configDeleted', selected.config.name));
            }
            break;
        case 'details':
            await showAggregatedLaunchDetails(selected.config);
            break;
    }
}

/**
 * 执行聚合启动配置
 */
async function executeAggregatedLaunchConfig(aggregatedLaunchManager: AggregatedLaunchManager): Promise<void> {
    const i18n = I18nService.getInstance();
    await aggregatedLaunchManager.loadConfigs();
    const configs = aggregatedLaunchManager.getConfigs();

    if (configs.length === 0) {
        vscode.window.showWarningMessage(i18n.localize('config.noAggregated'));
        return;
    }

    // 选择要执行的配置
    const configOptions = configs.map(config => ({
        label: `📦 ${config.name}`,
        description: config.description,
        detail: `${config.getEnabledItemCount()} ${i18n.localize('config.launchItems')}`,
        value: config.name
    }));

    const selected = await vscode.window.showQuickPick(configOptions, {
        placeHolder: i18n.localize('config.selectToExecute')
    });

    if (!selected) {
        return;
    }

    await aggregatedLaunchManager.executeAggregatedLaunch(selected.value);
}

/**
 * 编辑聚合启动配置
 */
async function editAggregatedLaunchConfig(aggregatedLaunchManager: AggregatedLaunchManager, configName: string): Promise<void> {
    const i18n = I18nService.getInstance();
    const config = aggregatedLaunchManager.getConfigByName(configName);
    if (!config) {
        vscode.window.showErrorMessage(i18n.localize('config.notFound', configName));
        return;
    }

    // 显示编辑选项
    const action = await vscode.window.showQuickPick([
        { label: i18n.localize('config.editDescription'), value: 'description' },
        { label: i18n.localize('config.manageItems'), value: 'items' },
        { label: i18n.localize('config.addItem'), value: 'add' }
    ], {
        placeHolder: i18n.localize('config.editConfig', configName)
    });

    if (!action) {
        return;
    }

    switch (action.value) {
        case 'description':
            const newDescription = await vscode.window.showInputBox({
                prompt: i18n.localize('config.inputNewDescription'),
                value: config.description
            });
            if (newDescription !== undefined) {
                await aggregatedLaunchManager.updateConfig(configName, { description: newDescription });
                vscode.window.showInformationMessage(i18n.localize('config.descriptionUpdated'));
            }
            break;
        case 'items':
            await manageAggregatedLaunchItems(aggregatedLaunchManager, configName);
            break;
        case 'add':
            await addLaunchItemToConfig(aggregatedLaunchManager, configName);
            break;
    }
}

/**
 * 管理聚合启动项
 */
async function manageAggregatedLaunchItems(aggregatedLaunchManager: AggregatedLaunchManager, configName: string): Promise<void> {
    const i18n = I18nService.getInstance();
    const config = aggregatedLaunchManager.getConfigByName(configName);
    if (!config) {
        return;
    }

    if (config.items.length === 0) {
        vscode.window.showInformationMessage(i18n.localize('config.noItems'));
        return;
    }

    // 显示启动项列表
    const itemOptions = config.items.map(item => ({
        label: `${item.enabled ? '✅' : '❌'} ${item.name}`,
        description: item.delay ? `${i18n.localize('config.delay')}: ${item.delay}ms` : i18n.localize('config.noDelay'),
        item: item
    }));

    const selected = await vscode.window.showQuickPick(itemOptions, {
        placeHolder: i18n.localize('config.selectToManageItem')
    });

    if (!selected) {
        return;
    }

    // 显示操作选项
    const action = await vscode.window.showQuickPick([
        { label: i18n.localize('config.toggleEnabled'), value: 'toggle' },
        { label: i18n.localize('config.setDelay'), value: 'delay' },
        { label: i18n.localize('config.remove'), value: 'remove' }
    ], {
        placeHolder: i18n.localize('config.manageItem', selected.item.name)
    });

    if (!action) {
        return;
    }

    const newItems = [...config.items];
    const itemIndex = newItems.findIndex(item => item.name === selected.item.name);

    switch (action.value) {
        case 'toggle':
            newItems[itemIndex] = { ...selected.item, enabled: !selected.item.enabled };
            await aggregatedLaunchManager.updateConfig(configName, { items: newItems });
            vscode.window.showInformationMessage(i18n.localize('config.itemToggled', selected.item.enabled ? i18n.localize('config.disabled') : i18n.localize('config.enabled')));
            break;
        case 'delay':
            const delayStr = await vscode.window.showInputBox({
                prompt: i18n.localize('config.inputDelayTime'),
                value: (selected.item.delay || 0).toString(),
                validateInput: (value) => {
                    const num = parseInt(value);
                    if (isNaN(num) || num < 0) {
                        return i18n.localize('config.invalidNonNegativeNumber');
                    }
                    return null;
                }
            });
            if (delayStr) {
                newItems[itemIndex] = { ...selected.item, delay: parseInt(delayStr) };
                await aggregatedLaunchManager.updateConfig(configName, { items: newItems });
                vscode.window.showInformationMessage(i18n.localize('config.delaySet', delayStr));
            }
            break;
        case 'remove':
            newItems.splice(itemIndex, 1);
            await aggregatedLaunchManager.updateConfig(configName, { items: newItems });
            vscode.window.showInformationMessage(i18n.localize('config.itemRemoved', selected.item.name));
            break;
    }
}

/**
 * 添加启动项到配置
 */
async function addLaunchItemToConfig(aggregatedLaunchManager: AggregatedLaunchManager, configName: string): Promise<void> {
    const i18n = I18nService.getInstance();
    const config = aggregatedLaunchManager.getConfigByName(configName);
    const availableConfigs = await aggregatedLaunchManager.getAvailableLaunchConfigs();
    
    if (!config) {
        return;
    }

    // 过滤掉已经添加的配置
    const unusedConfigs = availableConfigs.filter(configName => 
        !config.containsLaunchConfig(configName)
    );

    if (unusedConfigs.length === 0) {
        vscode.window.showInformationMessage(i18n.localize('config.allConfigsAdded'));
        return;
    }

    const selected = await vscode.window.showQuickPick(unusedConfigs, {
        placeHolder: i18n.localize('config.selectConfigToAdd')
    });

    if (!selected) {
        return;
    }

    const newItem: AggregatedLaunchItem = {
        name: selected,
        enabled: true,
        delay: 0
    };

    const newItems = [...config.items, newItem];
    await aggregatedLaunchManager.updateConfig(configName, { items: newItems });
    vscode.window.showInformationMessage(i18n.localize('config.itemAdded', selected));
}

/**
 * 显示聚合启动配置详情
 */
async function showAggregatedLaunchDetails(config: AggregatedLaunchConfig): Promise<void> {
    const i18n = I18nService.getInstance();
    const details = `${i18n.localize('config.aggregatedDetails')}\n\n` +
        `${i18n.localize('config.name')}: ${config.name}\n` +
        `${i18n.localize('config.description')}: ${config.description || i18n.localize('config.noDescription')}\n` +
        `${i18n.localize('config.createdAt')}: ${config.createdAt.toLocaleString()}\n` +
        `${i18n.localize('config.lastModified')}: ${config.updatedAt.toLocaleString()}\n\n` +
        `${i18n.localize('config.launchItems')}: ${config.getEnabledItemCount()}/${config.getItemCount()} ${i18n.localize('config.enabledItems')}\n` +
        `${config.items.map((item: AggregatedLaunchItem) => 
            `${item.enabled ? '✅' : '❌'} ${item.name}${item.delay ? ` (${i18n.localize('config.delay')}: ${item.delay}ms)` : ''}`
        ).join('\n')}`;

    vscode.window.showInformationMessage(details, { modal: true });
}

/**
 * 调试聚合启动配置
 */
async function debugAggregatedLaunchConfig(aggregatedLaunchManager: AggregatedLaunchManager): Promise<void> {
    const i18n = I18nService.getInstance();
    try {
        // 获取工作区信息
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage(i18n.localize('workspace.noWorkspace'));
            return;
        }

        console.log('=== 聚合启动调试信息 ===');
        console.log('工作区路径:', workspaceFolder.uri.fsPath);

        // 获取可用的启动配置
        console.log('正在获取可用的启动配置...');
        const availableConfigs = await aggregatedLaunchManager.getAvailableLaunchConfigs();
        
        // 获取launch.json内容
        let launchContent = null;
        try {
            launchContent = await aggregatedLaunchManager.getLaunchJsonContent();
        } catch (error) {
            console.error('无法读取launch.json:', error);
        }

        // 获取聚合启动配置
        await aggregatedLaunchManager.loadConfigs();
        const aggregatedConfigs = aggregatedLaunchManager.getConfigs();

        // 生成调试报告
        const debugInfo = `${i18n.localize('config.aggregatedDebugReport')}\n\n` +
            `${i18n.localize('config.workspacePath')}: ${workspaceFolder.uri.fsPath}\n\n` +
            `${i18n.localize('config.availableConfigs')}: ${availableConfigs.length}\n` +
            `${availableConfigs.map(name => `  - ${name}`).join('\n') || i18n.localize('config.noConfigs')}\n\n` +
            `${i18n.localize('config.launchJsonStatus')}:\n${launchContent ? `  - ${i18n.localize('config.fileExists')}\n    - ${i18n.localize('config.configCount')}: ${launchContent.configurations?.length || 0}\n    - ${i18n.localize('config.configList')}: ${(launchContent.configurations || []).map((c: any) => c.name).join(', ')}` : i18n.localize('config.fileNotFound')}\n\n` +
            `${i18n.localize('config.aggregatedConfigs')}: ${aggregatedConfigs.length}\n` +
            `${aggregatedConfigs.map(config => 
                `  - ${config.name}: ${config.getEnabledItemCount()}/${config.getItemCount()} ${i18n.localize('config.enabledItems')}`
            ).join('\n') || i18n.localize('config.noConfigs')}\n\n` +
            `${i18n.localize('config.detailedConfigs')}:\n${aggregatedConfigs.map(config => 
                `  ${config.name}:\n${config.items.map(item => 
                    `    - ${item.enabled ? '✅' : '❌'} ${item.name} (${i18n.localize('config.delay')}: ${item.delay || 0}ms)`
                ).join('\n')}`
            ).join('\n\n') || i18n.localize('config.noConfigs')}`;

        console.log(debugInfo);
        
        // 显示调试信息
        const action = await vscode.window.showInformationMessage(
            i18n.localize('config.debugInfoOutput'),
            i18n.localize('config.viewConsole'),
            i18n.localize('config.copyToClipboard')
        );

        if (action === i18n.localize('config.viewConsole')) {
            vscode.commands.executeCommand('workbench.action.toggleDevTools');
        } else if (action === i18n.localize('config.copyToClipboard')) {
            await vscode.env.clipboard.writeText(debugInfo);
            vscode.window.showInformationMessage(i18n.localize('config.debugInfoCopied'));
        }

    } catch (error) {
        console.error('调试过程中发生错误:', error);
        vscode.window.showErrorMessage(i18n.localize('config.debugFailed', error));
    }
}

/**
 * 从树视图运行Java入口点
 */
async function runJavaEntryFromTree(
    javaEntry: JavaEntry,
    launchConfigGenerator: LaunchConfigGenerator,
    projectScanner: ProjectScanner
): Promise<void> {
    const i18n = I18nService.getInstance();
    try {
        // 获取工作区路径
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error(i18n.localize('workspace.noWorkspace'));
        }

        // 创建一个临时的ProjectInfo对象
        const projectInfo = await projectScanner.scanProject(workspaceFolder.uri.fsPath);
        
        // 生成启动配置
        await launchConfigGenerator.generateConfigs(projectInfo, workspaceFolder.uri.fsPath);
        
        // 使用VS Code的调试API启动
        const success = await vscode.debug.startDebugging(workspaceFolder, javaEntry.displayName);
        if (!success) {
            throw new Error(i18n.localize('config.launchFailed', javaEntry.displayName));
        }
        
        // 记录启动历史并更新launch.json顺序
        const recentLaunchManager = new RecentLaunchManager();
        await recentLaunchManager.recordLaunch(javaEntry);
        await recentLaunchManager.updateLaunchJsonOrder();
        
        // 刷新Tree View
        vscode.commands.executeCommand('java-launcher.refreshTreeView');
        
        vscode.window.showInformationMessage(i18n.localize('config.launchSuccess', javaEntry.displayName));
    } catch (error) {
        throw new Error(i18n.localize('config.runJavaEntryFailed', error));
    }
}

/**
 * 将Java入口点添加到聚合配置
 */
async function addJavaEntryToAggregatedConfig(
    javaEntry: JavaEntry,
    aggregatedLaunchManager: AggregatedLaunchManager,
    treeDataProvider: JavaLauncherTreeDataProvider
): Promise<void> {
    const i18n = I18nService.getInstance();
    try {
        await aggregatedLaunchManager.loadConfigs();
        const configs = aggregatedLaunchManager.getConfigs();

        if (configs.length === 0) {
            const createNew = await vscode.window.showInformationMessage(
                i18n.localize('config.noAggregated'),
                i18n.localize('config.createNewConfig'),
                i18n.localize('config.cancel')
            );
            
            if (createNew === i18n.localize('config.createNewConfig')) {
                await createAggregatedLaunchConfig(aggregatedLaunchManager);
                await treeDataProvider.reloadData();
            }
            return;
        }

        // 选择要添加到的配置
        const configOptions = configs.map(config => ({
            label: config.name,
            description: config.description,
            detail: `${config.getEnabledItemCount()}/${config.getItemCount()} ${i18n.localize('config.launchItems')}`,
            config: config
        }));

        const selected = await vscode.window.showQuickPick(configOptions, {
            placeHolder: i18n.localize('config.selectAggregatedConfig', javaEntry.displayName)
        });

        if (!selected) {
            return;
        }

        // 检查是否已经存在
        if (selected.config.containsLaunchConfig(javaEntry.displayName)) {
            vscode.window.showWarningMessage(i18n.localize('config.itemExists', javaEntry.displayName, selected.config.name));
            return;
        }

        // 添加新启动项
        const newItem: AggregatedLaunchItem = {
            name: javaEntry.displayName,
            enabled: true,
            delay: 0
        };

        const newItems = [...selected.config.items, newItem];
        await aggregatedLaunchManager.updateConfig(selected.config.name, { items: newItems });
        
        // 刷新树视图
        await treeDataProvider.reloadData();
        
        vscode.window.showInformationMessage(
            i18n.localize('config.itemAddedToAggregated', javaEntry.displayName, selected.config.name)
        );
    } catch (error) {
        throw new Error(i18n.localize('config.addToAggregatedFailed', error));
    }
}

/**
 * 批量设置所有Spring Boot应用的Active Profile
 */
async function setAllSpringBootProfiles(treeDataProvider: JavaLauncherTreeDataProvider): Promise<void> {
    const i18n = I18nService.getInstance();
    // 获取所有Spring Boot应用
    const springBootEntries = treeDataProvider.getJavaEntries().filter(
        entry => entry.type === JavaEntryType.SPRING_BOOT_APPLICATION
    );

    if (springBootEntries.length === 0) {
        vscode.window.showWarningMessage(i18n.localize('config.noSpringBootApps'));
        return;
    }

    // 获取当前所有应用的Profile设置
    const currentProfiles = new Map<string, string>();
    for (const entry of springBootEntries) {
        try {
            const profile = await getCurrentSpringProfile(entry.className);
            if (profile) {
                currentProfiles.set(entry.className, profile);
            }
        } catch (error) {
            console.warn(`${i18n.localize('config.getProfileFailed', entry.className)}:`, error);
        }
    }

    // 显示当前设置摘要
    const profileSummary = Array.from(new Set(currentProfiles.values()));
    const summaryText = profileSummary.length > 0 
        ? `${i18n.localize('config.currentProfileSet')}: ${profileSummary.join(', ')}` 
        : `${i18n.localize('config.noProfileSet')}`;

    // 让用户输入新的profile
    const newProfile = await vscode.window.showInputBox({
        title: `${i18n.localize('config.batchSetSpringBootProfile', springBootEntries.length)}`,
        prompt: `${summaryText}\n${i18n.localize('config.inputProfileName', profileSummary.length === 1 ? profileSummary[0] : 'dev')}`,
        value: profileSummary.length === 1 ? profileSummary[0] : 'dev',
        placeHolder: i18n.localize('config.inputProfileNamePlaceholder'),
        validateInput: (value) => {
            if (!value || !value.trim()) {
                return i18n.localize('config.profileNameEmpty');
            }
            if (!/^[a-zA-Z0-9\-_]+$/.test(value.trim())) {
                return i18n.localize('config.profileNameInvalid');
            }
            return null;
        }
    });

    if (!newProfile) {
        return;
    }

    const targetProfile = newProfile.trim();

    // 确认操作
    const confirmation = await vscode.window.showWarningMessage(
        i18n.localize('config.confirmBatchUpdate', springBootEntries.length, targetProfile),
        {
            modal: true,
            detail: i18n.localize('config.appsToUpdate', springBootEntries.map(entry => `• ${entry.displayName} (${entry.className})`).join('\n'))
        },
        i18n.localize('config.confirmUpdate'),
        i18n.localize('config.cancel')
    );

    if (confirmation !== i18n.localize('config.confirmUpdate')) {
        return;
    }

    // 执行批量更新
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: i18n.localize('config.batchSetSpringBootProfile'),
        cancellable: false
    }, async (progress) => {
        const totalApps = springBootEntries.length;
        
        for (let i = 0; i < springBootEntries.length; i++) {
            const entry = springBootEntries[i];
            const progressPercent = ((i + 1) / totalApps) * 100;
            
            progress.report({
                increment: i === 0 ? progressPercent : (100 / totalApps),
                message: i18n.localize('config.updatingApp', entry.displayName, i + 1, totalApps)
            });

            try {
                await updateSpringProfileInLaunchJson(entry.className, targetProfile);
                successCount++;
            } catch (error) {
                failureCount++;
                errors.push(`${entry.displayName}: ${error}`);
                console.error(`${i18n.localize('config.updateProfileFailed', entry.className)}:`, error);
            }
        }
    });

    // 显示结果摘要
    if (successCount === springBootEntries.length) {
        vscode.window.showInformationMessage(
            i18n.localize('config.allSpringBootProfilesSet', successCount, targetProfile)
        );
    } else if (successCount > 0) {
        vscode.window.showWarningMessage(
            i18n.localize('config.batchSetComplete', successCount, failureCount) + '\n\n' +
            i18n.localize('config.failureDetails') + ':\n' + errors.join('\n')
        );
    } else {
        vscode.window.showErrorMessage(
            i18n.localize('config.batchSetFailed', failureCount) + '\n\n' +
            i18n.localize('config.errorDetails') + ':\n' + errors.join('\n')
        );
    }
}

/**
 * 设置Spring Boot应用的Active Profile
 */
async function setSpringActiveProfile(
    javaEntryOrTreeItem?: JavaEntry | JavaLauncherTreeItem,
    treeDataProvider?: JavaLauncherTreeDataProvider
): Promise<void> {
    const i18n = I18nService.getInstance();
    let springBootEntry: JavaEntry;

    // 确定要修改的Spring Boot应用
    if (javaEntryOrTreeItem) {
        // 从Tree View或其他地方传入的参数
        if ('itemType' in javaEntryOrTreeItem) {
            // 这是TreeItem对象，从data属性获取JavaEntry
            springBootEntry = (javaEntryOrTreeItem as JavaLauncherTreeItem).data;
        } else {
            // 这是直接的JavaEntry对象
            springBootEntry = javaEntryOrTreeItem as JavaEntry;
        }
    } else {
        // 从命令面板调用，需要选择Spring Boot应用
        const springBootEntries = treeDataProvider?.getJavaEntries().filter(
            entry => entry.type === JavaEntryType.SPRING_BOOT_APPLICATION
        ) || [];

        if (springBootEntries.length === 0) {
            vscode.window.showWarningMessage(i18n.localize('config.noSpringBootApps'));
            return;
        }

        if (springBootEntries.length === 1) {
            springBootEntry = springBootEntries[0];
        } else {
            // 让用户选择Spring Boot应用
            const selectedApp = await vscode.window.showQuickPick(
                springBootEntries.map(entry => ({
                    label: `🍃 ${entry.displayName}`,
                    description: entry.className,
                    detail: `${i18n.localize('config.project')}: ${entry.projectName}`,
                    entry: entry
                })),
                {
                    title: i18n.localize('config.selectSpringBootApp'),
                    placeHolder: i18n.localize('config.selectSpringBootAppPlaceholder')
                }
            );

            if (!selectedApp) {
                return;
            }
            springBootEntry = selectedApp.entry;
        }
    }

    // 验证是否为Spring Boot应用
    if (springBootEntry.type !== JavaEntryType.SPRING_BOOT_APPLICATION) {
        vscode.window.showErrorMessage(i18n.localize('config.onlySpringBootProfile'));
        return;
    }

    // 获取当前的profile设置
    const currentProfile = await getCurrentSpringProfile(springBootEntry.className);

    // 让用户输入新的profile
    const newProfile = await vscode.window.showInputBox({
        title: i18n.localize('config.setSpringActiveProfile'),
        prompt: i18n.localize('config.setActiveProfilePrompt', springBootEntry.displayName),
        value: currentProfile || 'dev',
        placeHolder: i18n.localize('config.inputProfileNamePlaceholder'),
        validateInput: (value) => {
            if (!value || !value.trim()) {
                return i18n.localize('config.profileNameEmpty');
            }
            if (!/^[a-zA-Z0-9\-_]+$/.test(value.trim())) {
                return i18n.localize('config.profileNameInvalid');
            }
            return null;
        }
    });

    if (!newProfile) {
        return;
    }

    // 更新launch.json中的配置
    try {
        await updateSpringProfileInLaunchJson(springBootEntry.className, newProfile.trim());
        vscode.window.showInformationMessage(
            i18n.localize('config.springProfileSet', springBootEntry.displayName, newProfile.trim())
        );
    } catch (error) {
        throw new Error(i18n.localize('config.updateConfigFailed', error));
    }
}

/**
 * 获取当前的Spring Profile设置
 */
async function getCurrentSpringProfile(mainClass: string): Promise<string | null> {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return null;
        }

        const launchJsonPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'launch.json');
        const fileSystemManager = new FileSystemManager();

        if (!(await fileSystemManager.exists(launchJsonPath))) {
            return null;
        }

        const content = await fileSystemManager.readFile(launchJsonPath);
        const launchJson = JSON.parse(content);

        const config = launchJson.configurations?.find((config: any) => 
            config.mainClass === mainClass && config.type === 'java'
        );

        if (config && config.vmArgs) {
            const profileMatch = config.vmArgs.match(/-Dspring\.profiles\.active=([^\s]+)/);
            if (profileMatch) {
                return profileMatch[1];
            }
        }

        return null;
    } catch (error) {
        console.error('获取当前Spring Profile失败:', error);
        return null;
    }
}

/**
 * 更新launch.json中的Spring Profile设置
 */
async function updateSpringProfileInLaunchJson(mainClass: string, profile: string): Promise<void> {
    const i18n = I18nService.getInstance();
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        throw new Error(i18n.localize('workspace.noWorkspace'));
    }

    const launchJsonPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'launch.json');
    const fileSystemManager = new FileSystemManager();

    if (!(await fileSystemManager.exists(launchJsonPath))) {
        throw new Error(i18n.localize('config.launchJsonNotFound'));
    }

    // 读取现有配置
    const content = await fileSystemManager.readFile(launchJsonPath);
    const launchJson = JSON.parse(content);

    if (!launchJson.configurations || !Array.isArray(launchJson.configurations)) {
        throw new Error(i18n.localize('config.launchJsonInvalidFormat'));
    }

    // 找到对应的配置
    const configIndex = launchJson.configurations.findIndex((config: any) => 
        config.mainClass === mainClass && config.type === 'java'
    );

    if (configIndex === -1) {
        throw new Error(i18n.localize('config.noConfigFound', mainClass));
    }

    const config = launchJson.configurations[configIndex];

    // 更新vmArgs中的spring.profiles.active设置
    const newProfileArg = `-Dspring.profiles.active=${profile}`;
    
    if (config.vmArgs) {
        // 如果已有vmArgs，替换或添加profile设置
        if (config.vmArgs.includes('-Dspring.profiles.active=')) {
            // 替换现有的profile设置
            config.vmArgs = config.vmArgs.replace(
                /-Dspring\.profiles\.active=[^\s]+/g,
                newProfileArg
            );
        } else {
            // 添加新的profile设置
            config.vmArgs = `${config.vmArgs} ${newProfileArg}`.trim();
        }
    } else {
        // 如果没有vmArgs，创建新的
        config.vmArgs = newProfileArg;
    }

    // 保存更新后的配置
    const updatedContent = JSON.stringify(launchJson, null, 2);
    await fileSystemManager.writeFile(launchJsonPath, updatedContent);

    console.log(`已更新 ${mainClass} 的Spring Profile为: ${profile}`);
}

/**
 * 显示所有Java Launcher命令
 */
async function showAllJavaLauncherCommands(): Promise<void> {
    const i18n = I18nService.getInstance();
    interface CommandItem extends vscode.QuickPickItem {
        command: string;
    }

    const commands: CommandItem[] = [
        {
            label: `$(gear) ${i18n.localize('command.generateConfigs')}`,
            description: i18n.localize('command.generateConfigsDescription'),
            detail: i18n.localize('command.generateConfigsDetail'),
            command: 'java-launcher.generateLaunchConfigs'
        },
        {
            label: `$(window) ${i18n.localize('command.manageRunningProcesses')}`,
            description: i18n.localize('command.manageRunningProcessesDescription'),
            detail: i18n.localize('command.manageRunningProcessesDetail'),
            command: 'java-launcher.manageRunningProcesses'
        },
        {
            label: `$(sync) ${i18n.localize('command.scanEntries')}`, 
            description: i18n.localize('command.scanEntriesDescription'),
            detail: i18n.localize('command.scanEntriesDetail'),
            command: 'java-launcher.scanJavaEntries'
        },
        {
            label: `$(plus) ${i18n.localize('command.createAggregated')}`,
            description: i18n.localize('command.createAggregatedDescription'),
            detail: i18n.localize('command.createAggregatedDetail'),
            command: 'java-launcher.createAggregatedLaunch'
        },
        {
            label: `$(settings-gear) ${i18n.localize('command.manageAggregated')}`,
            description: i18n.localize('command.manageAggregatedDescription'),
            detail: i18n.localize('command.manageAggregatedDetail'),
            command: 'java-launcher.manageAggregatedLaunch'
        },
        {
            label: `$(play) ${i18n.localize('command.executeAggregated')}`,
            description: i18n.localize('command.executeAggregatedDescription'),
            detail: i18n.localize('command.executeAggregatedDetail'),
            command: 'java-launcher.executeAggregatedLaunch'
        },
        {
            label: `$(debug) ${i18n.localize('command.debugAggregated')}`,
            description: i18n.localize('command.debugAggregatedDescription'),
            detail: i18n.localize('command.debugAggregatedDetail'),
            command: 'java-launcher.debugAggregatedLaunch'
        },
        {
            label: `$(refresh) ${i18n.localize('command.refreshTreeView')}`,
            description: i18n.localize('command.refreshTreeViewDescription'),
            detail: i18n.localize('command.refreshTreeViewDetail'),
            command: 'java-launcher.refreshTreeView'
        },
        {
            label: `$(search) ${i18n.localize('command.searchAndRun')}`,
            description: i18n.localize('command.searchAndRunDescription'),
            detail: i18n.localize('command.searchAndRunDetail'),
            command: 'java-launcher.searchAndRun'
        },
        {
            label: `$(settings) ${i18n.localize('command.setSpringProfile')}`,
            description: i18n.localize('command.setSpringProfileDescription'),
            detail: i18n.localize('command.setSpringProfileDetail'),
            command: 'java-launcher.setSpringProfile'
        },
        {
            label: `$(settings-sync) ${i18n.localize('command.setAllSpringProfiles')}`,
            description: i18n.localize('command.setAllSpringProfilesDescription'),
            detail: i18n.localize('command.setAllSpringProfilesDetail'),
            command: 'java-launcher.setAllSpringProfiles'
        },
        {
            label: `$(remote-explorer) ${i18n.localize('command.setAllJmxRemoteStatus')}`,
            description: i18n.localize('command.setAllJmxRemoteStatusDescription'),
            detail: i18n.localize('command.setAllJmxRemoteStatusDetail'),
            command: 'java-launcher.setAllJmxRemoteStatus'
        }
    ];

    const selectedCommand = await vscode.window.showQuickPick(commands, {
        title: i18n.localize('command.javaLauncherCommands'),
        placeHolder: i18n.localize('command.selectCommand'),
        matchOnDescription: true,
        matchOnDetail: true,
        ignoreFocusOut: false
    });

    if (selectedCommand) {
        try {
            await vscode.commands.executeCommand(selectedCommand.command);
        } catch (error) {
            vscode.window.showErrorMessage(i18n.localize('command.executeCommandFailed', error));
            console.error(`${i18n.localize('command.executeCommandFailed', selectedCommand.command)}:`, error);
        }
    }
}

/**
 * 设置所有启动配置的JMX远程管理状态
 */
async function setAllJmxRemoteStatus(): Promise<void> {
    const i18n = I18nService.getInstance();
    try {
        // 获取工作区
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error(i18n.localize('workspace.noWorkspace'));
        }
        
        // 读取launch.json
        const launchJsonPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'launch.json');
        const fileSystemManager = new FileSystemManager();
        
        if (!(await fileSystemManager.exists(launchJsonPath))) {
            throw new Error(i18n.localize('config.launchJsonNotFound'));
        }
        
        // 读取内容
        const content = await fileSystemManager.readFile(launchJsonPath);
        const launchJson = JSON.parse(content);
        
        if (!launchJson.configurations || !Array.isArray(launchJson.configurations)) {
            throw new Error(i18n.localize('config.launchJsonInvalidFormat'));
        }
        
        // 获取配置数量
        const javaConfigs = launchJson.configurations.filter((config: any) => 
            config.type === 'java' && config.mainClass
        );
        
        if (javaConfigs.length === 0) {
            vscode.window.showInformationMessage(i18n.localize('config.noJavaConfigs'));
            return;
        }
        
        // 当前状态统计
        const currentStatus = {
            true: 0,
            false: 0,
            notSet: 0
        };
        
        // 检查当前状态
        javaConfigs.forEach((config: any) => {
            if (!config.vmArgs) {
                currentStatus.notSet++;
            } else if (config.vmArgs.includes('-Dcom.sun.management.jmxremote=true')) {
                currentStatus.true++;
            } else if (config.vmArgs.includes('-Dcom.sun.management.jmxremote=false')) {
                currentStatus.false++;
            } else {
                currentStatus.notSet++;
            }
        });
        
        // 显示当前状态并选择新状态
        const statusMsg = `${i18n.localize('config.currentJmxStatus')}: ${currentStatus.true} ${i18n.localize('config.enabled')}, ${currentStatus.false} ${i18n.localize('config.disabled')}, ${currentStatus.notSet} ${i18n.localize('config.notSet')}`;
        const newStatus = await vscode.window.showQuickPick(
            [
                { label: `$(x) ${i18n.localize('config.disableJmx')}`, description: i18n.localize('config.disableJmxDescription'), value: 'false' },
                { label: `$(check) ${i18n.localize('config.enableJmx')}`, description: i18n.localize('config.enableJmxDescription'), value: 'true' }
            ],
            {
                title: i18n.localize('config.setAllJavaConfigsJmxStatus'),
                placeHolder: statusMsg
            }
        );
        
        if (!newStatus) {
            return;
        }
        
        // 确认修改
        const confirmMsg = `${i18n.localize('config.confirmJmxStatus', javaConfigs.length, newStatus.value)}`;
        const confirmed = await vscode.window.showWarningMessage(
            confirmMsg,
            { modal: true },
            i18n.localize('config.confirmUpdate')
        );
        
        if (confirmed !== i18n.localize('config.confirmUpdate')) {
            return;
        }
        
        // 执行修改
        let modifiedCount = 0;
        
        // 更新配置
        launchJson.configurations.forEach((config: any) => {
            if (config.type === 'java' && config.mainClass) {
                const jmxFlag = `-Dcom.sun.management.jmxremote=${newStatus.value}`;
                
                if (!config.vmArgs) {
                    // 没有vmArgs，直接添加
                    config.vmArgs = jmxFlag;
                    modifiedCount++;
                } else {
                    // 有vmArgs，替换或添加
                    const regex = /-Dcom\.sun\.management\.jmxremote=(true|false)/;
                    if (regex.test(config.vmArgs)) {
                        // 替换现有设置
                        config.vmArgs = config.vmArgs.replace(regex, jmxFlag);
                        modifiedCount++;
                    } else {
                        // 添加设置
                        config.vmArgs = `${config.vmArgs} ${jmxFlag}`.trim();
                        modifiedCount++;
                    }
                }
            }
        });
        
        // 保存修改后的配置
        await fileSystemManager.writeFile(
            launchJsonPath, 
            JSON.stringify(launchJson, null, 4)
        );
        
        vscode.window.showInformationMessage(
            i18n.localize('config.jmxStatusModified', modifiedCount, newStatus.value)
        );
        
    } catch (error) {
        vscode.window.showErrorMessage(i18n.localize('config.setJmxRemoteStatusFailed', error));
        console.error('设置JMX远程管理状态失败:', error);
    }
}

/**
 * 搜索并运行Java入口点
 */
async function searchJavaEntries(treeDataProvider: JavaLauncherTreeDataProvider): Promise<void> {
    const i18n = I18nService.getInstance();
    // 获取聚合启动管理器实例
    const aggregatedLaunchManager = new AggregatedLaunchManager();
    await aggregatedLaunchManager.loadConfigs();
    // 创建QuickPick
    const quickPick = vscode.window.createQuickPick();
    quickPick.placeholder = i18n.localize('search.inputSearchQuery');
    quickPick.title = i18n.localize('search.searchAndRunJavaEntryOrConfig');
    
    // 设置初始项
    const allEntries = treeDataProvider.getJavaEntries();
    const allConfigs = treeDataProvider.getAggregatedConfigs();
    
    // 当输入变化时更新搜索结果
    quickPick.onDidChangeValue(() => {
        const searchQuery = quickPick.value.toLowerCase();
        if (!searchQuery) {
            quickPick.items = [];
            return;
        }
        
        const i18n = I18nService.getInstance();
        
        // 过滤Java入口点
        const matchingEntries = allEntries
            .filter(entry => {
                return entry.className.toLowerCase().includes(searchQuery) || 
                       entry.displayName.toLowerCase().includes(searchQuery) || 
                       (entry.methodName && entry.methodName.toLowerCase().includes(searchQuery)) ||
                       (entry.projectName && entry.projectName.toLowerCase().includes(searchQuery));
            })
            .map(entry => {
                let iconName = '';
                switch (entry.type) {
                    case JavaEntryType.SPRING_BOOT_APPLICATION:
                        iconName = 'symbol-method';
                        break;
                    case JavaEntryType.MAIN_CLASS:
                        iconName = 'symbol-function';
                        break;
                    case JavaEntryType.JUNIT_TEST_CLASS:
                    case JavaEntryType.TESTNG_TEST_CLASS:
                        iconName = 'beaker';
                        break;
                    case JavaEntryType.JUNIT_TEST_METHOD:
                    case JavaEntryType.TESTNG_TEST_METHOD:
                        iconName = 'symbol-misc';
                        break;
                }
                
                const projectLabel = i18n.getLocale() === 'zh-cn' ? 
                    `${i18n.localize('config.project')}: ${entry.projectName || i18n.localize('config.unknown')}` : 
                    `${i18n.localize('config.project')}: ${entry.projectName || i18n.localize('config.unknown')}`;
                
                return {
                    label: `$(${iconName}) ${entry.displayName}`,
                    description: entry.className,
                    detail: projectLabel,
                    entry: entry,
                    type: 'entry'
                };
            });
            
        // 过滤聚合配置
        const matchingConfigs = allConfigs
            .filter(config => config.name.toLowerCase().includes(searchQuery))
            .map(config => {
                const itemsLabel = i18n.getLocale() === 'zh-cn' ? 
                    `${config.getEnabledItemCount()}/${config.getItemCount()} ${i18n.localize('config.launchItems')}` : 
                    `${config.getEnabledItemCount()}/${config.getItemCount()} ${i18n.localize('config.launchItems')}`;
                
                const configDetail = config.description || 
                    (i18n.getLocale() === 'zh-cn' ? i18n.localize('config.aggregatedLaunchConfig') : i18n.localize('config.aggregatedLaunchConfig'));
                
                return {
                    label: `$(package) ${config.name}`,
                    description: itemsLabel,
                    detail: configDetail,
                    config: config,
                    type: 'config'
                };
            });
            
        // 合并结果
        quickPick.items = [...matchingEntries, ...matchingConfigs];
    });
    
    // 当选择项时执行操作
    quickPick.onDidAccept(async () => {
        const selectedItem = quickPick.selectedItems[0] as any;
        if (!selectedItem) {
            return;
        }
        
        quickPick.hide();
        
        if (selectedItem.type === 'entry') {
            // 运行Java入口点
            const entry = selectedItem.entry as JavaEntry;
            await runJavaEntryFromTree(entry, new LaunchConfigGenerator(), new ProjectScanner());
            await treeDataProvider.recordLaunch(entry);
            const runMessage = i18n.getLocale() === 'zh-cn' ? 
                `${i18n.localize('config.runSuccess', entry.displayName)}` : 
                `${i18n.localize('config.runSuccess', entry.displayName)}`;
            vscode.window.showInformationMessage(runMessage);
        } else if (selectedItem.type === 'config') {
            // 运行聚合配置
            const config = selectedItem.config as AggregatedLaunchConfig;
            // 使用已经存在的聚合启动管理器实例，确保配置已加载
            await aggregatedLaunchManager.executeAggregatedLaunch(config.name);
        }
    });
    
    // 显示QuickPick
    quickPick.show();
}

/**
 * 管理运行中Java进程
 */
async function manageRunningJavaProcesses(): Promise<void> {
    const i18n = I18nService.getInstance();
    const runningProcessManager = RunningProcessManager.getInstance();
    const runningProcesses = runningProcessManager.getRunningProcesses();

    if (runningProcesses.length === 0) {
        vscode.window.showInformationMessage(i18n.localize('process.noRunning'));
        return;
    }

    // 首先选择操作类型
    const actionType = await vscode.window.showQuickPick([
        { 
            label: `$(list-selection) ${i18n.localize('process.manageSingle')}`, 
            value: 'single' 
        },
        { 
            label: `$(debug-restart) ${i18n.localize('process.restartAll')}`, 
            value: 'restartAll' 
        },
        { 
            label: `$(debug-stop) ${i18n.localize('process.stopAll')}`, 
            value: 'stopAll' 
        }
    ], {
        title: i18n.localize('process.manage'),
        placeHolder: i18n.localize('process.currentRunning', runningProcesses.length)
    });

    if (!actionType) {
        return;
    }

    // 处理批量操作
    if (actionType.value === 'restartAll') {
        // 直接执行重启所有进程，不显示确认对话框
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: i18n.localize('process.restartingAll'),
            cancellable: false
        }, async () => {
            const success = await runningProcessManager.restartAllProcesses();
            if (success) {
                vscode.window.showInformationMessage(i18n.localize('process.allRestarted'));
            } else {
                vscode.window.showErrorMessage(i18n.localize('process.restartFailed'));
            }
        });
        return;
    }
    
    if (actionType.value === 'stopAll') {
        // 直接执行停止所有进程，不显示确认对话框
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: i18n.localize('process.stoppingAll'),
            cancellable: false
        }, async () => {
            const success = await runningProcessManager.stopAllProcesses();
            if (success) {
                vscode.window.showInformationMessage(i18n.localize('process.allStopped'));
            } else {
                vscode.window.showErrorMessage(i18n.localize('process.stopFailed'));
            }
        });
        return;
    }

    // 管理单个进程
    const processOptions = runningProcesses.map(process => ({
        label: process.name,
        description: i18n.localize('process.runningTime', formatRunningTime(process.startTime)),
        detail: i18n.localize('process.debugSessionId', process.id),
        process: process
    }));

    const selectedProcess = await vscode.window.showQuickPick(processOptions, {
        title: i18n.localize('process.selectToManage'),
        placeHolder: i18n.localize('common.select')
    });

    if (!selectedProcess) {
        return;
    }

    const process = selectedProcess.process;

    const action = await vscode.window.showQuickPick([
        { 
            label: `$(debug-stop) ${i18n.localize('common.stop')}`, 
            value: 'stop' 
        },
        { 
            label: `$(debug-restart) ${i18n.localize('common.restart')}`, 
            value: 'restart' 
        }
    ], {
        placeHolder: i18n.localize('process.manageProcess', process.name)
    });

    if (!action) {
        return;
    }

    switch (action.value) {
        case 'stop':
            // 直接执行停止操作，不显示确认对话框
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: i18n.localize('process.stopping', process.name),
                cancellable: false
            }, async () => {
                const success = await runningProcessManager.stopProcess(process.id);
                if (success) {
                    vscode.window.showInformationMessage(i18n.localize('process.stopped', process.name));
                } else {
                    vscode.window.showErrorMessage(i18n.localize('process.stopFailed.single', process.name));
                }
            });
            break;
        case 'restart':
            // 直接执行重启操作，不显示确认对话框
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: i18n.localize('process.restarting', process.name),
                cancellable: false
            }, async () => {
                const success = await runningProcessManager.restartProcess(process.id);
                if (success) {
                    vscode.window.showInformationMessage(i18n.localize('process.restarted', process.name));
                } else {
                    vscode.window.showErrorMessage(i18n.localize('process.restartFailed.single', process.name));
                }
            });
            break;
    }
}

/**
 * 格式化运行时间
 */
function formatRunningTime(startTime: Date): string {
    const i18n = I18nService.getInstance();
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    
    const seconds = Math.floor(diffMs / 1000) % 60;
    const minutes = Math.floor(diffMs / (1000 * 60)) % 60;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (hours > 0) {
        return i18n.localize('time.hoursMinutes', hours, minutes);
    } else if (minutes > 0) {
        return i18n.localize('time.minutesSeconds', minutes, seconds);
    } else {
        return i18n.localize('time.seconds', seconds);
    }
}

export function deactivate() {
    console.log('Java Launcher 插件已停用');
}
