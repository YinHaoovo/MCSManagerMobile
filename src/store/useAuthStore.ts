/**
 * 认证状态管理（多 Daemon 支持）
 * 使用 expo-secure-store 存储 daemons 配置（加密存储 API Key）
 */
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { connectDaemon, disconnectDaemon, fetchDaemonInfo, type DaemonInfo } from '@/api/auth';

/** 存储键名 */
const STORAGE_KEYS = {
  DAEMONS: 'mcsm_daemons',
  SELECTED_DAEMON_ID: 'mcsm_selected_daemon_id',
} as const;

/** Daemon 配置 */
export interface DaemonConfig {
  id: string;  // uuid v4
  name?: string;  // 用户自定义名称（可选）
  url: string;  // Daemon URL (e.g., http://192.168.1.100:24444)
  apiKey?: string;  // 可选，未设时尝试空 Key 连接
  isConnected: boolean;
  info?: DaemonInfo;  // 连接后获取的 Daemon 信息
}

/** Auth Store 状态接口 */
interface AuthStoreState {
  /** 已保存的 Daemons 列表 */
  daemons: DaemonConfig[];
  /** 当前选中的 Daemon ID */
  selectedDaemonId: string | null;
  /** 是否正在加载（初始化时） */
  isLoading: boolean;

  /** 添加 Daemon 并尝试连接 */
  addDaemon: (url: string, apiKey?: string, name?: string) => Promise<{ success: boolean; requireAuth: boolean; daemonId?: string }>;
  /** 删除 Daemon */
  removeDaemon: (daemonId: string) => void;
  /** 选择当前 Daemon */
  selectDaemon: (daemonId: string) => void;
  /** 连接到指定 Daemon */
  connectDaemon: (daemonId: string) => Promise<boolean>;
  /** 断开指定 Daemon */
  disconnectDaemon: (daemonId: string) => void;
  /** 加载保存的 Daemons 配置 */
  loadSavedDaemons: () => Promise<void>;
  /** 获取当前选中的 Daemon */
  getSelectedDaemon: () => DaemonConfig | null;
}

/** 生成 UUID v4 */
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/** 从 SecureStore 读取 Daemons */
async function loadDaemonsFromStorage(): Promise<DaemonConfig[]> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEYS.DAEMONS);
    if (!raw) return [];
    return JSON.parse(raw) as DaemonConfig[];
  } catch (error) {
    console.error('Failed to load daemons from storage:', error);
    return [];
  }
}

/** 保存 Daemons 到 SecureStore */
async function saveDaemonsToStorage(daemons: DaemonConfig[]): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.DAEMONS, JSON.stringify(daemons));
  } catch (error) {
    console.error('Failed to save daemons to storage:', error);
  }
}

/** 创建 Auth Store */
export const useAuthStore = create<AuthStoreState>((set, get) => ({
  daemons: [],
  selectedDaemonId: null,
  isLoading: true,

  /** 添加 Daemon 并尝试连接 */
  addDaemon: async (url: string, apiKey?: string, name?: string): Promise<{ success: boolean; requireAuth: boolean; daemonId?: string }> => {
    try {
      // 1. 先生成 daemonId，然后连接到 Daemon
      const daemonId = generateId();
      const result = await connectDaemon(daemonId, url, apiKey);

      if (!result.success && result.requireAuth) {
        // 需要 API Key 但未提供/错误
        return { success: false, requireAuth: true };
      }

      if (!result.success && !result.requireAuth) {
        // 连接失败（网络错误等）
        return { success: false, requireAuth: false };
      }

      // 2. 连接成功，创建 DaemonConfig
      const newDaemon: DaemonConfig = {
        id: daemonId,
        name: name || url,
        url,
        apiKey,
        isConnected: true,
        info: result.info,
      };

      // 3. 保存到状态
      const updatedDaemons = [...get().daemons, newDaemon];
      set({ daemons: updatedDaemons });

      // 4. 保存到 SecureStore
      await saveDaemonsToStorage(updatedDaemons);

      // 5. 如果是第一个 Daemon，自动选中
      if (updatedDaemons.length === 1) {
        set({ selectedDaemonId: daemonId });
        await SecureStore.setItemAsync(STORAGE_KEYS.SELECTED_DAEMON_ID, daemonId);
      }

      return { success: true, requireAuth: false, daemonId };
    } catch (error) {
      console.error('Add daemon failed:', error);
      return { success: false, requireAuth: false };
    }
  },

  /** 删除 Daemon */
  removeDaemon: (daemonId: string) => {
    const state = get();
    const daemon = state.daemons.find((d) => d.id === daemonId);

    if (daemon?.isConnected) {
      disconnectDaemon(daemonId);
    }

    const updatedDaemons = state.daemons.filter((d) => d.id !== daemonId);
    set({ daemons: updatedDaemons });

    // 如果删除的是当前选中的，切换到第一个
    if (state.selectedDaemonId === daemonId) {
      const newSelectedId = updatedDaemons.length > 0 ? updatedDaemons[0].id : null;
      set({ selectedDaemonId: newSelectedId });
      if (newSelectedId) {
        SecureStore.setItemAsync(STORAGE_KEYS.SELECTED_DAEMON_ID, newSelectedId);
      } else {
        SecureStore.deleteItemAsync(STORAGE_KEYS.SELECTED_DAEMON_ID);
      }
    }

    // 保存到 SecureStore
    saveDaemonsToStorage(updatedDaemons);
  },

  /** 选择当前 Daemon */
  selectDaemon: (daemonId: string) => {
    set({ selectedDaemonId: daemonId });
    SecureStore.setItemAsync(STORAGE_KEYS.SELECTED_DAEMON_ID, daemonId);
  },

  /** 连接到指定 Daemon */
  connectDaemon: async (daemonId: string): Promise<boolean> => {
    const daemon = get().daemons.find((d) => d.id === daemonId);
    if (!daemon) return false;

    const result = await connectDaemon(daemonId, daemon.url, daemon.apiKey);

    if (result.success) {
      set((state) => ({
        daemons: state.daemons.map((d) =>
          d.id === daemonId ? { ...d, isConnected: true, info: result.info } : d
        ),
      }));
      return true;
    }

    return false;
  },

  /** 断开指定 Daemon */
  disconnectDaemon: (daemonId: string) => {
    disconnectDaemon(daemonId);

    set((state) => ({
      daemons: state.daemons.map((d) =>
        d.id === daemonId ? { ...d, isConnected: false } : d
      ),
    }));
  },

  /** 加载保存的 Daemons 配置 */
  loadSavedDaemons: async () => {
    try {
      set({ isLoading: true });

      const daemons = await loadDaemonsFromStorage();
      const selectedId = await SecureStore.getItemAsync(STORAGE_KEYS.SELECTED_DAEMON_ID);

      // 尝试重连所有已保存的 Daemon
      for (const daemon of daemons) {
        try {
          const result = await connectDaemon(daemon.id, daemon.url, daemon.apiKey);
          if (result.success) {
            daemon.isConnected = true;
            daemon.info = result.info;
          } else {
            daemon.isConnected = false;
          }
        } catch {
          daemon.isConnected = false;
        }
      }

      set({
        daemons,
        selectedDaemonId: selectedId && daemons.find((d) => d.id === selectedId) ? selectedId : (daemons.length > 0 ? daemons[0].id : null),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load saved daemons:', error);
      set({ isLoading: false });
    }
  },

  /** 获取当前选中的 Daemon */
  getSelectedDaemon: () => {
    const state = get();
    if (!state.selectedDaemonId) return null;
    return state.daemons.find((d) => d.id === state.selectedDaemonId) || null;
  },
}));
