# Java Launcher

Java Launcher 是一个为 Java 开发者设计的 VSCode 插件，能够自动识别 Java 项目中的各种启动入口，并自动生成相应的 launch.json 配置文件。

## 功能特性

- 🚀 **自动识别 Java 入口点**：智能扫描项目中的 Spring Boot 应用、普通 Java 应用、JUnit 测试等
- 📝 **自动生成配置**：无需手动编写 launch.json 文件，一键生成所有启动配置
- 🔧 **多框架支持**：支持 Spring Boot、JUnit 4/5、TestNG 等主流框架
- 🎯 **精确到方法级别**：支持单个测试方法的启动配置
- 🏗️ **多项目类型支持**：支持 Maven、Gradle 和普通 Java 项目
- 🔄 **聚合启动配置**：创建自定义的启动配置集合，一键按顺序启动多个Java应用（微服务场景的福音！）
- 🎨 **可视化界面**：在VSCode侧边栏提供专用的Java Launcher面板，直观管理所有Java入口点和聚合配置

## 支持的入口点类型

### Spring Boot 应用
- 自动识别 `@SpringBootApplication` 注解的类
- 生成带有 Spring profile 配置的启动配置

### 普通 Java 应用
- 识别包含 `public static void main(String[] args)` 的类
- 生成标准的 Java 应用启动配置

### 测试入口点
- **JUnit 4/5 测试类**：整个测试类的运行配置
- **JUnit 4/5 测试方法**：单个测试方法的运行配置
- **TestNG 测试类**：TestNG 测试类的运行配置
- **TestNG 测试方法**：TestNG 测试方法的运行配置

## 使用方法

### 1. 安装插件
从 VSCode 插件市场搜索并安装 "Java Launcher"

### 2. 生成启动配置
在 VSCode 中打开 Java 项目，然后使用以下任一方式：

#### 方式 1：命令面板
1. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS)
2. 输入 "Java: Generate Launch Configurations"
3. 回车执行

#### 方式 2：右键菜单
1. 在资源管理器中右键点击任意 Java 文件
2. 选择 "Generate Launch Configurations"

### 3. 扫描入口点
如果只想查看项目中的入口点而不生成配置，可以使用：

1. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS)
2. 输入 "Java: Scan Java Entry Points"
3. 回车执行

### 4. 使用Java Launcher侧边栏界面

Java Launcher在VSCode的Explorer面板中提供了专用的侧边栏界面，让您可以直观地管理所有Java入口点和聚合启动配置。

#### 界面布局
- **Java 入口点**：显示项目中所有发现的Java启动类和测试方法
  - 🍃 Spring Boot应用
  - ☕ Java应用
  - 🧪 测试类  
  - 🔬 测试方法
- **聚合启动配置**：显示所有创建的聚合启动配置及其包含的启动项

#### 快速操作
- **单击运行**：直接点击任意Java入口点或聚合配置即可运行
- **右键菜单**：右键点击获取更多操作选项
- **添加到聚合**：点击 ➕ 图标将Java入口点添加到聚合配置
- **刷新视图**：点击 🔄 图标刷新整个视图

#### 实时更新
界面会自动监听以下变化并实时更新：
- Java文件的创建、修改、删除
- 聚合启动配置文件的变化
- 工作区的变化

### 5. 聚合启动配置
聚合启动功能允许您创建自定义的启动配置集合，特别适用于微服务开发：

#### 通过命令面板创建
1. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS)
2. 输入 "Create Aggregated Launch Configuration"
3. 输入配置名称（如：`Aggregated-run`）
4. 选择要包含的启动配置

#### 通过侧边栏创建
1. 在Java Launcher侧边栏中，点击Java入口点旁的 ➕ 图标
2. 选择现有聚合配置或创建新配置
3. 配置将自动添加到指定的聚合启动中

#### 管理聚合配置
1. 输入 "Manage Aggregated Launch Configurations"
2. 选择要管理的配置
3. 可以编辑、执行、删除或查看详情

#### 执行聚合启动
**方式一：通过侧边栏**
- 直接点击聚合配置即可执行

**方式二：通过命令面板**
1. 输入 "Execute Aggregated Launch Configuration"
2. 选择要执行的聚合配置
3. 系统会按顺序启动所有启用的配置项

**聚合启动特性：**
- ⏰ **延迟控制**：为每个启动项设置启动延迟时间
- 🎛️ **灵活管理**：启用/禁用特定的启动项
- 📊 **进度监控**：实时显示启动进度和状态
- ❌ **错误处理**：启动失败时可选择继续或停止

> 📖 **详细文档**：
> - [聚合启动功能详细文档](./AGGREGATED_LAUNCH.md) - 了解聚合启动的用法和最佳实践
> - [UI界面功能说明](./UI_INTERFACE.md) - 了解侧边栏界面的详细功能和使用方法

## 支持的项目类型

### Maven 项目
- 自动识别 `pom.xml` 文件
- 按照 Maven 标准目录结构扫描源代码和测试代码

### Gradle 项目
- 自动识别 `build.gradle` 或 `build.gradle.kts` 文件
- 按照 Gradle 标准目录结构扫描源代码和测试代码

### 普通 Java 项目
- 递归扫描项目目录中的所有 Java 文件
- 智能识别测试文件

## 生成的配置示例

### Spring Boot 应用配置
```json
{
    "type": "java",
    "name": "启动 Spring Boot 应用 - Application",
    "request": "launch",
    "mainClass": "com.example.Application",
    "projectName": "my-spring-boot-app",
    "args": "",
    "vmArgs": "-Dspring.profiles.active=dev",
    "envFile": "${workspaceFolder}/.env",
    "cwd": "${workspaceFolder}",
    "console": "integratedTerminal"
}
```

### 测试类配置
```json
{
    "type": "java",
    "name": "运行 测试类 - UserServiceTest",
    "request": "launch",
    "mainClass": "com.example.service.UserServiceTest",
    "projectName": "my-project",
    "args": "",
    "vmArgs": "-ea",
    "cwd": "${workspaceFolder}",
    "console": "integratedTerminal"
}
```

### 测试方法配置
```json
{
    "type": "java",
    "name": "运行 测试方法 - testCreateUser",
    "request": "launch",
    "mainClass": "com.example.service.UserServiceTest",
    "projectName": "my-project",
    "args": "--tests com.example.service.UserServiceTest.testCreateUser",
    "vmArgs": "-ea",
    "cwd": "${workspaceFolder}",
    "console": "integratedTerminal"
}
```

## 系统要求

- Visual Studio Code 1.74.0 或更高版本
- Java 8 或更高版本
- Java Extension Pack (推荐安装)

## 注意事项

1. 插件会自动创建 `.vscode/launch.json` 文件，如果文件已存在，会合并配置而不是覆盖
2. 如果项目中有多个同名的启动配置，插件会更新现有配置
3. 插件会自动监听 Java 文件的变化，但不会自动重新生成配置
4. 对于大型项目，扫描可能需要几秒钟时间

## 问题反馈

如果在使用过程中遇到问题，请：

1. 检查 VSCode 的输出面板中的错误信息
2. 确保项目结构符合 Maven/Gradle 的标准目录结构
3. 确认 Java 文件的语法正确且可以正常编译

## 开发计划

- [x] ✅ **聚合启动配置**：支持创建自定义启动配置集合，批量启动多个Java应用
- [x] ✅ **可视化界面**：在VSCode侧边栏提供专用的Java Launcher面板，支持可视化管理
- [x] ✅ **JMX默认禁用**：生成的启动配置默认禁用JMX，提升启动性能
- [ ] 支持多模块项目
- [ ] 支持更多测试框架
- [ ] 支持自定义配置模板
- [ ] 支持远程调试配置
- [ ] 支持配置文件热重载
- [ ] 聚合启动配置导入/导出功能

## 许可证

MIT License

---

**享受编程，提升效率！** 🚀
