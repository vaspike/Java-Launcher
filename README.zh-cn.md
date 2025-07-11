# Java Launcher for VS Code

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/River.java-launcher?style=flat-square&label=Marketplace)](https://marketplace.visualstudio.com/items?itemName=River.java-launcher)

一款功能强大、操作直观的 VS Code 插件，用于发现、运行、管理和调试您的 Java 应用。其设计灵感来源于 **JetBrains IntelliJ IDEA** 中流畅的运行和调试体验。

告别手动编辑 `launch.json` 的繁琐工作。Java Launcher 会自动发现您项目中所有可运行的入口点——包括 `main` 方法、Spring Boot 应用和测试——并将它们展示在活动栏的一个专属视图中。您甚至可以一键启动整个微服务技术栈。

[English](./README.md) | [中文](./README.zh-cn.md)

---

## 截图预览

  ![902X356/Snipaste_2025-07-11_09-40-22.png](https://tc.z.wiki/autoupload/f/orCzaWOvKzgYH1bdiGU7RymIkHMchKbLor7dh3rvZ9Gyl5f0KlZfm6UsKj-HyTuv/20250711/8Pxw/902X356/Snipaste_2025-07-11_09-40-22.png)
  ![1252X554/Snipaste_2025-07-11_13-43-22.png](https://tc.z.wiki/autoupload/f/orCzaWOvKzgYH1bdiGU7RymIkHMchKbLor7dh3rvZ9Gyl5f0KlZfm6UsKj-HyTuv/20250711/2vPm/1252X554/Snipaste_2025-07-11_13-43-22.png)
  ![1256X330/Snipaste_2025-07-11_09-38-56.png](https://tc.z.wiki/autoupload/f/orCzaWOvKzgYH1bdiGU7RymIkHMchKbLor7dh3rvZ9Gyl5f0KlZfm6UsKj-HyTuv/20250711/Qcpq/1256X330/Snipaste_2025-07-11_09-38-56.png)
  ![2702X676/Snipaste_2025-07-11_09-33-49.png](https://tc.z.wiki/autoupload/f/orCzaWOvKzgYH1bdiGU7RymIkHMchKbLor7dh3rvZ9Gyl5f0KlZfm6UsKj-HyTuv/20250711/iHVJ/2702X676/Snipaste_2025-07-11_09-33-49.png)
  ![1520X956/Snipaste_2025-07-11_09-38-01.png](https://tc.z.wiki/autoupload/f/orCzaWOvKzgYH1bdiGU7RymIkHMchKbLor7dh3rvZ9Gyl5f0KlZfm6UsKj-HyTuv/20250711/HsJc/1520X956/Snipaste_2025-07-11_09-38-01.png)


### 查看更多预览图片, 请移步: [Java Launcher](https://rivermao.com/program/java-launcher/)

## 为什么选择 Java Launcher?

在典型的 VS Code 环境中，运行和调试 Java 应用，尤其是在一个多模块的微服务项目中，通常需要繁琐地手动配置 `launch.json` 文件。这个过程既耗时又容易出错。

**Java Launcher** 正是为了解决这一痛点而生。它的设计灵感源自 IntelliJ IDEA 流畅的工作流，旨在为 VS Code 带来“零配置”的开发体验，让您能更专注于代码本身，而非繁琐的配置工作。

## 核心功能

- **💡 零配置运行/调试**: 自动扫描并发现您工作区中所有可运行的入口点（`main` 方法、`@SpringBootApplication`、JUnit & TestNG 测试）。
- **🌳 清晰的树状视图**: 在专属的侧边栏视图中，将所有发现的应用和测试按项目模块分组，一目了然，方便管理。
- **🚀 一键化操作**: 直接在树状视图中运行、调试或停止任何一个应用。
- **⚙️ 聚合启动配置**: 将多个应用组合成一个“聚合启动配置”。您可以按预设顺序和自定义延迟，一键启动您的整个微服务技术栈。
- **⚡ 快速搜索与运行**: 提供一个强大的命令面板（类似 `Ctrl+P`），让您能快速查找并运行任何入口点或聚合配置。
- **🍃 强大的 Spring Boot 支持**:
  - 自动识别 Spring Boot 应用。
  - 为单个或所有 Spring Boot 应用轻松设置和切换 Active Profile。
- **🏃‍♂️ 进程管理**: 在专属的管理界面中，查看、停止或重启由本插件启动的任何 Java 进程。
- **🌐 国际化**: 已完全支持**中文**和**英文**。

## 快速上手

1.  在 VS Code 插件市场中安装 **Java Launcher**。
2.  打开一个 Java 项目（完整支持 Maven，Gradle 为试验性支持）。
3.  点击活动栏中新增的 Java Launcher 图标。
4.  插件将自动扫描您的项目，并显示所有可运行的入口点。
5.  点击任意入口点旁边的“运行”或“调试”图标，即可启动！

## 使用说明

### 运行单个应用
在 Java Launcher 视图中找到您的应用，然后点击旁边的 ▶️ (运行) 或 🐞 (调试) 图标。

### 使用聚合启动
“聚合启动”功能非常适合用于一键启动整个微服务环境。

1.  **创建聚合配置**:
    - 在树状视图中右键点击一个入口点，选择“添加到聚合配置”。
    - 或者，运行 `Java Launcher: 创建聚合启动配置` 命令。
2.  **管理您的配置**:
    - 添加多个应用到配置中。
    - 为每个应用设置自定义的启动延迟（单位：毫秒），以确保依赖的服务（如配置中心）优先启动。
    - 在配置中随时启用或禁用某些应用。
3.  **一键启动**:
    - 在视图中找到您创建的聚合配置，点击旁边的 ▶️ (运行) 图标即可。

### 快速搜索
1.  打开命令面板 (⇧⌘P 或 Ctrl+Shift+P)。
2.  运行命令 `Java Launcher: 搜索并运行Java入口点`。
3.  输入关键字以筛选应用和配置，然后按 `Enter` 键运行。

## 主要命令

打开命令面板 (⇧⌘P 或 Ctrl+Shift+P)，输入 `Java Launcher:` 即可查看所有可用命令：

- `Java Launcher: 生成启动配置`
- `Java Launcher: 管理运行中的Java进程`
- `Java Launcher: 扫描Java入口点`
- `Java Launcher: 创建聚合启动配置`
- `Java Launcher: 管理聚合启动配置`
- `Java Launcher: 执行聚合启动配置`
- `Java Launcher: 设置Spring Profile`
- `Java Launcher: 批量设置Spring Profile`
- `Java Launcher: 刷新视图`

## 已知问题

- **Gradle 项目支持**: 目前插件对 Gradle 项目的支持处于**试验阶段**。它仅能识别遵循标准目录结构（如 `src/main/java`）的简单项目，且尚未实现依赖解析。我们正积极开发中，并计划在未来的版本中提供完整的官方支持。在此之前，我们推荐在 Maven 项目中使用以获得最佳体验。

## 贡献代码

欢迎各种形式的贡献，包括提交问题、功能需求和代码 PR！请访问我们的 [问题追踪页面](https://github.com/vaspike/Java-Launcher/issues)。

## 开源许可

本项目基于 [MIT License](./LICENSE) 开源。 
