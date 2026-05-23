/**
 * 认证状态管理
 * 使用 expo-secure-store 存储 apiKey 和 panelURL
 */
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { verifyAuth } from '@/api/auth';

/** 存储键名 */
const STORAGE_KEYS = {
  API_KEY: 'mcsm_apikey',
  PANEL_URL: 'mcsm_panelURL',
} as const;

/** Auth Store 状态接口 */
interface AuthStoreState {
  /** API Key */
  apiKey: string;
  /** Panel URL */
  panelURL: string;
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 是否正在加载 */
  isLoading: boolean;

  /** 登录 */
  login: (panelURL: string, apiKey: string) => Promise<boolean>;
  /** 登出 */
  logout: () => void;
  /** 加载保存的认证信息 */
  loadSavedAuth: () => Promise<void>;
}

/** 从 SecureStore 读取数据 */
async function getFromSecureStore(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error('Failed to get from SecureStore:', error);
    return null;
  }
}

/** 保存数据到 SecureStore */
async function saveToSecureStore(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error('Failed to save to SecureStore:', error);
  }
}

/** 从 SecureStore 删除数据 */
async function deleteFromSecureStore(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Failed to delete from SecureStore:', error);
  }
}

/** 创建 Auth Store */
export const useAuthStore = create<AuthStoreState>((set, get) => ({
  apiKey: '',
  panelURL: '',
  isAuthenticated: false,
  isLoading: true,

  /** 登录 */
  login: async (panelURL: string, apiKey: string): Promise<boolean> => {
    try {
      set({ isLoading: true });

      // 验证凭据
      const isValid: boolean = await verifyAuth(panelURL, apiKey);

      if (!isValid) {
        set({ isLoading: false });
        return false;
      }

      // 保存凭据到 SecureStore
      await saveToSecureStore(STORAGE_KEYS.API_KEY, apiKey);
      await saveToSecureStore(STORAGE_KEYS.PANEL_URL, panelURL);

      // 更新状态
      set({
        apiKey,
        panelURL,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      set({ isLoading: false });
      return false;
    }
  },

  /** 登出 */
  logout: () => {
    // 清除 SecureStore
    deleteFromSecureStore(STORAGE_KEYS.API_KEY);
    deleteFromSecureStore(STORAGE_KEYS.PANEL_URL);

    // 重置状态
    set({
      apiKey: '',
      panelURL: '',
      isAuthenticated: false,
      isLoading: false,
    });
  },

  /** 加载保存的认证信息 */
  loadSavedAuth: async () => {
    try {
      set({ isLoading: true });

      const apiKey: string | null = await getFromSecureStore(STORAGE_KEYS.API_KEY);
      const panelURL: string | null = await getFromSecureStore(STORAGE_KEYS.PANEL_URL);

      if (apiKey && panelURL) {
        // 验证保存的凭据是否仍然有效
        const isValid: boolean = await verifyAuth(panelURL, apiKey);

        if (isValid) {
          set({
            apiKey,
            panelURL,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        } else {
          // 凭据已失效，清除
          await deleteFromSecureStore(STORAGE_KEYS.API_KEY);
          await deleteFromSecureStore(STORAGE_KEYS.PANEL_URL);
        }
      }

      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to load saved auth:', error);
      set({ isLoading: false });
    }
  },
}));
