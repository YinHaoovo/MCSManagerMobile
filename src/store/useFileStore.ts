/**
 * 文件管理状态
 */
import { create } from 'zustand';
import { FileItem, FileListResponse } from '@/types/file';
import * as fileApi from '@/api/file';

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
  fetchFiles: (daemonId: string, uuid: string, path?: string) => Promise<void>;
  /** 读取文件内容 */
  readFile: (daemonId: string, uuid: string, path: string) => Promise<string>;
  /** 写入文件 */
  writeFile: (daemonId: string, uuid: string, path: string, content: string) => Promise<void>;
  /** 删除文件 */
  deleteFiles: (daemonId: string, uuid: string, paths: string[]) => Promise<void>;
  /** 创建文件夹 */
  createDir: (daemonId: string, uuid: string, path: string) => Promise<void>;
  /** 创建文件 */
  createFile: (daemonId: string, uuid: string, path: string) => Promise<void>;
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
  fetchFiles: async (daemonId: string, uuid: string, path: string = '/') => {
    try {
      set({ isLoading: true, error: null });

      const response = await fileApi.fetchFiles(daemonId, uuid, path);

      set({
        files: response.data.items || [],
        currentPath: path,
        absolutePath: response.data.absolutePath || '',
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
  readFile: async (daemonId: string, uuid: string, path: string): Promise<string> => {
    try {
      set({ error: null });

      const response = await fileApi.readFile(daemonId, uuid, path);

      return response.data || '';
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '读取文件失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  /** 写入文件 */
  writeFile: async (daemonId: string, uuid: string, path: string, content: string) => {
    try {
      set({ error: null });

      await fileApi.writeFile(daemonId, uuid, path, content);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '写入文件失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  /** 删除文件 */
  deleteFiles: async (daemonId: string, uuid: string, paths: string[]) => {
    try {
      set({ error: null });

      await fileApi.deleteFiles(daemonId, uuid, paths);

      // 刷新文件列表
      await get().fetchFiles(daemonId, uuid, get().currentPath);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '删除文件失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  /** 创建文件夹 */
  createDir: async (daemonId: string, uuid: string, path: string) => {
    try {
      set({ error: null });

      await fileApi.createDir(daemonId, uuid, path);

      // 刷新文件列表
      await get().fetchFiles(daemonId, uuid, get().currentPath);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '创建文件夹失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  /** 创建文件 */
  createFile: async (daemonId: string, uuid: string, path: string) => {
    try {
      set({ error: null });

      await fileApi.createFile(daemonId, uuid, path);

      // 刷新文件列表
      await get().fetchFiles(daemonId, uuid, get().currentPath);
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
