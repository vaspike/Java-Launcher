# Change Log

All notable changes to the "java-launcher" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.5.0] - 2026-07-23

### Fixed
- Manage Running Java Processes: Stop now reliably terminates JVMs launched in integrated/external terminal (VS Code 1.129+). Tracks `processid` / `shellProcessId`, resolves Java child PIDs, and force-kills the process tree when needed.

## [Unreleased]
