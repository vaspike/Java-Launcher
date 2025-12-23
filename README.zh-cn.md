# Java Launcher for VS Code


[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/River.java-launcher?style=flat-square&label=VS%20Code%20Downloads)](https://marketplace.visualstudio.com/items?itemName=River.java-launcher)
[![Open VSX Downloads](https://img.shields.io/open-vsx/dt/River/java-launcher?style=flat-square&label=Open%20VSX%20Downloads)](https://open-vsx.org/extension/River/java-launcher)

一款用于在 VS Code 中发现、运行、调试和管理 Java 应用的零配置工具。

灵感源自 IntelliJ IDEA 的运行配置体验，Java Launcher 能够自动检测项目中的入口点——包括 Spring Boot 应用、`main` 方法和测试类——让您无需手动编辑 `launch.json` 即可立即运行或调试。它还支持“聚合启动”，允许通过单次点击按序启动多个服务，非常适合微服务开发。

[English](./README.md) | [中文](./README.zh-cn.md)

---

## 预览

![image](https://github.com/user-attachments/assets/3e46dc02-545c-42ab-ae56-bcd08b305c64)
![image](https://github.com/user-attachments/assets/82486078-c953-4e53-8e5e-b41401d0a8cb)
![image](https://github.com/user-attachments/assets/f32593f3-6351-44a6-9f12-9485ebf2422a)
![image](https://github.com/user-attachments/assets/4d1a3e5d-3e78-4add-80dd-445cd141617f)

## 核心功能

- **零配置发现**：自动扫描工作区以查找可运行的 Java 入口点。
- **统一树状视图**：在专属侧边栏中展示所有发现的应用和测试，并按项目模块分组。
- **快速搜索与运行**：通过命令面板风格的界面快速查找并启动任何入口点或聚合配置。支持惰性加载和最近使用记录。
- **聚合启动**：将多个应用组合为一个配置，支持自定义启动延迟并按顺序启动——微服务开发的理想选择。
- **Spring Boot 支持**：提供对 Spring Boot 的原生支持，可轻松切换 Active Profile（如 `dev`、`prod`）。
- **进程管理**：提供专用界面用于查看、停止或重启由本插件启动的任何 Java 进程。
- **国际化**：完全支持英文和中文界面。

## 快速开始

1. 从 VS Code 市场安装 **Java Launcher**。
2. 打开一个 Java 项目（完整支持 Maven；Gradle 支持尚处于实验性阶段）。
3. 点击活动栏中的 **火箭图标** 打开 Java Launcher 视图。
4. 插件会自动扫描入口点。点击任意项旁边的 **运行 (▶)** 或 **调试 (🐞)** 图标即可启动。

## 使用指南

### 1. 运行应用
在侧边栏的 **Java Launcher** 视图中，您会看到已发现入口点的树状列表：
- **Spring Boot 应用**：带有叶子图标。
- **Main 类**：标准的 Java 应用程序。
- **测试**：JUnit/TestNG 类和方法。

将鼠标悬停在条目上，点击 **运行** 或 **调试** 按钮。

### 2. 搜索与运行 (Search and Run)
使用“搜索并运行”命令，无需离开键盘即可快速启动应用。
- **命令**：`Java Launcher: 搜索并运行 Java 入口`
- **行为**：
  - 显示搜索框，首次使用时会惰性加载入口点。
  - 显示最近使用的最多 5 个入口或配置，方便即时复用。
  - 支持按名称模糊匹配。

> **提示**：建议为该命令配置快捷键以提高效率（参见 [推荐快捷键](#推荐快捷键)）。

### 3. 聚合启动 (微服务)
一键启动多个应用。
1. 在树状视图中右键单击某个入口点，选择 **添加到聚合配置**。
2. 或使用命令 `Java Launcher: 创建聚合启动配置`。
3. 为配置命名并选择要包含的应用。
4. （可选）为每个应用配置 **启动延迟**（毫秒），以确保依赖服务优先启动。
5. 在树状视图的 **聚合启动配置** 部分运行该配置。

### 4. 进程管理
查看和控制由本插件启动的所有运行中 Java 进程。
- **命令**：`Java Launcher: 管理运行中的 Java 进程`
- **操作**：查看状态、停止单个进程、停止所有进程或重启所有进程。

## 推荐快捷键

为了优化工作流，建议将以下键绑定添加到您的 `keybindings.json` 中：

```json
{
  "key": "ctrl+alt+r",
  "command": "java-launcher.searchAndRun",
  "when": "editorTextFocus"
},
{
  "key": "ctrl+alt+p",
  "command": "java-launcher.manageRunningProcesses"
}
```

*（您可以根据偏好调整 `ctrl+alt+r` 和 `ctrl+alt+p`）*

## 注意事项与建议

- **首次运行**：在打开 VS Code 后首次使用“搜索并运行”时，插件扫描项目可能会有短暂延迟。后续搜索将即时响应。
- **Gradle 支持**：目前为实验性支持。它最适合标准项目结构（`src/main/java`）。对于复杂的 Gradle 配置，可能仍需手动调整。
- **Launch.json**：虽然本插件旨在实现零配置，但它底层仍会生成标准的 VS Code `launch.json` 配置。如果您需要高级 JVM 参数或环境变量，可以手动编辑该文件。
- **刷新**：如果您添加了新的类或方法，请点击 Java Launcher 视图标题栏中的 **刷新** 按钮以更新列表。

## 开源许可

本项目基于 [MIT License](./LICENSE) 开源。
