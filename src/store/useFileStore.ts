/**
 * 文件管理状态（Daemon 直连模式）
 *  无需 daemonId，所有操作直接走已连接的 Daemon
 */
import { create } from 'zustand';
import * as fileApi from '@/api/file';
import { FileItem, FileListResponse } from '@/types/file';

/** File Store 状态接口 */
interface FileStoreState {
  /** 当前路径 */
  currentPath: string;
  /** 文件列表 */
  files: FileItem[];
  /** 绝对路径 */
  absolutePath: string;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;

  /** 获取文件列表 */
  fetchFiles: (uuid: string, path?: string) => Promise<void>;
  /** 读取文件内容 */
  readFile: (uuid: string, path: string) => Promise<string>;
  /** 写入文件 */
  writeFile: (uuid: string, path: string, content: string) => Promise<void>;
  /** 删除文件 */
  deleteFiles: (uuid: string, paths: string[]) => Promise<void>;
  /** 创建文件夹 */
  createDir: (uuid: string, path: string) => Promise<void>;
  /** 创建文件 */
  createFile: (uuid: string, path: string) => Promise<void>;
  /** 设置当前路径 */
  setCurrentPath: (path: string) => void;
  /** 清除错误 */
  clearError: () => void;
}

/** 创建 File Store */
export const useFileStore = create<FileStoreState>((set, get) => ({
  currentPath: '/',
  files: [],
  absolutePath: '',
  isLoading: false,
  error: null,

  /** 获取文件列表 */
  fetchFiles: async (uuid: string, path: string = '/') => {
    try {
      set({ isLoading: true, error: null });

      const response = await fileApi.fetchFiles(uuid, path);

      set({
        files: response.items || [],
        currentPath: path,
        absolutePath: response.absolutePath || '',
        isLoading: false,
      });
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '获取文件列表失败';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  /** 读取文件内容 */
  readFile: async (uuid: string, path: string): Promise<string> => {
    try {
      set({ error: null });

      const content = await fileApi.readFile(uuid, path);

      return content || '';
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '读取文件失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  /** 写入文件 */
  writeFile: async (uuid: string, path: string, content: string) => {
    try {
      set({ error: null });

      await fileApi.writeFile(uuid, path, content);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '写入文件失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  /** 删除文件 */
  deleteFiles: async (uuid: string, paths: string[]) => {
    try {
      set({ error: null });

      await fileApi.deleteFiles(uuid, paths);

      // 刷新文件列表
      await get().fetchFiles(uuid, get().currentPath);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '删除文件失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  /** 创建文件夹 */
  createDir: async (uuid: string, path: string) => {
    try {
      set({ error: null });

      await fileApi.createDir(uuid, path);

      // 刷新文件列表
      await get().fetchFiles(uuid, get().currentPath);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '创建文件夹失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  /** 创建文件 */
  createFile: async (uuid: string, path: string) => {
    try {
      set({ error: null });

      await fileApi.createFile(uuid, path);

      // 刷新文件列表
      await get().fetchFiles(uuid, get().currentPath);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '创建文件失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  /** 设置当前路径 */
  setCurrentPath: (path: string) => {
    set({ currentPath: path });
  },

  /** 清除错误 */
  clearError: () => {
    set({ error: null });
  },
}));
