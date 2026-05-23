/**
 * 实例管理状态（多 Daemon 支持）
 * 自动使用 useAuthStore 中的 selectedDaemonId
 */
import { create } from 'zustand';
import * as instanceApi from '@/api/instance';
import type { Instance, InstanceDetail, ProcessInfo } from '@/types/instance';
import { useAuthStore } from './useAuthStore';

/** Instance Store 状态接口 */
interface InstanceStoreState {
  /** 实例列表（当前选中 Daemon 的） */
  instances: Instance[];
  /** 实例详情缓存（uuid → Detail） */
  instanceDetails: Record<string, InstanceDetail>;
  /** 正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;

  /** 获取实例列表（使用当前选中的 Daemon） */
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
  /** 获取实例进程信息 */
  fetchProcessInfo: (uuid: string) => Promise<ProcessInfo | null>;
  /** 清除错误 */
  clearError: () => void;
}

/** 获取当前选中的 Daemon ID（从 useAuthStore） */
function getSelectedDaemonId(): string | null {
  return useAuthStore.getState().selectedDaemonId;
}

/** 检查 Daemon 是否已连接 */
function checkDaemonConnected(daemonId: string | null): daemonId is string {
  if (!daemonId) {
    throw new Error('未选择 Daemon，请在设置中添加并选择一个 Daemon');
  }
  return true;
}

/** 创建 Instance Store */
export const useInstanceStore = create<InstanceStoreState>((set, get) => ({
  instances: [],
  instanceDetails: {},
  isLoading: false,
  error: null,

  /** 获取实例列表 */
  fetchInstances: async () => {
    const daemonId = getSelectedDaemonId();
    if (!checkDaemonConnected(daemonId)) return;

    try {
      set({ isLoading: true, error: null });

      const instances = await instanceApi.fetchInstances(daemonId);
      set({ instances, isLoading: false });
    } catch (error) {
      console.error('[InstanceStore] fetchInstances failed:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '获取实例列表失败',
      });
    }
  },

  /** 获取实例详情 */
  fetchInstanceDetail: async (uuid: string): Promise<InstanceDetail | null> => {
    const daemonId = getSelectedDaemonId();
    if (!checkDaemonConnected(daemonId)) return null;

    try {
      set({ isLoading: true, error: null });

      const detail = await instanceApi.fetchInstanceDetail(daemonId, uuid);
      
      // 缓存详情
      set((state) => ({
        instanceDetails: { ...state.instanceDetails, [uuid]: detail },
        isLoading: false,
      }));

      return detail;
    } catch (error) {
      console.error('[InstanceStore] fetchInstanceDetail failed:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '获取实例详情失败',
      });
      return null;
    }
  },

  /** 启动实例 */
  startInstance: async (uuid: string) => {
    const daemonId = getSelectedDaemonId();
    if (!checkDaemonConnected(daemonId)) return;

    try {
      set({ isLoading: true, error: null });

      await instanceApi.startInstance(daemonId, uuid);
      
      // 刷新实例列表
      await get().fetchInstances();
    } catch (error) {
      console.error('[InstanceStore] startInstance failed:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '启动实例失败',
      });
    }
  },

  /** 停止实例 */
  stopInstance: async (uuid: string) => {
    const daemonId = getSelectedDaemonId();
    if (!checkDaemonConnected(daemonId)) return;

    try {
      set({ isLoading: true, error: null });

      await instanceApi.stopInstance(daemonId, uuid);
      
      // 刷新实例列表
      await get().fetchInstances();
    } catch (error) {
      console.error('[InstanceStore] stopInstance failed:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '停止实例失败',
      });
    }
  },

  /** 重启实例 */
  restartInstance: async (uuid: string) => {
    const daemonId = getSelectedDaemonId();
    if (!checkDaemonConnected(daemonId)) return;

    try {
      set({ isLoading: true, error: null });

      await instanceApi.restartInstance(daemonId, uuid);
      
      // 刷新实例列表
      await get().fetchInstances();
    } catch (error) {
      console.error('[InstanceStore] restartInstance failed:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '重启实例失败',
      });
    }
  },

  /** 强制结束实例 */
  killInstance: async (uuid: string) => {
    const daemonId = getSelectedDaemonId();
    if (!checkDaemonConnected(daemonId)) return;

    try {
      set({ isLoading: true, error: null });

      await instanceApi.killInstance(daemonId, uuid);
      
      // 刷新实例列表
      await get().fetchInstances();
    } catch (error) {
      console.error('[InstanceStore] killInstance failed:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '强制结束实例失败',
      });
    }
  },

  /** 发送命令到实例终端 */
  sendCommand: async (uuid: string, command: string) => {
    const daemonId = getSelectedDaemonId();
    if (!checkDaemonConnected(daemonId)) return;

    try {
      await instanceApi.sendCommand(daemonId, uuid, command);
    } catch (error) {
      console.error('[InstanceStore] sendCommand failed:', error);
      set({
        error: error instanceof Error ? error.message : '发送命令失败',
      });
    }
  },

  /** 获取实例进程信息 */
  fetchProcessInfo: async (uuid: string): Promise<ProcessInfo | null> => {
    const daemonId = getSelectedDaemonId();
    if (!checkDaemonConnected(daemonId)) return null;

    try {
      const processInfo = await instanceApi.fetchProcessInfo(daemonId, uuid);
      return processInfo;
    } catch (error) {
      console.error('[InstanceStore] fetchProcessInfo failed:', error);
      return null;
    }
  },

  /** 清除错误 */
  clearError: () => {
    set({ error: null });
  },
}));
