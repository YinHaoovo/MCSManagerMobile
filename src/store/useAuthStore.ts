/**
 * 认证状态管理（重构版）
 * 支持两种模式：
 *   1. Daemon 直连模式（默认）：直接连 Daemon，API Key 可选
 *   2. Panel 代理模式（保留）：通过 Panel 中转，必须登录
 *
 * 存储键名
 */
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { getDaemonClient, resetDaemonClient } from '@/api/client';
import { connectDaemon as apiConnectDaemon } from '@/api/auth';

/** 存储键名 */
const STORAGE_KEYS = {
  DAEMON_URL: 'mcsm_daemon_url',
  API_KEY: 'mcsm_api_key',
  CONNECTION_MODE: 'mcsm_conn_mode', // 'daemon' | 'panel'
  PANEL_URL: 'mcsm_panel_url',
  PANEL_KEY: 'mcsm_panel_key',
} as const;

export type ConnectionMode = 'daemon' | 'panel';

/** Auth Store 状态接口 */
interface AuthStoreState {
  /** 连接模式 */
  mode: ConnectionMode;
  /** Daemon 地址（直连模式）*/
  daemonUrl: string;
  /** API Key（可选，Daemon 未设 key 时留空）*/
  apiKey: string;
  /** Panel 地址（代理模式）*/
  panelURL: string;
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 是否正在加载 */
  isLoading: boolean;

  /** 直连 Daemon（API Key 可选）*/
  connectDaemon: (url: string, apiKey?: string) => Promise<{ success: boolean; requireAuth: boolean }>;
  /** Panel 登录（代理模式，必须）*/
  login: (panelURL: string, apiKey: string) => Promise<boolean>;
  /** 登出 */
  logout: () => void;
  /** 加载保存的认证信息 */
  loadSavedAuth: () => Promise<void>;
}

/** 从 SecureStore 读取 */
async function getFromSecureStore(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

/** 写入 SecureStore */
async function saveToSecureStore(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.error('Failed to save to SecureStore:', e);
  }
}

/** 从 SecureStore 删除 */
async function deleteFromSecureStore(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {}
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  mode: 'daemon',
  daemonUrl: '',
  apiKey: '',
  panelURL: '',
  isAuthenticated: false,
  isLoading: true,

  /** 直连 Daemon（API Key 可选）*/
  connectDaemon: async (url: string, apiKey?: string): Promise<{ success: boolean; requireAuth: boolean }> => {
    set({ isLoading: true });
    resetDaemonClient();

    try {
      const result = await apiConnectDaemon(url, apiKey);
      if (result.success || !result.requireAuth) {
        // 保存连接信息
        await saveToSecureStore(STORAGE_KEYS.DAEMON_URL, url);
        await saveToSecureStore(STORAGE_KEYS.API_KEY, apiKey ?? '');
        await saveToSecureStore(STORAGE_KEYS.CONNECTION_MODE, 'daemon');

        set({
          mode: 'daemon',
          daemonUrl: url,
          apiKey: apiKey ?? '',
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true, requireAuth: false };
      }
      set({ isLoading: false });
      return { success: false, requireAuth: result.requireAuth };
    } catch {
      set({ isLoading: false });
      return { success: false, requireAuth: false };
    }
  },

  /** Panel 登录（保留用于兼容）*/
  login: async (panelURL: string, apiKey: string): Promise<boolean> => {
    set({ isLoading: true });
    // TODO: 保留原有 Panel 登录逻辑
    // 暂未实现，直连模式优先
    set({ isLoading: false });
    return false;
  },

  /** 登出 */
  logout: () => {
    resetDaemonClient();
    // 清除 SecureStore（保留 URL 方便下次连接）
    deleteFromSecureStore(STORAGE_KEYS.API_KEY);
    set({
      apiKey: '',
      isAuthenticated: false,
      isLoading: false,
    });
  },

  /** 加载保存的认证信息（App 启动时调用）*/
  loadSavedAuth: async () => {
    set({ isLoading: true });

    try {
      const mode = (await getFromSecureStore(STORAGE_KEYS.CONNECTION_MODE)) as ConnectionMode ?? 'daemon';
      const daemonUrl = await getFromSecureStore(STORAGE_KEYS.DAEMON_URL);
      const apiKey = await getFromSecureStore(STORAGE_KEYS.API_KEY) || '';

      if (mode === 'daemon' && daemonUrl) {
        const result = await apiConnectDaemon(daemonUrl, apiKey || undefined);
        if (result.success || !result.requireAuth) {
          set({
            mode: 'daemon',
            daemonUrl,
            apiKey: apiKey || '',
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }
    } catch (e) {
      console.error('loadSavedAuth failed:', e);
    }

    set({ isLoading: false });
  },
}));
