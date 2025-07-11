# Java Launcher for VS Code

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/River.java-launcher?style=flat-square&label=Marketplace)](https://marketplace.visualstudio.com/items?itemName=River.java-launcher)

A powerful yet intuitive extension to discover, run, manage, and debug your Java applications, inspired by the seamless run/debug experience in **JetBrains IntelliJ IDEA**.

Say goodbye to manually editing `launch.json` files. Java Launcher automatically detects all your runnable entry points—`main` methods, Spring Boot applications, and tests—and displays them in a dedicated tree view in the activity bar. Run an entire microservices stack with a single click.

[English](./README.md) | [中文](./README.zh-cn.md)

---

## Glanace

  ![902X356/Snipaste_2025-07-11_09-40-22.png](https://tc.z.wiki/autoupload/f/orCzaWOvKzgYH1bdiGU7RymIkHMchKbLor7dh3rvZ9Gyl5f0KlZfm6UsKj-HyTuv/20250711/8Pxw/902X356/Snipaste_2025-07-11_09-40-22.png)
  ![1252X554/Snipaste_2025-07-11_13-43-22.png](https://tc.z.wiki/autoupload/f/orCzaWOvKzgYH1bdiGU7RymIkHMchKbLor7dh3rvZ9Gyl5f0KlZfm6UsKj-HyTuv/20250711/2vPm/1252X554/Snipaste_2025-07-11_13-43-22.png)
  ![1256X330/Snipaste_2025-07-11_09-38-56.png](https://tc.z.wiki/autoupload/f/orCzaWOvKzgYH1bdiGU7RymIkHMchKbLor7dh3rvZ9Gyl5f0KlZfm6UsKj-HyTuv/20250711/Qcpq/1256X330/Snipaste_2025-07-11_09-38-56.png)
  ![2702X676/Snipaste_2025-07-11_09-33-49.png](https://tc.z.wiki/autoupload/f/orCzaWOvKzgYH1bdiGU7RymIkHMchKbLor7dh3rvZ9Gyl5f0KlZfm6UsKj-HyTuv/20250711/iHVJ/2702X676/Snipaste_2025-07-11_09-33-49.png)
  ![1520X956/Snipaste_2025-07-11_09-38-01.png](https://tc.z.wiki/autoupload/f/orCzaWOvKzgYH1bdiGU7RymIkHMchKbLor7dh3rvZ9Gyl5f0KlZfm6UsKj-HyTuv/20250711/HsJc/1520X956/Snipaste_2025-07-11_09-38-01.png)


### For more displays, please check [Java Launcher](https://rivermao.com/program/java-launcher/)

## Why Java Launcher?

In a typical VS Code setup, running and debugging Java applications, especially in a multi-module microservices project, often requires cumbersome manual configuration of `launch.json`. This process can be slow and error-prone.

**Java Launcher** is built to solve this problem. Inspired by the fluid workflow of IntelliJ IDEA, it brings a "zero-configuration" experience to VS Code, allowing you to focus on coding, not configuration.

## Key Features

- **💡 Zero-Configuration Run/Debug**: Automatically discovers all runnable entry points (`main` methods, `@SpringBootApplication`, JUnit & TestNG tests) across your workspace.
- **🌳 Explorer Tree View**: Displays all discovered applications and test classes in a dedicated, easy-to-navigate tree view, grouped by project module.
- **🚀 One-Click Actions**: Run, debug, or stop any application directly from the tree view.
- **⚙️ Aggregated Launch Configurations**: Group multiple applications into a single configuration. Start your entire microservices stack sequentially with custom delays—all with one click.
- **⚡ Quick Search & Run**: Use a powerful command palette (like `Ctrl+P`) to instantly find and run any entry point or aggregated configuration.
- **🍃 Enhanced Spring Boot Support**:
  - Automatically identifies Spring Boot applications.
  - Easily set and switch Spring active profiles for a single app or all apps at once.
- **🏃‍♂️ Process Management**: View, stop, or restart any Java process launched by the extension in a dedicated management interface.
- **🌐 Internationalization**: Supports both **English** and **Chinese**.

## Getting Started

1.  Install the **Java Launcher** extension from the VS Code Marketplace.
2.  Open a Java project (Maven is fully supported, Gradle is experimental).
3.  Click the new Java Launcher icon in the Activity Bar.
4.  The extension will automatically scan your project and display all discovered entry points.
5.  Click the "Run" or "Debug" icon next to any entry point to launch it!

## Usage

### Running an Application
Simply find your application in the Java Launcher view and click the ▶️ (Run) or 🐞 (Debug) icon next to it.

### Aggregated Launch
The aggregated launch feature is perfect for starting a complete microservices environment.

1.  **Create an Aggregated Configuration**:
    - Right-click on an entry point in the tree view and select "Add to Aggregated Config".
    - Or, run the `Java Launcher: Create Aggregated Launch Configuration` command.
2.  **Manage Your Configuration**:
    - Add multiple applications.
    - Set custom startup delays (in milliseconds) for each application to manage dependencies (e.g., wait for a config server to start).
    - Enable or disable applications within the configuration.
3.  **Run It**:
    - Find your aggregated configuration in the tree view and click the ▶️ (Run) icon.

### Quick Search
1.  Open the command palette (⇧⌘P or Ctrl+Shift+P).
2.  Run the command `Java Launcher: Search and Run Java Entry Point`.
3.  Start typing to filter applications and configurations, then press `Enter` to run.

## Available Commands

Open the command palette (⇧⌘P or Ctrl+Shift+P) and type `Java Launcher:` to see all available commands:

- `Java Launcher: Generate Launch Configurations`
- `Java Launcher: Manage Running Java Processes`
- `Java Launcher: Scan Java Entry Points`
- `Java Launcher: Create Aggregated Launch Configuration`
- `Java Launcher: Manage Aggregated Launch Configurations`
- `Java Launcher: Execute Aggregated Launch Configuration`
- `Java Launcher: Set Spring Active Profile`
- `Java Launcher: Set All Spring Boot Profiles`
- `Java Launcher: Refresh View`

## Known Issues

- **Gradle Support**: Support for Gradle projects is currently **experimental**. It can only recognize simple projects that follow standard directory structures (e.g., `src/main/java`) and does not yet resolve dependencies. We are actively working on it and plan to provide full, official support in a future release. In the meantime, we recommend using Maven projects for the best experience.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/vaspike/Java-Launcher/issues).

## License

This extension is licensed under the [MIT License](./LICENSE). 
