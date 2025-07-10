import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectScanner } from '../services/ProjectScanner';
import { AggregatedLaunchManager } from '../services/AggregatedLaunchManager';
import { JavaEntry, JavaEntryType } from '../models/JavaEntry';
import { AggregatedLaunchConfig } from '../models/AggregatedLaunchConfig';
import { RecentLaunchManager, LaunchHistoryItem } from '../services/RecentLaunchManager';

/**
 * Tree Item 类型枚举
 */
export enum TreeItemType {
    ROOT_JAVA_ENTRIES = 'javaEntries',
    ROOT_AGGREGATED_CONFIGS = 'aggregatedConfigs',
    SPRING_BOOT_APP = 'springBootApp',
    JAVA_APP = 'javaApp',
    TEST_CLASS = 'testClass',
    TEST_METHOD = 'testMethod',
    AGGREGATED_CONFIG = 'aggregatedConfig',
    AGGREGATED_ITEM = 'aggregatedItem',
    EMPTY_STATE = 'emptyState'
}

/**
 * Tree Item 数据类
 */
export class JavaLauncherTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly itemType: TreeItemType,
        public readonly data?: any
    ) {
        super(label, collapsibleState);
        this.contextValue = itemType;
        this.setIconAndTooltip();
    }

    private setIconAndTooltip(): void {
        switch (this.itemType) {
            case TreeItemType.ROOT_JAVA_ENTRIES:
                this.iconPath = new vscode.ThemeIcon('symbol-class');
                this.tooltip = 'Java 入口点';
                break;
            case TreeItemType.ROOT_AGGREGATED_CONFIGS:
                this.iconPath = new vscode.ThemeIcon('layers');
                this.tooltip = '聚合启动配置';
                break;
            case TreeItemType.SPRING_BOOT_APP:
                this.iconPath = new vscode.ThemeIcon('symbol-method');
                this.tooltip = `Spring Boot 应用: ${this.label}`;
                // 移除command，点击名称不触发操作
                break;
            case TreeItemType.JAVA_APP:
                this.iconPath = new vscode.ThemeIcon('symbol-function');
                this.tooltip = `Java 应用: ${this.label}`;
                // 移除command，点击名称不触发操作
                break;
            case TreeItemType.TEST_CLASS:
                this.iconPath = new vscode.ThemeIcon('beaker');
                this.tooltip = `测试类: ${this.label}`;
                // 移除command，点击名称不触发操作
                break;
            case TreeItemType.TEST_METHOD:
                this.iconPath = new vscode.ThemeIcon('symbol-misc');
                this.tooltip = `测试方法: ${this.label}`;
                // 移除command，点击名称不触发操作
                break;
            case TreeItemType.AGGREGATED_CONFIG:
                this.iconPath = new vscode.ThemeIcon('package');
                this.tooltip = `聚合启动配置: ${this.label}`;
                // 移除command，点击名称不触发操作
                break;
            case TreeItemType.AGGREGATED_ITEM:
                const isEnabled = this.data?.enabled;
                this.iconPath = new vscode.ThemeIcon(isEnabled ? 'check' : 'x');
                this.tooltip = `启动项: ${this.label} (${isEnabled ? '启用' : '禁用'})`;
                break;
            case TreeItemType.EMPTY_STATE:
                this.iconPath = new vscode.ThemeIcon('info');
                this.tooltip = this.label;
                break;
        }
    }
}

/**
 * Java Launcher Tree Data Provider
 */
export class JavaLauncherTreeDataProvider implements vscode.TreeDataProvider<JavaLauncherTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<JavaLauncherTreeItem | undefined | null | void> = new vscode.EventEmitter<JavaLauncherTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<JavaLauncherTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private javaEntries: JavaEntry[] = [];
    private aggregatedConfigs: AggregatedLaunchConfig[] = [];
    private launchHistory: LaunchHistoryItem[] = [];
    private searchQuery: string = '';

    constructor(
        private projectScanner: ProjectScanner,
        private aggregatedLaunchManager: AggregatedLaunchManager,
        private recentLaunchManager: RecentLaunchManager = new RecentLaunchManager()
    ) {
        this.loadLaunchHistory();
    }
    
    /**
     * 加载启动历史记录
     */
    private async loadLaunchHistory(): Promise<void> {
        try {
            this.launchHistory = await this.recentLaunchManager.loadHistory();
        } catch (error) {
            console.error('加载启动历史记录失败:', error);
            this.launchHistory = [];
        }
    }

    /**
     * 刷新树视图
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * 设置搜索查询
     */
    public setSearchQuery(query: string): void {
        this.searchQuery = query.trim().toLowerCase();
        this.refresh();
    }

    /**
     * 获取当前搜索查询
     */
    public getSearchQuery(): string {
        return this.searchQuery;
    }

    /**
     * 清除搜索查询
     */
    public clearSearch(): void {
        this.searchQuery = '';
        this.refresh();
    }
    
    /**
     * 判断文本是否匹配搜索查询
     */
    private matchesSearchQuery(text: string): boolean {
        if (!text || !this.searchQuery) {
            return false;
        }
        return text.toLowerCase().includes(this.searchQuery);
    }

    /**
     * 获取树项
     */
    getTreeItem(element: JavaLauncherTreeItem): vscode.TreeItem {
        return element;
    }

    /**
     * 获取子项
     */
    async getChildren(element?: JavaLauncherTreeItem): Promise<JavaLauncherTreeItem[]> {
        if (!element) {
            // 根节点
            return this.getRootItems();
        }

        switch (element.itemType) {
            case TreeItemType.ROOT_JAVA_ENTRIES:
                return this.getJavaEntryItems();
            case TreeItemType.ROOT_AGGREGATED_CONFIGS:
                return this.getAggregatedConfigItems();
            case TreeItemType.AGGREGATED_CONFIG:
                return this.getAggregatedConfigChildren(element.data);
            default:
                return [];
        }
    }

    /**
     * 获取根项目
     */
    private getRootItems(): JavaLauncherTreeItem[] {
        return [
            new JavaLauncherTreeItem(
                'Java 入口点',
                vscode.TreeItemCollapsibleState.Expanded,
                TreeItemType.ROOT_JAVA_ENTRIES
            ),
            new JavaLauncherTreeItem(
                '聚合启动配置',
                vscode.TreeItemCollapsibleState.Expanded,
                TreeItemType.ROOT_AGGREGATED_CONFIGS
            )
        ];
    }

    /**
     * 获取Java入口点项目
     */
    private async getJavaEntryItems(): Promise<JavaLauncherTreeItem[]> {
        try {
            await this.loadJavaEntries();
            await this.loadLaunchHistory();
            
            const items: JavaLauncherTreeItem[] = [];
            
            // 如果有搜索查询，过滤所有Java入口点
            if (this.searchQuery) {
                const filteredEntries = this.javaEntries.filter(entry => 
                    this.matchesSearchQuery(entry.displayName) || 
                    this.matchesSearchQuery(entry.className) ||
                    this.matchesSearchQuery(entry.projectName) ||
                    (entry.methodName && this.matchesSearchQuery(entry.methodName))
                );
                
                // 按类型分组
                const springBootApps = filteredEntries.filter(entry => entry.type === JavaEntryType.SPRING_BOOT_APPLICATION);
                const javaApps = filteredEntries.filter(entry => entry.type === JavaEntryType.MAIN_CLASS);
                const testClasses = filteredEntries.filter(entry => 
                    entry.type === JavaEntryType.JUNIT_TEST_CLASS || entry.type === JavaEntryType.TESTNG_TEST_CLASS
                );
                const testMethods = filteredEntries.filter(entry => 
                    entry.type === JavaEntryType.JUNIT_TEST_METHOD || entry.type === JavaEntryType.TESTNG_TEST_METHOD
                );
                
                // 添加Spring Boot应用
                this.addEntriesWithSorting(items, springBootApps, TreeItemType.SPRING_BOOT_APP);
                
                // 添加Java应用
                this.addEntriesWithSorting(items, javaApps, TreeItemType.JAVA_APP);
                
                // 添加测试类
                this.addEntriesWithSorting(items, testClasses, TreeItemType.TEST_CLASS);
                
                // 添加测试方法
                this.addEntriesWithSorting(items, testMethods, TreeItemType.TEST_METHOD);
                
                if (items.length === 0) {
                    items.push(new JavaLauncherTreeItem(
                        `未找到匹配 "${this.searchQuery}" 的Java入口点`,
                        vscode.TreeItemCollapsibleState.None,
                        TreeItemType.EMPTY_STATE
                    ));
                }
            } else {
                // 没有搜索查询，显示所有入口点
                const springBootApps = this.javaEntries.filter(entry => entry.type === JavaEntryType.SPRING_BOOT_APPLICATION);
                const javaApps = this.javaEntries.filter(entry => entry.type === JavaEntryType.MAIN_CLASS);
                const testClasses = this.javaEntries.filter(entry => 
                    entry.type === JavaEntryType.JUNIT_TEST_CLASS || entry.type === JavaEntryType.TESTNG_TEST_CLASS
                );
                const testMethods = this.javaEntries.filter(entry => 
                    entry.type === JavaEntryType.JUNIT_TEST_METHOD || entry.type === JavaEntryType.TESTNG_TEST_METHOD
                );

                // 添加Spring Boot应用
                this.addEntriesWithSorting(items, springBootApps, TreeItemType.SPRING_BOOT_APP);
                
                // 添加Java应用
                this.addEntriesWithSorting(items, javaApps, TreeItemType.JAVA_APP);
                
                // 添加测试类
                this.addEntriesWithSorting(items, testClasses, TreeItemType.TEST_CLASS);
                
                // 添加测试方法
                this.addEntriesWithSorting(items, testMethods, TreeItemType.TEST_METHOD);
            }

            return items;
        } catch (error) {
            console.error('获取Java入口点失败:', error);
            return [new JavaLauncherTreeItem(
                '加载失败，请重试',
                vscode.TreeItemCollapsibleState.None,
                TreeItemType.EMPTY_STATE
            )];
        }
    }

    /**
     * 获取聚合启动配置项目
     */
    private async getAggregatedConfigItems(): Promise<JavaLauncherTreeItem[]> {
        try {
            await this.loadAggregatedConfigs();
            
            const items: JavaLauncherTreeItem[] = [];
            
            // 如果有搜索查询，过滤聚合配置
            const configsToShow = this.searchQuery 
                ? this.aggregatedConfigs.filter(config => this.matchesSearchQuery(config.name))
                : this.aggregatedConfigs;
            
            configsToShow.forEach(config => {
                items.push(new JavaLauncherTreeItem(
                    `${config.name} (${config.getEnabledItemCount()}/${config.getItemCount()})`,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    TreeItemType.AGGREGATED_CONFIG,
                    config
                ));
            });

            if (items.length === 0) {
                const message = this.searchQuery 
                    ? `未找到匹配 "${this.searchQuery}" 的聚合启动配置`
                    : '暂无聚合启动配置';
                
                items.push(new JavaLauncherTreeItem(
                    message,
                    vscode.TreeItemCollapsibleState.None,
                    TreeItemType.EMPTY_STATE
                ));
            }

            return items;
        } catch (error) {
            console.error('获取聚合启动配置失败:', error);
            return [new JavaLauncherTreeItem(
                '加载失败，请重试',
                vscode.TreeItemCollapsibleState.None,
                TreeItemType.EMPTY_STATE
            )];
        }
    }

    /**
     * 获取聚合配置的子项
     */
    private getAggregatedConfigChildren(config: AggregatedLaunchConfig): JavaLauncherTreeItem[] {
        if (!config.items || config.items.length === 0) {
            return [new JavaLauncherTreeItem(
                '暂无启动项',
                vscode.TreeItemCollapsibleState.None,
                TreeItemType.EMPTY_STATE
            )];
        }

        // 如果有搜索查询，过滤启动项
        const itemsToShow = this.searchQuery
            ? config.items.filter(item => this.matchesSearchQuery(item.name))
            : config.items;

        if (itemsToShow.length === 0) {
            return [new JavaLauncherTreeItem(
                `未找到匹配 "${this.searchQuery}" 的启动项`,
                vscode.TreeItemCollapsibleState.None,
                TreeItemType.EMPTY_STATE
            )];
        }

        return itemsToShow.map(item => {
            const label = item.delay && item.delay > 0 
                ? `${item.name} (延迟: ${item.delay}ms)`
                : item.name;
                
            return new JavaLauncherTreeItem(
                label,
                vscode.TreeItemCollapsibleState.None,
                TreeItemType.AGGREGATED_ITEM,
                item
            );
        });
    }

    /**
     * 加载Java入口点
     */
    private async loadJavaEntries(): Promise<void> {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                this.javaEntries = [];
                return;
            }

            const projectInfo = await this.projectScanner.scanProject(workspaceFolder.uri.fsPath);
            this.javaEntries = projectInfo.getAllJavaEntries();
        } catch (error) {
            console.error('扫描Java入口点失败:', error);
            this.javaEntries = [];
        }
    }

    /**
     * 加载聚合启动配置
     */
    private async loadAggregatedConfigs(): Promise<void> {
        try {
            this.aggregatedConfigs = await this.aggregatedLaunchManager.loadConfigs();
        } catch (error) {
            console.error('加载聚合启动配置失败:', error);
            this.aggregatedConfigs = [];
        }
    }

    /**
     * 获取Java入口点列表
     */
    public getJavaEntries(): JavaEntry[] {
        return this.javaEntries;
    }

    /**
     * 获取聚合启动配置列表
     */
    public getAggregatedConfigs(): AggregatedLaunchConfig[] {
        return this.aggregatedConfigs;
    }

    /**
     * 强制重新加载数据
     */
    public async reloadData(): Promise<void> {
        await this.loadJavaEntries();
        await this.loadAggregatedConfigs();
        await this.loadLaunchHistory();
        this.refresh();
    }
    
    /**
     * 记录Java入口点的启动
     */
    public async recordLaunch(javaEntry: JavaEntry): Promise<void> {
        await this.recentLaunchManager.recordLaunch(javaEntry);
        await this.recentLaunchManager.updateLaunchJsonOrder();
        await this.loadLaunchHistory();
        this.refresh();
    }
    
    /**
     * 获取Java入口点的启动时间戳
     */
    public getLaunchTimestamp(className: string, methodName?: string): number {
        const launchInfo = this.launchHistory.find(
            item => item.className === className && item.methodName === methodName
        );
        return launchInfo?.lastLaunchTime || 0;
    }

    /**
     * 按最近启动时间排序添加入口点
     */
    private addEntriesWithSorting(
        items: JavaLauncherTreeItem[], 
        entries: JavaEntry[], 
        itemType: TreeItemType
    ): void {
        // 为每个入口点添加启动时间戳
        const entriesWithTimestamp = entries.map(entry => ({
            entry,
            timestamp: this.getLaunchTimestamp(entry.className, entry.methodName)
        }));

        // 按启动时间戳排序（降序）
        entriesWithTimestamp.sort((a, b) => b.timestamp - a.timestamp);

        // 添加到列表
        entriesWithTimestamp.forEach(({ entry, timestamp }) => {
            let label = entry.displayName; 
            items.push(new JavaLauncherTreeItem(
                label,
                vscode.TreeItemCollapsibleState.None,
                itemType,
                entry
            ));
        });
    }
} 