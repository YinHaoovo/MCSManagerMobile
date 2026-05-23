/**
 * 实例列表状态管理
 */
import { create } from 'zustand';
import { InstanceDetail, InstanceItem, InstanceStatus } from '@/types/instance';
import { DaemonInfo } from '@/types/daemon';
import * as instanceApi from '@/api/instance';
import * as daemonApi from '@/api/daemon';

/** Instance Store 状态接口 */
interface InstanceStoreState {
  /** 实例列表 */
  instances: InstanceItem[];
  /** 节点列表 */
  daemons: DaemonInfo[];
  /** 当前选中的节点 ID */
  selectedDaemonId: string;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;

  /** 获取节点列表 */
  fetchDaemons: () => Promise<void>;
  /** 获取实例列表 */
  fetchInstances: (daemonId: string) => Promise<void>;
  /** 启动实例 */
  startInstance: (uuid: string, daemonId: string) => Promise<void>;
  /** 停止实例 */
  stopInstance: (uuid: string, daemonId: string) => Promise<void>;
  /** 重启实例 */
  restartInstance: (uuid: string, daemonId: string) => Promise<void>;
  /** 设置选中的节点 */
  setSelectedDaemonId: (daemonId: string) => void;
  /** 清除错误 */
  clearError: () => void;
}

/** 创建 Instance Store */
export const useInstanceStore = create<InstanceStoreState>((set, get) => ({
  instances: [],
  daemons: [],
  selectedDaemonId: '',
  isLoading: false,
  error: null,

  /** 获取节点列表 */
  fetchDaemons: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await daemonApi.fetchDaemons();

      set({
        daemons: response.data.instances || [],
        isLoading: false,
      });

      // 如果有节点且未选中任何节点，自动选中第一个
      const state = get();
      if (state.daemons.length > 0 && !state.selectedDaemonId) {
        set({ selectedDaemonId: state.daemons[0].uuid });
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '获取节点列表失败';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  /** 获取实例列表 */
  fetchInstances: async (daemonId: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await instanceApi.fetchInstances(daemonId);

      set({
        instances: response.data || [],
        selectedDaemonId: daemonId,
        isLoading: false,
      });
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '获取实例列表失败';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  /** 启动实例 */
  startInstance: async (uuid: string, daemonId: string) => {
    try {
      set({ error: null });

      await instanceApi.startInstance(uuid, daemonId);

      // 刷新实例列表
      await get().fetchInstances(daemonId);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '启动实例失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  /** 停止实例 */
  stopInstance: async (uuid: string, daemonId: string) => {
    try {
      set({ error: null });

      await instanceApi.stopInstance(uuid, daemonId);

      // 刷新实例列表
      await get().fetchInstances(daemonId);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '停止实例失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  /** 重启实例 */
  restartInstance: async (uuid: string, daemonId: string) => {
    try {
      set({ error: null });

      await instanceApi.restartInstance(uuid, daemonId);

      // 刷新实例列表
      await get().fetchInstances(daemonId);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '重启实例失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  /** 设置选中的节点 */
  setSelectedDaemonId: (daemonId: string) => {
    set({ selectedDaemonId: daemonId });
  },

  /** 清除错误 */
  clearError: () => {
    set({ error: null });
  },
}));
