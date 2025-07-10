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

        // 国际化新增
        'common.enabled': {
            'en': 'Enabled',
            'zh-cn': '启用'
        },
        'common.disabled': {
            'en': 'Disabled',
            'zh-cn': '禁用'
        },
        'common.error': {
            'en': 'Error',
            'zh-cn': '错误'
        },
        'common.unknown': {
            'en': 'Unknown',
            'zh-cn': '未知'
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
        },

        // 树视图
        'tree.javaEntries.tooltip': {
            'en': 'Java Entry Points',
            'zh-cn': 'Java 入口点'
        },
        'tree.aggregatedConfigs.tooltip': {
            'en': 'Aggregated Launch Configurations',
            'zh-cn': '聚合启动配置'
        },
        'tree.springBootApp.tooltip': {
            'en': 'Spring Boot App: {0}',
            'zh-cn': 'Spring Boot 应用: {0}'
        },
        'tree.javaApp.tooltip': {
            'en': 'Java App: {0}',
            'zh-cn': 'Java 应用: {0}'
        },
        'tree.testClass.tooltip': {
            'en': 'Test Class: {0}',
            'zh-cn': '测试类: {0}'
        },
        'tree.testMethod.tooltip': {
            'en': 'Test Method: {0}',
            'zh-cn': '测试方法: {0}'
        },
        'tree.aggregatedConfig.tooltip': {
            'en': 'Aggregated Launch Config: {0}',
            'zh-cn': '聚合启动配置: {0}'
        },
        'tree.aggregatedItem.tooltip': {
            'en': 'Launch Item: {0} ({1})',
            'zh-cn': '启动项: {0} ({1})'
        },
        'tree.javaEntries.label': {
            'en': 'Java Entry Points',
            'zh-cn': 'Java 入口点'
        },
        'tree.aggregatedConfigs.label': {
            'en': 'Aggregated Launch Configurations',
            'zh-cn': '聚合启动配置'
        },
        'tree.noMatchingJavaEntries': {
            'en': 'No Java entry points found matching "{0}"',
            'zh-cn': '未找到匹配 "{0}" 的Java入口点'
        },
        'tree.loadFailed': {
            'en': 'Load failed, please try again.',
            'zh-cn': '加载失败，请重试'
        },
        'tree.noMatchingAggregatedConfigs': {
            'en': 'No aggregated launch configurations found matching "{0}"',
            'zh-cn': '未找到匹配 "{0}" 的聚合启动配置'
        },
        'tree.noAggregatedConfigs': {
            'en': 'No aggregated launch configurations available.',
            'zh-cn': '暂无聚合启动配置'
        },
        'tree.noLaunchItems': {
            'en': 'No launch items available.',
            'zh-cn': '暂无启动项'
        },
        'tree.noMatchingLaunchItems': {
            'en': 'No launch items found matching "{0}"',
            'zh-cn': '未找到匹配 "{0}" 的启动项'
        },
        'tree.itemWithDelay': {
            'en': '{0} (Delay: {1}ms)',
            'zh-cn': '{0} (延迟: {1}ms)'
        },

        // 文件系统
        'fs.readFileFailed': {
            'en': 'Failed to read file: {0}, Error: {1}',
            'zh-cn': '读取文件失败: {0}, 错误: {1}'
        },
        'fs.writeFileFailed': {
            'en': 'Failed to write file: {0}, Error: {1}',
            'zh-cn': '写入文件失败: {0}, 错误: {1}'
        },
        'fs.createDirFailed': {
            'en': 'Failed to create directory: {0}, Error: {1}',
            'zh-cn': '创建目录失败: {0}, 错误: {1}'
        },
        'fs.getStatsFailed': {
            'en': 'Failed to get file stats: {0}, Error: {1}',
            'zh-cn': '获取文件信息失败: {0}, 错误: {1}'
        },
        'fs.readDirFailed': {
            'en': 'Failed to read directory: {0}, Error: {1}',
            'zh-cn': '读取目录失败: {0}, 错误: {1}'
        },
        'fs.readJsonFailed': {
            'en': 'Failed to read JSON file: {0}, Error: {1}',
            'zh-cn': '读取 JSON 文件失败: {0}, 错误: {1}'
        },
        'fs.writeJsonFailed': {
            'en': 'Failed to write JSON file: {0}, Error: {1}',
            'zh-cn': '写入 JSON 文件失败: {0}, 错误: {1}'
        },

        // Java 入口点
        'entry.springBoot.description': {
            'en': 'Spring Boot Application Entry Point',
            'zh-cn': 'Spring Boot 应用入口点'
        },
        'entry.javaApp.description': {
            'en': 'Java Application Entry Point',
            'zh-cn': 'Java 应用入口点'
        },
        'entry.testClass.description': {
            'en': '{0} Test Class',
            'zh-cn': '{0} 测试类'
        },
        'entry.testMethod.description': {
            'en': '{0} Test Method',
            'zh-cn': '{0} 测试方法'
        },
        'entry.framework.junit4': {
            'en': 'JUnit 4',
            'zh-cn': 'JUnit 4'
        },
        'entry.framework.junit5': {
            'en': 'JUnit 5',
            'zh-cn': 'JUnit 5'
        },
        'entry.framework.testng': {
            'en': 'TestNG',
            'zh-cn': 'TestNG'
        },
        'entry.framework.junit': {
            'en': 'JUnit',
            'zh-cn': 'JUnit'
        },
        'entry.invalid': {
            'en': 'Invalid Java entry point, please select again.',
            'zh-cn': 'Java入口点无效，请重新选择'
        },

        // 扫描
        'scan.projectFailed': {
            'en': 'Failed to scan project: {0}',
            'zh-cn': '扫描项目失败: {0}'
        },
        'scan.unsupportedProjectType': {
            'en': 'Unsupported project type: {0}',
            'zh-cn': '不支持的项目类型: {0}'
        },

        // 工作区
        'workspace.notFound': {
            'en': 'Workspace not found.',
            'zh-cn': '未找到工作区'
        },
        'workspace.folderNotFound': {
            'en': 'Workspace folder not found.',
            'zh-cn': '未找到工作区文件夹'
        },
        'workspace.noWorkspace': {
            'en': 'No workspace folder is open.',
            'zh-cn': '未打开工作区文件夹'
        },
        
        // 启动配置
        'config.launchNotFoundOrFailed': {
            'en': 'Launch configuration "{0}" not found or failed to start.',
            'zh-cn': '未找到启动配置 "{0}" 或启动失败'
        },
        'config.executeLaunchFailed': {
            'en': 'Failed to execute launch configuration: {0}',
            'zh-cn': '执行启动配置失败: {0}'
        },
        'config.readLaunchJsonFailed': {
            'en': 'Failed to read launch configuration: {0}',
            'zh-cn': '读取启动配置失败: {0}'
        },
        'config.launchJsonNotFoundPath': {
            'en': 'launch.json file does not exist: {0}',
            'zh-cn': 'launch.json文件不存在: {0}'
        },
        'config.previewFailed': {
            'en': 'Failed to generate configuration preview: {0}',
            'zh-cn': '生成配置预览失败: {0}'
        },
        'config.runJavaEntryFailed': {
            'en': 'Failed to run Java entry point: {0}',
            'zh-cn': '运行Java入口点失败: {0}'
        },
        'config.addToAggregatedFailed': {
            'en': 'Failed to add to aggregated configuration: {0}',
            'zh-cn': '添加到聚合配置失败: {0}'
        },
        'config.updateConfigFailed': {
            'en': 'Failed to update configuration: {0}',
            'zh-cn': '更新配置失败: {0}'
        },
        'config.setJmxRemoteStatusFailed': {
            'en': 'Failed to set JMX remote status: {0}',
            'zh-cn': '设置JMX远程管理状态失败: {0}'
        },
        'config.launchSuccess': {
            'en': 'Successfully launched: {0}',
            'zh-cn': '成功启动: {0}'
        },
        'config.searchAndRunJavaEntryOrConfig': {
            'en': 'Search and Run Java Entry or Aggregated Configuration',
            'zh-cn': '搜索并运行Java入口点或聚合配置'
        },
        'config.inputSearchQuery': {
            'en': 'Enter keywords to search for Java entry points or aggregated configurations',
            'zh-cn': '输入关键字搜索Java入口点或聚合配置'
        },
        'config.project': {
            'en': 'Project',
            'zh-cn': '项目'
        },
        'config.launchItems': {
            'en': 'Launch Items',
            'zh-cn': '启动项'
        },
        'config.aggregatedLaunchConfig': {
            'en': 'Aggregated Launch Configuration',
            'zh-cn': '聚合启动配置'
        },
        'config.runSuccess': {
            'en': 'Successfully started: {0}',
            'zh-cn': '成功运行: {0}'
        },
        'config.noConfigs': {
            'en': 'No launch configurations found. Please create a `launch.json` file or generate configurations first.',
            'zh-cn': '未找到任何启动配置。请先创建 `launch.json` 文件或生成配置。'
        },
        'config.checkConsole': {
            'en': 'Check the developer console for more details.',
            'zh-cn': '请检查开发者控制台以获取更多信息。'
        },
        'config.readConfigFailed': {
            'en': 'Failed to read launch configurations: {0}',
            'zh-cn': '读取启动配置失败: {0}'
        },
        'config.ensureConfigFile': {
            'en': 'Please ensure `launch.json` exists and is correctly formatted.',
            'zh-cn': '请确保 `launch.json` 文件存在且格式正确。'
        },
        'config.inputNamePrompt': {
            'en': 'Enter a name for the new aggregated launch configuration',
            'zh-cn': '请输入新聚合启动配置的名称'
        },
        'config.inputNamePlaceholder': {
            'en': 'e.g., "Start All Services"',
            'zh-cn': '例如："启动所有服务"'
        },
        'config.nameEmpty': {
            'en': 'The name cannot be empty.',
            'zh-cn': '名称不能为空。'
        },
        'config.nameExists': {
            'en': 'An aggregated configuration with this name already exists.',
            'zh-cn': '已存在同名的聚合配置。'
        },
        'config.inputDescriptionPrompt': {
            'en': 'Enter a description for the aggregated launch configuration (optional)',
            'zh-cn': '请输入聚合启动配置的描述（可选）'
        },
        'config.inputDescriptionPlaceholder': {
            'en': 'e.g., "Launches the backend and frontend servers"',
            'zh-cn': '例如："启动后端和前端服务"'
        },
        'config.selectConfigs': {
            'en': 'Select the launch configurations to include',
            'zh-cn': '选择要包含的启动配置'
        },
        'config.selectAtLeastOne': {
            'en': 'You must select at least one launch configuration.',
            'zh-cn': '您必须至少选择一个启动配置。'
        },
        'config.aggregatedCreated': {
            'en': 'Successfully created aggregated launch configuration "{0}".',
            'zh-cn': '成功创建聚合启动配置 "{0}"。'
        },
        'config.noAggregated': {
            'en': 'No aggregated launch configurations found.',
            'zh-cn': '未找到聚合启动配置。'
        },
        'config.createConfig': {
            'en': 'Create a new one',
            'zh-cn': '创建一个新的'
        },
        'config.enabledItems': {
            'en': 'enabled',
            'zh-cn': '已启用'
        },
        'config.selectToManage': {
            'en': 'Select an aggregated configuration to manage',
            'zh-cn': '选择要管理的聚合启动配置'
        },
        'config.execute': {
            'en': 'Execute',
            'zh-cn': '执行'
        },
        'config.viewDetails': {
            'en': 'View Details',
            'zh-cn': '查看详情'
        },
        'config.manageConfig': {
            'en': 'Manage Configuration: {0}',
            'zh-cn': '管理配置: {0}'
        },
        'config.confirmDelete': {
            'en': 'Are you sure you want to delete the "{0}" configuration?',
            'zh-cn': '确定要删除配置 "{0}" 吗？'
        },
        'config.cancel': {
            'en': 'Cancel',
            'zh-cn': '取消'
        },
        'config.configDeleted': {
            'en': 'Configuration "{0}" has been deleted.',
            'zh-cn': '配置 "{0}" 已删除。'
        },
        'config.notFound': {
            'en': 'Configuration "{0}" not found.',
            'zh-cn': '未找到配置 "{0}"。'
        },
        'config.editDescription': {
            'en': 'Edit Description',
            'zh-cn': '编辑描述'
        },
        'config.manageItems': {
            'en': 'Manage Launch Items',
            'zh-cn': '管理启动项'
        },
        'config.addItem': {
            'en': 'Add Launch Item',
            'zh-cn': '添加启动项'
        },
        'config.editConfig': {
            'en': 'Edit Configuration: {0}',
            'zh-cn': '编辑配置: {0}'
        },
        'config.inputNewDescription': {
            'en': 'Enter the new description',
            'zh-cn': '请输入新的描述'
        },
        'config.descriptionUpdated': {
            'en': 'Description has been updated.',
            'zh-cn': '描述已更新。'
        },
        'config.noItems': {
            'en': 'This configuration has no launch items.',
            'zh-cn': '此配置没有启动项。'
        },
        'config.delay': {
            'en': 'Delay',
            'zh-cn': '延迟'
        },
        'config.noDelay': {
            'en': 'No delay',
            'zh-cn': '无延迟'
        },
        'config.selectToManageItem': {
            'en': 'Select a launch item to manage',
            'zh-cn': '选择要管理的启动项'
        },
        'config.toggleEnabled': {
            'en': 'Toggle Enabled/Disabled',
            'zh-cn': '切换启用/禁用'
        },
        'config.setDelay': {
            'en': 'Set Delay',
            'zh-cn': '设置延迟'
        },
        'config.remove': {
            'en': 'Remove',
            'zh-cn': '移除'
        },
        'config.manageItem': {
            'en': 'Manage Item: {0}',
            'zh-cn': '管理项: {0}'
        },
        'config.itemToggled': {
            'en': 'Item has been {0}.',
            'zh-cn': '启动项已{0}。'
        },
        'config.disabled': {
            'en': 'disabled',
            'zh-cn': '禁用'
        },
        'config.enabled': {
            'en': 'enabled',
            'zh-cn': '启用'
        },
        'config.inputDelayTime': {
            'en': 'Enter delay time in milliseconds (e.g., 1000 for 1 second)',
            'zh-cn': '输入延迟时间（毫秒，例如 1000 代表 1 秒）'
        },
        'config.invalidNonNegativeNumber': {
            'en': 'Please enter a valid non-negative number.',
            'zh-cn': '请输入一个有效的非负数。'
        },
        'config.delaySet': {
            'en': 'Delay has been set to {0}ms.',
            'zh-cn': '延迟已设置为 {0}ms。'
        },
        'config.itemRemoved': {
            'en': 'Item "{0}" has been removed.',
            'zh-cn': '启动项 "{0}" 已移除。'
        },
        'config.allConfigsAdded': {
            'en': 'All available launch configurations have already been added.',
            'zh-cn': '所有可用的启动配置均已添加。'
        },
        'config.selectConfigToAdd': {
            'en': 'Select a launch configuration to add',
            'zh-cn': '选择要添加的启动配置'
        },
        'config.itemAdded': {
            'en': 'Item "{0}" has been added.',
            'zh-cn': '启动项 "{0}" 已添加。'
        },
        'config.aggregatedDetails': {
            'en': 'Aggregated Launch Configuration Details',
            'zh-cn': '聚合启动配置详情'
        },
        'config.name': {
            'en': 'Name',
            'zh-cn': '名称'
        },
        'config.description': {
            'en': 'Description',
            'zh-cn': '描述'
        },
        'config.noDescription': {
            'en': 'No description provided',
            'zh-cn': '未提供描述'
        },
        'config.createdAt': {
            'en': 'Created At',
            'zh-cn': '创建时间'
        },
        'config.lastModified': {
            'en': 'Last Modified',
            'zh-cn': '最后修改'
        },
        'config.aggregatedDebugReport': {
            'en': 'Aggregated Launch Debug Report',
            'zh-cn': '聚合启动调试报告'
        },
        'config.workspacePath': {
            'en': 'Workspace Path',
            'zh-cn': '工作区路径'
        },
        'config.availableConfigs': {
            'en': 'Available Launch Configurations',
            'zh-cn': '可用的启动配置'
        },
        'config.launchJsonStatus': {
            'en': 'launch.json Status',
            'zh-cn': 'launch.json 状态'
        },
        'config.fileExists': {
            'en': 'File exists',
            'zh-cn': '文件存在'
        },
        'config.configCount': {
            'en': 'Configurations found',
            'zh-cn': '找到的配置数量'
        },
        'config.configList': {
            'en': 'Configuration names',
            'zh-cn': '配置名称列表'
        },
        'config.fileNotFound': {
            'en': 'File not found',
            'zh-cn': '文件未找到'
        },
        'config.aggregatedConfigs': {
            'en': 'Aggregated Launch Configurations',
            'zh-cn': '聚合启动配置'
        },
        'config.detailedConfigs': {
            'en': 'Detailed Aggregated Configurations',
            'zh-cn': '聚合配置详情'
        },
        'config.debugInfoOutput': {
            'en': 'Debug information has been logged to the Developer Tools console.',
            'zh-cn': '调试信息已输出到开发者控制台。'
        },
        'config.copyToClipboard': {
            'en': 'Copy to Clipboard',
            'zh-cn': '复制到剪贴板'
        },
        'config.viewConsole': {
            'en': 'View in Console',
            'zh-cn': '在控制台查看'
        },
        'config.debugInfoCopied': {
            'en': 'Debug information has been copied to the clipboard.',
            'zh-cn': '调试信息已复制到剪贴板。'
        },
        'config.debugFailed': {
            'en': 'An error occurred during the debug process: {0}',
            'zh-cn': '调试过程中发生错误: {0}'
        },
        'config.launchFailed': {
            'en': 'Failed to start debugging for "{0}".',
            'zh-cn': '启动调试失败: "{0}"。'
        },
        'config.createNewConfig': {
            'en': 'Create a new configuration',
            'zh-cn': '创建新配置'
        },
        'config.selectAggregatedConfig': {
            'en': 'Select an aggregated configuration to add "{0}" to',
            'zh-cn': '选择要将 "{0}" 添加到的聚合配置'
        },
        'config.itemExists': {
            'en': 'The item "{0}" already exists in the configuration "{1}".',
            'zh-cn': '启动项 "{0}" 已存在于配置 "{1}" 中。'
        },
        'config.itemAddedToAggregated': {
            'en': 'Successfully added "{0}" to the "{1}" aggregated configuration.',
            'zh-cn': '成功将 "{0}" 添加到聚合配置 "{1}"。'
        },
        'config.noSpringBootApps': {
            'en': 'No Spring Boot applications found in this workspace.',
            'zh-cn': '在此工作区中未找到 Spring Boot 应用。'
        },
        'config.getProfileFailed': {
            'en': 'Failed to get current profile for {0}',
            'zh-cn': '获取 {0} 的当前配置文件失败'
        },
        'config.currentProfileSet': {
            'en': 'Current active profile(s)',
            'zh-cn': '当前活动的配置文件'
        },
        'config.noProfileSet': {
            'en': 'No profiles are currently set',
            'zh-cn': '当前未设置任何配置文件'
        },
        'config.batchSetSpringBootProfile': {
            'en': 'Batch Set Spring Boot Profiles ({0} apps)',
            'zh-cn': '批量设置 Spring Boot Profile ({0} 个应用)'
        },
        'config.inputProfileName': {
            'en': 'Enter the new active profile (e.g., {0})',
            'zh-cn': '输入新的活动配置文件（例如：{0}）'
        },
        'config.inputProfileNamePlaceholder': {
            'en': 'e.g., dev, test, prod',
            'zh-cn': '例如：dev、test、prod'
        },
        'config.profileNameEmpty': {
            'en': 'Profile name cannot be empty.',
            'zh-cn': '配置文件名称不能为空。'
        },
        'config.profileNameInvalid': {
            'en': 'Profile name can only contain letters, numbers, hyphens, and underscores.',
            'zh-cn': '配置文件名称只能包含字母、数字、连字符和下划线。'
        },
        'config.confirmBatchUpdate': {
            'en': 'This will update the active profile to "{1}" for all {0} Spring Boot applications. This action will modify your launch.json file.',
            'zh-cn': '此操作会将所有 {0} 个 Spring Boot 应用的活动配置文件更新为 "{1}"。此操作将修改您的 launch.json 文件。'
        },
        'config.appsToUpdate': {
            'en': 'The following applications will be updated:',
            'zh-cn': '以下应用将被更新：'
        },
        'config.confirmUpdate': {
            'en': 'Update',
            'zh-cn': '更新'
        },
        'config.updatingApp': {
            'en': 'Updating {0}... ({1}/{2})',
            'zh-cn': '正在更新 {0}... ({1}/{2})'
        },
        'config.updateProfileFailed': {
            'en': 'Failed to update profile for {0}',
            'zh-cn': '更新 {0} 的配置文件失败'
        },
        'config.allSpringBootProfilesSet': {
            'en': 'Successfully set the active profile to "{1}" for all {0} Spring Boot applications.',
            'zh-cn': '已成功为所有 {0} 个 Spring Boot 应用设置活动配置文件为 "{1}"。'
        },
        'config.batchSetComplete': {
            'en': 'Batch update complete. {0} succeeded, {1} failed.',
            'zh-cn': '批量更新完成。{0} 个成功，{1} 个失败。'
        },
        'config.failureDetails': {
            'en': 'Failures',
            'zh-cn': '失败详情'
        },
        'config.batchSetFailed': {
            'en': 'Batch update failed for all {0} applications.',
            'zh-cn': '所有 {0} 个应用的批量更新均失败。'
        },
        'config.errorDetails': {
            'en': 'Error Details',
            'zh-cn': '错误详情'
        },
        'config.selectSpringBootApp': {
            'en': 'Select a Spring Boot Application',
            'zh-cn': '选择一个 Spring Boot 应用'
        },
        'config.selectSpringBootAppPlaceholder': {
            'en': 'Select the application to set the active profile for',
            'zh-cn': '选择要为其设置活动配置文件的应用'
        },
        'config.onlySpringBootProfile': {
            'en': 'This command can only be used for Spring Boot applications.',
            'zh-cn': '该命令只能用于 Spring Boot 应用。'
        },
        'config.setSpringActiveProfile': {
            'en': 'Set Spring Active Profile',
            'zh-cn': '设置 Spring 活动配置文件'
        },
        'config.setActiveProfilePrompt': {
            'en': 'Set the active profile for {0}',
            'zh-cn': '为 {0} 设置活动配置文件'
        },
        'config.springProfileSet': {
            'en': 'Successfully set the active profile for "{0}" to "{1}".',
            'zh-cn': '已成功为 "{0}" 设置活动配置文件为 "{1}"。'
        },
        'config.launchJsonNotFound': {
            'en': 'The launch.json file was not found.',
            'zh-cn': '未找到 launch.json 文件。'
        },
        'config.launchJsonInvalidFormat': {
            'en': 'The launch.json file has an invalid format.',
            'zh-cn': 'launch.json 文件格式无效。'
        },
        'config.noConfigFound': {
            'en': 'No launch configuration found for main class: {0}',
            'zh-cn': '未找到主类为 {0} 的启动配置'
        },
        'config.noJavaConfigs': {
            'en': 'No runnable Java configurations were found in launch.json.',
            'zh-cn': '在 launch.json 中未找到可运行的 Java 配置。'
        },
        'config.currentJmxStatus': {
            'en': 'Current JMX status',
            'zh-cn': '当前 JMX 状态'
        },
        'config.notSet': {
            'en': 'not set',
            'zh-cn': '未设置'
        },
        'config.disableJmx': {
            'en': 'Disable JMX for all',
            'zh-cn': '全部禁用 JMX'
        },
        'config.disableJmxDescription': {
            'en': 'Adds -Dcom.sun.management.jmxremote=false to all configs',
            'zh-cn': '向所有配置添加 -Dcom.sun.management.jmxremote=false'
        },
        'config.enableJmx': {
            'en': 'Enable JMX for all',
            'zh-cn': '全部启用 JMX'
        },
        'config.enableJmxDescription': {
            'en': 'Adds -Dcom.sun.management.jmxremote=true to all configs',
            'zh-cn': '向所有配置添加 -Dcom.sun.management.jmxremote=true'
        },
        'config.setAllJavaConfigsJmxStatus': {
            'en': 'Set JMX Remote Status for All Java Configurations',
            'zh-cn': '为所有 Java 启动配置设置 JMX 远程管理状态'
        },
        'config.confirmJmxStatus': {
            'en': 'This will set "jmxremote" to "{1}" for all {0} Java configurations.',
            'zh-cn': '此操作将为所有 {0} 个 Java 配置设置 "jmxremote" 为 "{1}"。'
        },
        'config.jmxStatusModified': {
            'en': 'Successfully modified JMX status for {0} configurations to "{1}".',
            'zh-cn': '成功为 {0} 个配置修改 JMX 状态为 "{1}"。'
        },

        // 聚合配置
        'aggregated.saveFailed': {
            'en': 'Failed to save aggregated launch configurations: {0}',
            'zh-cn': '保存聚合启动配置失败: {0}'
        },
        'aggregated.nameExists': {
            'en': 'Aggregated launch configuration "{0}" already exists.',
            'zh-cn': '聚合启动配置 "{0}" 已存在'
        },
        
        // 命令
        'command.runJavaEntry': {
            'en': 'Run Java Entry',
            'zh-cn': '运行Java入口'
        },
        'command.runAggregatedConfig': {
            'en': 'Run Aggregated Config',
            'zh-cn': '运行聚合配置'
        },
        'command.addToAggregatedConfig': {
            'en': 'Add to Aggregated Config',
            'zh-cn': '添加到聚合配置'
        },

        // 插件
        'plugin.deactivated': {
            'en': 'Java Launcher has been deactivated.',
            'zh-cn': 'Java Launcher 插件已停用。'
        },

        'process.cannotGetConfig': {
            'en': 'Could not get process configuration information.',
            'zh-cn': '无法获取进程配置信息。'
        },
        'process.noValidConfigs': {
            'en': 'No valid process configurations found to restart.',
            'zh-cn': '未找到可重启的有效进程配置。'
        },
        'process.restartFailedSingle': {
            'en': 'Failed to restart process {0}: {1}',
            'zh-cn': '重启进程 {0} 失败: {1}'
        },

        // 时间
        'time.hoursMinutesSeconds': {
            'en': '{0}h {1}m {2}s',
            'zh-cn': '{0}时 {1}分 {2}秒'
        },

        // 调试
        'debug.info': {
            'en': 'Debug Info',
            'zh-cn': '调试信息'
        },
        'debug.workspace': {
            'en': 'Workspace',
            'zh-cn': '工作区'
        },
        'debug.availableLaunchConfigs': {
            'en': 'Available Launch Configs',
            'zh-cn': '可用的启动配置'
        },
        'debug.launchJsonContent': {
            'en': 'launch.json Content',
            'zh-cn': 'launch.json 内容'
        },
        'debug.aggregatedLaunchConfigs': {
            'en': 'Aggregated Launch Configs',
            'zh-cn': '聚合启动配置'
        },
        'debug.noLaunchJson': {
            'en': 'No launch.json found.',
            'zh-cn': '未找到 launch.json'
        },
        'debug.errorReadingLaunchJson': {
            'en': 'Error reading launch.json: {0}',
            'zh-cn': '读取 launch.json 出错: {0}'
        },

        // 聚合启动配置
        'aggregated.invalidConfig': {
            'en': 'Invalid aggregated launch configuration, please select again.',
            'zh-cn': '聚合启动配置无效，请重新选择'
        },

        // 状态栏
        'statusbar.tooltip': {
            'en': 'Java Launcher Commands',
            'zh-cn': 'Java Launcher 命令'
        },

        // 监听器
        'watcher.workspaceChanged': {
            'en': 'Workspace folders have changed.',
            'zh-cn': '工作区文件夹已更改。'
        },
        'watcher.javaFileCreated': {
            'en': 'Java file created.',
            'zh-cn': 'Java 文件已创建。'
        },
        'watcher.javaFileDeleted': {
            'en': 'Java file deleted.',
            'zh-cn': 'Java 文件已删除。'
        },
        'watcher.javaFileChanged': {
            'en': 'Java file changed.',
            'zh-cn': 'Java 文件已修改。'
        },
        'watcher.aggConfigFileCreated': {
            'en': 'Aggregated launch configuration file created.',
            'zh-cn': '聚合启动配置文件已创建。'
        },
        'watcher.aggConfigFileChanged': {
            'en': 'Aggregated launch configuration file changed.',
            'zh-cn': '聚合启动配置文件已修改。'
        },
        'watcher.aggConfigFileDeleted': {
            'en': 'Aggregated launch configuration file deleted.',
            'zh-cn': '聚合启动配置文件已删除。'
        },

        // 最近启动
        'recent.historyLoaded': {
            'en': 'Launch history loaded.',
            'zh-cn': '启动历史记录已加载。'
        },
        'recent.historySaved': {
            'en': 'Launch history saved.',
            'zh-cn': '启动历史记录已保存。'
        },
        'recent.launchJsonOrderUpdated': {
            'en': 'launch.json configuration order has been updated.',
            'zh-cn': '已更新launch.json配置顺序。'
        },
        'recent.updateLaunchJsonOrderFailed': {
            'en': 'Failed to update launch.json configuration order: {0}',
            'zh-cn': '更新launch.json配置顺序失败: {0}'
        },

        // 启动配置生成器
        'generator.generatingConfig': {
            'en': 'Generating launch configurations...',
            'zh-cn': '开始生成启动配置...'
        },
        'generator.noEntriesFound': {
            'en': 'No Java entry points found, skipping configuration generation.',
            'zh-cn': '没有找到 Java 入口点，跳过配置生成。'
        },
        'generator.createConfigFailed': {
            'en': 'Failed to create launch configuration for: {0}, Error: {1}',
            'zh-cn': '创建启动配置失败: {0}, 错误: {1}'
        },
        'generator.unsupportedType': {
            'en': 'Unsupported entry point type: {0}',
            'zh-cn': '不支持的入口点类型: {0}'
        },
        'generator.readExistingLaunchJsonFailed': {
            'en': 'Failed to read existing launch.json file: {0}',
            'zh-cn': '读取现有 launch.json 文件失败: {0}'
        },
        'generator.updateConfig': {
            'en': 'Updating existing configuration: {0}',
            'zh-cn': '更新现有配置: {0}'
        },
        'generator.addConfig': {
            'en': 'Adding new configuration: {0}',
            'zh-cn': '添加新配置: {0}'
        },
        'generator.writeLaunchJsonSuccess': {
            'en': 'Successfully wrote to launch.json: {0}',
            'zh-cn': '成功写入 launch.json 文件: {0}'
        },
        'generator.writeLaunchJsonFailed': {
            'en': 'Failed to write to launch.json: {0}',
            'zh-cn': '写入 launch.json 文件失败: {0}'
        },
        'generator.checkUpdateFailed': {
            'en': 'Failed to check configuration update status: {0}',
            'zh-cn': '检查配置更新状态失败: {0}'
        },
        'generator.success': {
            'en': 'Successfully generated {0} launch configurations.',
            'zh-cn': '成功生成 {0} 个启动配置。'
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