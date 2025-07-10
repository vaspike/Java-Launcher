import * as vscode from 'vscode';

/**
 * 国际化服务
 */
export class I18nService {
    private static instance: I18nService;
    private locale: string;

    private messages: { [key: string]: { [locale: string]: string } } = {
        // 通用
        'common.refresh': {
            'en': 'Refresh',
            'zh-cn': '刷新'
        },
        'common.run': {
            'en': 'Run',
            'zh-cn': '运行'
        },
        'common.debug': {
            'en': 'Debug',
            'zh-cn': '调试'
        },
        'common.stop': {
            'en': 'Stop',
            'zh-cn': '停止'
        },
        'common.restart': {
            'en': 'Restart',
            'zh-cn': '重启'
        },
        'common.add': {
            'en': 'Add',
            'zh-cn': '添加'
        },
        'common.remove': {
            'en': 'Remove',
            'zh-cn': '移除'
        },
        'common.delete': {
            'en': 'Delete',
            'zh-cn': '删除'
        },
        'common.edit': {
            'en': 'Edit',
            'zh-cn': '编辑'
        },
        'common.search': {
            'en': 'Search',
            'zh-cn': '搜索'
        },
        'common.cancel': {
            'en': 'Cancel',
            'zh-cn': '取消'
        },
        'common.confirm': {
            'en': 'Confirm',
            'zh-cn': '确认'
        },
        'common.success': {
            'en': 'Success',
            'zh-cn': '成功'
        },
        'common.failed': {
            'en': 'Failed',
            'zh-cn': '失败'
        },
        'common.loading': {
            'en': 'Loading...',
            'zh-cn': '加载中'
        },
        'common.select': {
            'en': 'Select',
            'zh-cn': '选择'
        },

        // 运行中进程管理
        'process.manage': {
            'en': 'Manage Running Java Processes',
            'zh-cn': '管理运行中的Java进程'
        },
        'process.noRunning': {
            'en': 'No Java processes are currently running.',
            'zh-cn': '当前没有运行中的Java进程。'
        },
        'process.selectAction': {
            'en': 'Select an action',
            'zh-cn': '选择一个操作'
        },
        'process.manageSingle': {
            'en': 'Manage a Single Process',
            'zh-cn': '管理单个进程'
        },
        'process.restartAll': {
            'en': 'Restart All Processes',
            'zh-cn': '重启所有进程'
        },
        'process.stopAll': {
            'en': 'Stop All Processes',
            'zh-cn': '停止所有进程'
        },
        'process.currentRunning': {
            'en': '{0} Java processes are currently running.',
            'zh-cn': '当前有 {0} 个Java进程正在运行'
        },
        'process.restartingAll': {
            'en': 'Restarting all Java processes...',
            'zh-cn': '正在重启所有Java进程'
        },
        'process.stoppingAll': {
            'en': 'Stopping all Java processes...',
            'zh-cn': '正在停止所有Java进程'
        },
        'process.allRestarted': {
            'en': 'All Java processes were restarted.',
            'zh-cn': '所有Java进程已重启'
        },
        'process.allStopped': {
            'en': 'All Java processes were stopped.',
            'zh-cn': '所有Java进程已停止'
        },
        'process.restartFailed': {
            'en': 'Failed to restart one or more processes.',
            'zh-cn': '重启部分或全部进程失败'
        },
        'process.stopFailed': {
            'en': 'Failed to stop one or more processes.',
            'zh-cn': '停止部分或全部进程失败'
        },
        'process.selectToManage': {
            'en': 'Select a Java process to manage',
            'zh-cn': '选择要管理的Java进程'
        },
        'process.runningTime': {
            'en': 'Running for: {0}',
            'zh-cn': '已运行: {0}'
        },
        'process.debugSessionId': {
            'en': 'Debug Session ID: {0}',
            'zh-cn': '调试会话ID: {0}'
        },
        'process.manageProcess': {
            'en': 'Manage Process: {0}',
            'zh-cn': '管理进程: {0}'
        },
        'process.stopping': {
            'en': 'Stopping process "{0}"...',
            'zh-cn': '正在停止进程 "{0}"'
        },
        'process.restarting': {
            'en': 'Restarting process "{0}"...',
            'zh-cn': '正在重启进程 "{0}"'
        },
        'process.stopped': {
            'en': 'Process "{0}" has been stopped.',
            'zh-cn': '进程 "{0}" 已停止'
        },
        'process.restarted': {
            'en': 'Process "{0}" has been restarted.',
            'zh-cn': '进程 "{0}" 已重启'
        },
        'process.stopFailed.single': {
            'en': 'Failed to stop process "{0}".',
            'zh-cn': '停止进程 "{0}" 失败'
        },
        'process.restartFailed.single': {
            'en': 'Failed to restart process "{0}".',
            'zh-cn': '重启进程 "{0}" 失败'
        },

        // 时间格式化
        'time.hoursMinutes': {
            'en': '{0}h {1}m',
            'zh-cn': '{0}小时 {1}分钟'
        },
        'time.minutesSeconds': {
            'en': '{0}m {1}s',
            'zh-cn': '{0}分钟 {1}秒'
        },
        'time.seconds': {
            'en': '{0}s',
            'zh-cn': '{0}秒'
        },

        // 搜索
        'search.andRun': {
            'en': 'Search and Run Java Entry Point',
            'zh-cn': '搜索并运行Java入口点'
        },
        'search.placeholder': {
            'en': 'Search for Java entry points or aggregated configurations',
            'zh-cn': '输入关键字搜索Java入口点或聚合配置'
        },
        'search.failed': {
            'en': 'Failed to search for Java entry points: {0}',
            'zh-cn': '搜索Java入口点失败: {0}'
        },
        'search.noResults': {
            'en': 'No matching Java entry points were found.',
            'zh-cn': '未找到匹配的Java入口点'
        },

        // 命令面板
        'command.showAll': {
            'en': 'Show All Commands',
            'zh-cn': '显示所有命令'
        },
        'command.javaLauncherCommands': {
            'en': 'Java Launcher Commands',
            'zh-cn': 'Java Launcher 命令'
        },
        'command.selectCommand': {
            'en': 'Select a command to execute',
            'zh-cn': '选择要执行的命令'
        },
        'command.executeCommandFailed': {
            'en': 'Failed to execute command: {0}',
            'zh-cn': '执行命令失败: {0}'
        },
        'command.manageRunningProcesses': {
            'en': 'Manage Running Java Processes',
            'zh-cn': '管理运行中的Java进程'
        },
        'command.manageRunningProcessesDescription': {
            'en': 'Manage Running Java Processes',
            'zh-cn': '管理运行中的Java进程'
        },
        'command.manageRunningProcessesDetail': {
            'en': 'View, stop, or restart running Java processes.',
            'zh-cn': '查看、停止或重启正在运行的 Java 进程'
        },
        'command.scanEntries': {
            'en': 'Scan Java Entry Points',
            'zh-cn': '扫描Java入口点'
        },
        'command.scanEntriesDescription': {
            'en': 'Scan Java Entry Points',
            'zh-cn': '扫描Java入口点'
        },
        'command.scanEntriesDetail': {
            'en': 'Scans the project for all runnable Java main classes and test methods.',
            'zh-cn': '扫描项目，查找所有可运行的 Java 主类和测试方法'
        },
        'command.searchAndRun': {
            'en': 'Search and Run Java Entry Point',
            'zh-cn': '搜索并运行Java入口点'
        },
        'command.searchAndRunDescription': {
            'en': 'Search and Run Java Entry or Aggregated Configuration',
            'zh-cn': '搜索并运行 Java 入口或聚合配置'
        },
        'command.searchAndRunDetail': {
            'en': 'Quickly find and run a Java entry point or an aggregated configuration.',
            'zh-cn': '快速查找并运行 Java 入口点或聚合配置'
        },
        'command.generateConfigs': {
            'en': 'Generate Launch Configurations',
            'zh-cn': '生成启动配置'
        },
        'command.generateConfigsDescription': {
            'en': 'Generate Launch Configurations',
            'zh-cn': '生成启动配置'
        },
        'command.generateConfigsDetail': {
            'en': 'Scans the project and generates launch.json configurations.',
            'zh-cn': '扫描项目并生成 launch.json 配置文件'
        },
        'command.createAggregated': {
            'en': 'Create Aggregated Launch Configuration',
            'zh-cn': '创建聚合启动配置'
        },
        'command.createAggregatedDescription': {
            'en': 'Create a new configuration to run multiple launch configurations together.',
            'zh-cn': '创建一个新的配置，用于同时运行多个启动配置'
        },
        'command.createAggregatedDetail': {
            'en': 'Combines multiple launch configurations into a single one for sequential execution.',
            'zh-cn': '将多个启动配置组合成一个，以便按顺序执行'
        },
        'command.manageAggregated': {
            'en': 'Manage Aggregated Launch Configurations',
            'zh-cn': '管理聚合启动配置'
        },
        'command.manageAggregatedDescription': {
            'en': 'Manage Aggregated Launch Configurations',
            'zh-cn': '管理聚合启动配置'
        },
        'command.manageAggregatedDetail': {
            'en': 'Edit, delete, or view details of existing aggregated configurations.',
            'zh-cn': '编辑、删除或查看已有的聚合启动配置'
        },
        'command.executeAggregated': {
            'en': 'Execute Aggregated Launch Configuration',
            'zh-cn': '执行聚合启动配置'
        },
        'command.executeAggregatedDescription': {
            'en': 'Execute Aggregated Launch Configuration',
            'zh-cn': '执行聚合启动配置'
        },
        'command.executeAggregatedDetail': {
            'en': 'Select and run an aggregated launch configuration.',
            'zh-cn': '选择并运行一个聚合启动配置'
        },
        'command.debugAggregated': {
            'en': 'Debug Aggregated Launch Configuration',
            'zh-cn': '调试聚合启动配置'
        },
        'command.debugAggregatedDescription': {
            'en': 'Debug Aggregated Launch Configuration',
            'zh-cn': '调试聚合启动配置'
        },
        'command.debugAggregatedDetail': {
            'en': 'View detailed information and debug aggregated configurations.',
            'zh-cn': '查看聚合启动配置的详细信息和调试信息'
        },
        'command.refreshTreeView': {
            'en': 'Refresh View',
            'zh-cn': '刷新视图'
        },
        'command.refreshTreeViewDescription': {
            'en': 'Refresh Tree View',
            'zh-cn': '刷新视图'
        },
        'command.refreshTreeViewDetail': {
            'en': 'Rescan the project and refresh the Java Launcher side bar.',
            'zh-cn': '重新扫描项目并刷新 Java Launcher 侧边栏'
        },
        'command.setSpringProfile': {
            'en': 'Set Spring Active Profile',
            'zh-cn': '设置Spring Profile'
        },
        'command.setSpringProfileDescription': {
            'en': 'Set Spring Active Profile',
            'zh-cn': '设置Spring Profile'
        },
        'command.setSpringProfileDetail': {
            'en': 'Set the active profile for a Spring Boot application (e.g., dev, test, prod).',
            'zh-cn': '为 Spring Boot 应用设置活动的配置文件（如：dev, test, prod）'
        },
        'command.setAllSpringProfiles': {
            'en': 'Set All Spring Boot Profiles',
            'zh-cn': '批量设置Spring Profile'
        },
        'command.setAllSpringProfilesDescription': {
            'en': 'Set All Spring Boot Profiles',
            'zh-cn': '批量设置Spring Profile'
        },
        'command.setAllSpringProfilesDetail': {
            'en': 'Set the same active profile for all Spring Boot applications in the workspace.',
            'zh-cn': '为工作区中所有的 Spring Boot 应用设置相同的活动配置文件'
        },
        'command.setAllJmxRemoteStatus': {
            'en': 'Set JMX Remote Status for All Configurations',
            'zh-cn': '设置所有启动配置的JMX远程管理状态'
        },
        'command.setAllJmxRemoteStatusDescription': {
            'en': 'Set All JMX Remote Status',
            'zh-cn': '设置所有启动配置的JMX远程管理状态'
        },
        'command.setAllJmxRemoteStatusDetail': {
            'en': 'Enable or disable JMX remote management for all Java launch configurations.',
            'zh-cn': '为所有 Java 启动配置启用或禁用 JMX 远程管理'
        },

        // 插件激活
        'extension.activated': {
            'en': 'Java Launcher has been activated!',
            'zh-cn': 'Java Launcher 插件已激活！'
        },

        // 启动配置
        'config.generating': {
            'en': 'Generating launch configurations...',
            'zh-cn': '正在生成启动配置...'
        },
        'config.scanningProject': {
            'en': 'Scanning project structure...',
            'zh-cn': '扫描项目结构...'
        },
        'config.analyzingEntries': {
            'en': 'Analyzing Java entry points...',
            'zh-cn': '分析 Java 入口点...'
        },
        'config.noEntries': {
            'en': 'No Java entry points were found.',
            'zh-cn': '未发现任何 Java 入口点'
        },
        'config.generateSuccess': {
            'en': 'Successfully generated launch configurations!',
            'zh-cn': '成功生成启动配置！'
        },
        'config.stats': {
            'en': 'Found {0} entry points:\n- Spring Boot: {1}\n- Java Applications: {2}\n- Test Classes: {3}\n- Test Methods: {4}',
            'zh-cn': '发现 {0} 个入口点:\n- Spring Boot 应用: {1}\n- Java 应用: {2}\n- 测试类: {3}\n- 测试方法: {4}'
        },

        // 扫描Java入口点
        'scan.scanning': {
            'en': 'Scanning Java entry points...',
            'zh-cn': '正在扫描 Java 入口点...'
        },
        'scan.scanningProject': {
            'en': 'Scanning project...',
            'zh-cn': '扫描项目...'
        },
        'scan.complete': {
            'en': 'Scan complete. Found {0} entry points.',
            'zh-cn': '扫描完成！发现 {0} 个入口点'
        },
        'scan.viewDetails': {
            'en': 'View Details',
            'zh-cn': '查看详情'
        },
        'scan.generateConfig': {
            'en': 'Generate Configurations',
            'zh-cn': '生成配置'
        },
        'scan.configGenerated': {
            'en': 'Launch configurations were generated.',
            'zh-cn': '启动配置已生成！'
        },

        // 聚合启动配置
        'aggregated.notFound': {
            'en': 'Aggregated launch configuration "{0}" was not found.',
            'zh-cn': '未找到聚合启动配置 "{0}"'
        },
        'aggregated.noEnabledItems': {
            'en': 'Configuration "{0}" has no enabled launch items.',
            'zh-cn': '聚合启动配置 "{0}" 中没有启用的启动项'
        },
        'aggregated.executing': {
            'en': 'Running aggregated launch: {0}',
            'zh-cn': '执行聚合启动: {0}'
        },
        'aggregated.launching': {
            'en': 'Launching: {0} ({1}/{2})',
            'zh-cn': '正在启动 {0} ({1}/{2})'
        },
        'aggregated.launchFailed': {
            'en': 'Failed to launch "{0}": {1}',
            'zh-cn': '启动 "{0}" 失败: {1}'
        },
        'aggregated.continue': {
            'en': 'Continue',
            'zh-cn': '继续'
        },
        'aggregated.stop': {
            'en': 'Stop',
            'zh-cn': '停止'
        },
        'aggregated.confirmDelete': {
            'en': 'Are you sure you want to delete the "{0}" aggregated configuration?',
            'zh-cn': '确定要删除聚合启动配置 "{0}" 吗？'
        },
        'aggregated.deleted': {
            'en': 'The "{0}" configuration has been deleted.',
            'zh-cn': '配置 "{0}" 已删除'
        },

        // 工作区
        'workspace.openFirst': {
            'en': 'Please open a project folder or workspace first.',
            'zh-cn': '请先打开一个工作区'
        },

        // 视图
        'view.refreshed': {
            'en': 'Java Launcher view has been refreshed.',
            'zh-cn': 'Java Launcher视图已刷新'
        },
        'view.refreshFailed': {
            'en': 'Failed to refresh view: {0}',
            'zh-cn': '刷新视图失败: {0}'
        },

        // 调试
        'debug.report': {
            'en': 'Debug information has been logged to the Developer Tools console.',
            'zh-cn': '调试信息已输出到开发者控制台'
        },
        'debug.viewConsole': {
            'en': 'Open Console',
            'zh-cn': '查看控制台'
        },
        'debug.copyClipboard': {
            'en': 'Copy to Clipboard',
            'zh-cn': '复制到剪贴板'
        },
        'debug.copied': {
            'en': 'Debug information copied to clipboard.',
            'zh-cn': '调试信息已复制到剪贴板'
        }
    };

    private constructor() {
        // 获取VSCode界面语言设置
        this.locale = vscode.env.language || 'en';
        
        // 如果不是中文，默认使用英文
        if (this.locale !== 'zh-cn') {
            this.locale = 'en';
        }
    }

    /**
     * 获取单例实例
     */
    public static getInstance(): I18nService {
        if (!I18nService.instance) {
            I18nService.instance = new I18nService();
        }
        return I18nService.instance;
    }

    /**
     * 获取当前语言环境
     */
    public getLocale(): string {
        return this.locale;
    }

    /**
     * 设置语言环境
     */
    public setLocale(locale: string): void {
        if (locale === 'zh-cn' || locale === 'en') {
            this.locale = locale;
        }
    }

    /**
     * 获取翻译文本
     * @param key 文本键
     * @param params 替换参数
     */
    public localize(key: string, ...params: any[]): string {
        const message = this.messages[key]?.[this.locale] || key;
        
        if (params.length === 0) {
            return message;
        }

        // 替换参数 {0}, {1}, ...
        return message.replace(/{(\d+)}/g, (match, index) => {
            const paramIndex = parseInt(index, 10);
            return params[paramIndex] !== undefined ? params[paramIndex].toString() : match;
        });
    }
} 