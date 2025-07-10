import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

// 将 fs 方法转换为 Promise
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

/**
 * 文件系统管理器
 */
export class FileSystemManager {
    /**
     * 检查文件或目录是否存在
     */
    async exists(filePath: string): Promise<boolean> {
        try {
            await access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 读取文件内容
     */
    async readFile(filePath: string): Promise<string> {
        try {
            const content = await readFile(filePath, 'utf-8');
            return content;
        } catch (error) {
            throw new Error(`读取文件失败: ${filePath}, 错误: ${error}`);
        }
    }

    /**
     * 写入文件内容
     */
    async writeFile(filePath: string, content: string): Promise<void> {
        try {
            // 确保目录存在
            await this.ensureDirectoryExists(path.dirname(filePath));
            
            await writeFile(filePath, content, 'utf-8');
        } catch (error) {
            throw new Error(`写入文件失败: ${filePath}, 错误: ${error}`);
        }
    }

    /**
     * 确保目录存在
     */
    async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            const exists = await this.exists(dirPath);
            if (!exists) {
                await mkdir(dirPath, { recursive: true });
            }
        } catch (error) {
            throw new Error(`创建目录失败: ${dirPath}, 错误: ${error}`);
        }
    }

    /**
     * 获取文件或目录信息
     */
    async getStats(filePath: string): Promise<fs.Stats> {
        try {
            return await stat(filePath);
        } catch (error) {
            throw new Error(`获取文件信息失败: ${filePath}, 错误: ${error}`);
        }
    }

    /**
     * 检查是否是文件
     */
    async isFile(filePath: string): Promise<boolean> {
        try {
            const stats = await this.getStats(filePath);
            return stats.isFile();
        } catch {
            return false;
        }
    }

    /**
     * 检查是否是目录
     */
    async isDirectory(filePath: string): Promise<boolean> {
        try {
            const stats = await this.getStats(filePath);
            return stats.isDirectory();
        } catch {
            return false;
        }
    }

    /**
     * 读取目录内容
     */
    async readDirectory(dirPath: string): Promise<string[]> {
        try {
            return await readdir(dirPath);
        } catch (error) {
            throw new Error(`读取目录失败: ${dirPath}, 错误: ${error}`);
        }
    }

    /**
     * 读取 JSON 文件
     */
    async readJsonFile<T = any>(filePath: string): Promise<T> {
        try {
            const content = await this.readFile(filePath);
            return JSON.parse(content);
        } catch (error) {
            throw new Error(`读取 JSON 文件失败: ${filePath}, 错误: ${error}`);
        }
    }

    /**
     * 写入 JSON 文件
     */
    async writeJsonFile(filePath: string, data: any): Promise<void> {
        try {
            const content = JSON.stringify(data, null, 2);
            await this.writeFile(filePath, content);
        } catch (error) {
            throw new Error(`写入 JSON 文件失败: ${filePath}, 错误: ${error}`);
        }
    }

    /**
     * 获取文件的相对路径
     */
    getRelativePath(from: string, to: string): string {
        return path.relative(from, to);
    }

    /**
     * 获取文件的绝对路径
     */
    getAbsolutePath(filePath: string): string {
        return path.resolve(filePath);
    }

    /**
     * 连接路径
     */
    joinPath(...paths: string[]): string {
        return path.join(...paths);
    }

    /**
     * 获取文件扩展名
     */
    getExtension(filePath: string): string {
        return path.extname(filePath);
    }

    /**
     * 获取文件名（不包含扩展名）
     */
    getBaseName(filePath: string): string {
        return path.basename(filePath, this.getExtension(filePath));
    }

    /**
     * 获取目录名
     */
    getDirectoryName(filePath: string): string {
        return path.dirname(filePath);
    }

    /**
     * 规范化路径
     */
    normalizePath(filePath: string): string {
        return path.normalize(filePath);
    }

    /**
     * 检查路径是否是绝对路径
     */
    isAbsolutePath(filePath: string): boolean {
        return path.isAbsolute(filePath);
    }
} 