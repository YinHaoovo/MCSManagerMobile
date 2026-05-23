/**
 * 实例列表状态管理（Daemon 直连模式）
 *  无需 daemonId，所有操作直接走已连接的 Daemon
 */
import { create } from 'zustand';
import * as instanceApi from '@/api/instance';
import type { InstanceDetail, InstanceItem, InstanceStatus } from '@/types/instance';

/** Instance Store 状态接口 */
interface InstanceStoreState {
  /** 实例列表 */
  instances: InstanceItem[];
  /** 当前选中的实例 UUID */
  selectedUuid: string;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;

  /** 获取实例列表 */
  fetchInstances: () => Promise<void>;
  /** 获取实例详情 */
  fetchInstanceDetail: (uuid: string) => Promise<InstanceDetail | null>;
  /** 启动实例 */
  startInstance: (uuid: string) => Promise<void>;
  /** 停止实例 */
  stopInstance: (uuid: string) => Promise<void>;
  /** 重启实例 */
  restartInstance: (uuid: string) => Promise<void>;
  /** 强制结束实例 */
  killInstance: (uuid: string) => Promise<void>;
  /** 发送命令到实例终端 */
  sendCommand: (uuid: string, command: string) => Promise<void>;
  /** 获取实例终端输出日志 */
  fetchOutputLog: (uuid: string, size?: number) => Promise<string>;
  /** 设置选中的实例 */
  setSelectedUuid: (uuid: string) => void;
  /** 清除错误 */
  clearError: () => void;
}

export const useInstanceStore = create<InstanceStoreState>((set, get) => ({
  instances: [],
  selectedUuid: '',
  isLoading: false,
  error: null,

  fetchInstances: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await instanceApi.fetchInstances();
      set({ instances: response || [], isLoading: false });
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '获取实例列表失败';
      set({ isLoading: false, error: errorMessage });
    }
  },

  fetchInstanceDetail: async (uuid: string): Promise<InstanceDetail | null> => {
    try {
      set({ error: null });
      const response = await instanceApi.fetchInstanceDetail(uuid);
      return response;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '获取实例详情失败';
      set({ error: errorMessage });
      return null;
    }
  },

  startInstance: async (uuid: string): Promise<void> => {
    try {
      set({ error: null });
      await instanceApi.startInstance(uuid);
      // 刷新实例列表
      await get().fetchInstances();
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '启动实例失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  stopInstance: async (uuid: string): Promise<void> => {
    try {
      set({ error: null });
      await instanceApi.stopInstance(uuid);
      // 刷新实例列表
      await get().fetchInstances();
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '停止实例失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  restartInstance: async (uuid: string): Promise<void> => {
    try {
      set({ error: null });
      await instanceApi.restartInstance(uuid);
      // 刷新实例列表
      await get().fetchInstances();
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '重启实例失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  killInstance: async (uuid: string): Promise<void> => {
    try {
      set({ error: null });
      await instanceApi.killInstance(uuid);
      // 刷新实例列表
      await get().fetchInstances();
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '强制结束实例失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  sendCommand: async (uuid: string, command: string): Promise<void> => {
    try {
      set({ error: null });
      await instanceApi.sendCommand(uuid, command);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '发送命令失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  fetchOutputLog: async (uuid: string, size: number = 100): Promise<string> => {
    try {
      set({ error: null });
      const response = await instanceApi.fetchOutputLog(uuid, size);
      return response || '';
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '获取输出日志失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  setSelectedUuid: (uuid: string) => {
    set({ selectedUuid: uuid });
  },

  clearError: () => {
    set({ error: null });
  },
}));
