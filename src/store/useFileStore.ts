/**
 * 文件管理状态（多 Daemon 支持）
 * 自动使用 useAuthStore 中的 selectedDaemonId
 */
import { create } from 'zustand';
import * as fileApi from '@/api/file';
import type { FileItem } from '@/types/file';
import { useAuthStore } from './useAuthStore';

/** 文件 Store 状态接口 */
interface FileStoreState {
  /** 当前路径（绝对路径） */
  currentPath: string;
  /** 文件列表 */
  files: FileItem[];
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;

  /** 获取文件列表 */
  fetchFiles: (uuid: string, path?: string) => Promise<void>;
  /** 创建目录 */
  createDirectory: (uuid: string, dirName: string) => Promise<void>;
  /** 删除文件/目录 */
  deleteFiles: (uuid: string, paths: string[]) => Promise<void>;
  /** 读取文件内容 */
  readFile: (uuid: string, path: string) => Promise<string | null>;
  /** 写入文件内容 */
  writeFile: (uuid: string, path: string, content: string) => Promise<void>;
  /** 设置当前路径 */
  setCurrentPath: (path: string) => void;
  /** 清除错误 */
  clearError: () => void;
}

/** 获取当前选中的 Daemon ID */
function getSelectedDaemonId(): string {
  const daemon = useAuthStore.getState().getSelectedDaemon();
  if (!daemon) {
    throw new Error('未选择 Daemon，请在设置中添加并选择一个 Daemon');
  }
  return daemon.id;
}

/** 创建 File Store */
export const useFileStore = create<FileStoreState>((set, get) => ({
  currentPath: '/',
  files: [],
  isLoading: false,
  error: null,

  /** 获取文件列表 */
  fetchFiles: async (uuid: string, path: string = '/') => {
    const daemonId = getSelectedDaemonId();
    try {
      set({ isLoading: true, error: null });

      const files = await fileApi.fetchFiles(daemonId, uuid, path);
      set({ files, currentPath: path, isLoading: false });
    } catch (error) {
      console.error('[FileStore] fetchFiles failed:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '获取文件列表失败',
      });
    }
  },

  /** 创建目录 */
  createDirectory: async (uuid: string, dirName: string) => {
    const daemonId = getSelectedDaemonId();
    try {
      set({ error: null });

      await fileApi.createDirectory(daemonId, uuid, get().currentPath, dirName);
      
      // 刷新文件列表
      await get().fetchFiles(uuid, get().currentPath);
    } catch (error) {
      console.error('[FileStore] createDirectory failed:', error);
      set({
        error: error instanceof Error ? error.message : '创建目录失败',
      });
    }
  },

  /** 删除文件/目录 */
  deleteFiles: async (uuid: string, paths: string[]) => {
    const daemonId = getSelectedDaemonId();
    try {
      set({ error: null });

      await fileApi.deleteFiles(daemonId, uuid, paths);
      
      // 刷新文件列表
      await get().fetchFiles(uuid, get().currentPath);
    } catch (error) {
      console.error('[FileStore] deleteFiles failed:', error);
      set({
        error: error instanceof Error ? error.message : '删除文件失败',
      });
    }
  },

  /** 读取文件内容 */
  readFile: async (uuid: string, path: string): Promise<string | null> => {
    const daemonId = getSelectedDaemonId();
    try {
      const content = await fileApi.readFile(daemonId, uuid, path);
      return content;
    } catch (error) {
      console.error('[FileStore] readFile failed:', error);
      set({
        error: error instanceof Error ? error.message : '读取文件失败',
      });
      return null;
    }
  },

  /** 写入文件内容 */
  writeFile: async (uuid: string, path: string, content: string) => {
    const daemonId = getSelectedDaemonId();
    try {
      set({ error: null });

      await fileApi.writeFile(daemonId, uuid, path, content);
    } catch (error) {
      console.error('[FileStore] writeFile failed:', error);
      set({
        error: error instanceof Error ? error.message : '写入文件失败',
      });
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
