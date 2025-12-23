# Java Launcher for VS Code

[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/River.java-launcher?style=flat-square&label=VS%20Code%20Downloads)](https://marketplace.visualstudio.com/items?itemName=River.java-launcher)
[![Open VSX Downloads](https://img.shields.io/open-vsx/dt/River/java-launcher?style=flat-square&label=Open%20VSX%20Downloads)](https://open-vsx.org/extension/River/java-launcher)

A zero-configuration tool for discovering, running, debugging, and managing Java applications in VS Code.

Inspired by IntelliJ IDEA's run configuration experience, Java Launcher automatically detects entry points—Spring Boot apps, `main` methods, and tests—so you can run or debug them instantly without manually editing `launch.json`. It also supports "aggregated" launches to start multiple services in sequence with a single click.

[English](./README.md) | [中文](./README.zh-cn.md)

---

## Glance

![image](https://github.com/user-attachments/assets/3e46dc02-545c-42ab-ae56-bcd08b305c64)
![image](https://github.com/user-attachments/assets/82486078-c953-4e53-8e5e-b41401d0a8cb)
![image](https://github.com/user-attachments/assets/f32593f3-6351-44a6-9f12-9485ebf2422a)
![image](https://github.com/user-attachments/assets/4d1a3e5d-3e78-4add-80dd-445cd141617f)

## Key Features

- **Zero-Config Discovery**: Automatically scans your workspace for runnable Java entry points.
- **Unified Tree View**: Displays all discovered apps and tests in a dedicated sidebar, grouped by project module.
- **Search & Run**: Quickly find and launch any entry point or aggregated config via a command palette-style interface. Supports lazy loading and recent history.
- **Aggregated Launch**: Group multiple applications into a single configuration to start them sequentially with custom delays—ideal for microservices.
- **Spring Boot Support**: First-class support for Spring Boot, including easy switching of active profiles (e.g., `dev`, `prod`).
- **Process Management**: A dedicated interface to view, stop, or restart any Java process started by the extension.
- **Internationalization**: Fully localized for English and Chinese users.

## Getting Started

1. Install **Java Launcher** from the VS Code Marketplace.
2. Open a Java project (Maven supported; Gradle support is experimental).
3. Click the **Rocket icon** in the Activity Bar to open the Java Launcher view.
4. The extension automatically scans for entry points. Click the **Run (▶)** icon next to any item to start it.

## Usage Guide

### 1. Running Applications
Navigate to the **Java Launcher** view in the sidebar. You will see a tree of discovered entry points:
- **Spring Boot Apps**: Marked with a leaf icon.
- **Main Classes**: Standard Java applications.
- **Tests**: JUnit/TestNG classes and methods.

Hover over an item and click the **Run** or **Debug** button.

### 2. Search and Run
Use the "Search and Run" command to quickly launch apps without leaving your keyboard.
- **Command**: `Java Launcher: Search and Run Java Entry`
- **Behavior**:
  - Displays a search box that lazy-loads entry points on first use.
  - Shows up to 5 most recently used entries or configs for instant reuse.
  - Supports fuzzy matching by name.

> **Tip**: Map this command to a keyboard shortcut for faster access (see [Recommended Shortcuts](#recommended-shortcuts)).

### 3. Aggregated Launch (Microservices)
Start multiple applications with one click.
1. Right-click an entry point in the tree and select **Add to Aggregated Config**.
2. Or use the command `Java Launcher: Create Aggregated Launch Configuration`.
3. Give it a name and select the apps to include.
4. (Optional) Configure **startup delays** (in ms) for each app to ensure dependent services start first.
5. Run the aggregated config from the **Aggregated Configurations** section in the tree view.

### 4. Managing Processes
View and control all running Java processes started by this extension.
- **Command**: `Java Launcher: Manage Running Java Processes`
- **Actions**: View status, stop individual processes, stop all, or restart all.

## Recommended Shortcuts

To improve your workflow, we recommend adding the following keybindings to your `keybindings.json`:

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

*(Adjust the keys `ctrl+alt+r` and `ctrl+alt+p` to fit your preference.)*

## Notes & Best Practices

- **First Run**: The first time you use "Search and Run" after opening VS Code, there may be a brief delay while the extension scans your project. Subsequent searches will be instant.
- **Gradle Support**: Currently experimental. It works best with standard project structures (`src/main/java`). For complex Gradle setups, manual configuration might still be required.
- **Launch.json**: While this extension aims for zero-configuration, it generates standard VS Code launch configurations in `launch.json` under the hood. You can manually edit this file if you need advanced JVM arguments or environment variables.
- **Refresh**: If you add new classes or methods, click the **Refresh** button in the Java Launcher view title bar to update the list.

## License

This project is licensed under the [MIT License](./LICENSE).
