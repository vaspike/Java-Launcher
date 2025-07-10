/**
 * 聚合启动配置项
 */
export interface AggregatedLaunchItem {
    /**
     * 启动配置名称
     */
    name: string;
    
    /**
     * 启动延迟时间（毫秒）
     */
    delay?: number;
    
    /**
     * 是否启用
     */
    enabled: boolean;
}

/**
 * 聚合启动配置
 */
export class AggregatedLaunchConfig {
    /**
     * 聚合启动名称
     */
    public readonly name: string;
    
    /**
     * 描述
     */
    public readonly description: string;
    
    /**
     * 包含的启动配置列表
     */
    public readonly items: AggregatedLaunchItem[];
    
    /**
     * 创建时间
     */
    public readonly createdAt: Date;
    
    /**
     * 最后修改时间
     */
    public readonly updatedAt: Date;

    constructor(
        name: string,
        description: string = '',
        items: AggregatedLaunchItem[] = [],
        createdAt?: Date,
        updatedAt?: Date
    ) {
        this.name = name;
        this.description = description;
        this.items = items;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }

    /**
     * 获取启用的启动项
     */
    public getEnabledItems(): AggregatedLaunchItem[] {
        return this.items.filter(item => item.enabled);
    }

    /**
     * 获取启动项数量
     */
    public getItemCount(): number {
        return this.items.length;
    }

    /**
     * 获取启用的启动项数量
     */
    public getEnabledItemCount(): number {
        return this.getEnabledItems().length;
    }

    /**
     * 检查是否包含指定的启动配置
     */
    public containsLaunchConfig(configName: string): boolean {
        return this.items.some(item => item.name === configName);
    }

    /**
     * 添加启动项
     */
    public addItem(item: AggregatedLaunchItem): AggregatedLaunchConfig {
        const newItems = [...this.items, item];
        return new AggregatedLaunchConfig(
            this.name,
            this.description,
            newItems,
            this.createdAt,
            new Date()
        );
    }

    /**
     * 移除启动项
     */
    public removeItem(configName: string): AggregatedLaunchConfig {
        const newItems = this.items.filter(item => item.name !== configName);
        return new AggregatedLaunchConfig(
            this.name,
            this.description,
            newItems,
            this.createdAt,
            new Date()
        );
    }

    /**
     * 更新启动项
     */
    public updateItem(configName: string, updates: Partial<AggregatedLaunchItem>): AggregatedLaunchConfig {
        const newItems = this.items.map(item => 
            item.name === configName 
                ? { ...item, ...updates }
                : item
        );
        return new AggregatedLaunchConfig(
            this.name,
            this.description,
            newItems,
            this.createdAt,
            new Date()
        );
    }

    /**
     * 转换为JSON对象
     */
    public toJSON(): any {
        return {
            name: this.name,
            description: this.description,
            items: this.items,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }

    /**
     * 从JSON对象创建实例
     */
    public static fromJSON(json: any): AggregatedLaunchConfig {
        return new AggregatedLaunchConfig(
            json.name,
            json.description || '',
            json.items || [],
            json.createdAt ? new Date(json.createdAt) : undefined,
            json.updatedAt ? new Date(json.updatedAt) : undefined
        );
    }
} 