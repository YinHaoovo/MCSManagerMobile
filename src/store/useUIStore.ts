/**
 * UI 全局状态管理（预留）
 * 用于管理主题、语言、全局加载状态等
 */
import { create } from 'zustand';

/** UI Store 状态接口 */
interface UIStoreState {
  /** 是否深色模式 */
  isDarkMode: boolean;
  /** 全局加载状态 */
  isGlobalLoading: boolean;
  /** 全局错误信息 */
  globalError: string | null;

  /** 切换深色模式 */
  toggleDarkMode: () => void;
  /** 设置全局加载状态 */
  setGlobalLoading: (loading: boolean) => void;
  /** 设置全局错误 */
  setGlobalError: (error: string | null) => void;
  /** 清除全局错误 */
  clearGlobalError: () => void;
}

/** 创建 UI Store */
export const useUIStore = create<UIStoreState>((set) => ({
  isDarkMode: true, // 默认深色模式（符合游戏玩家偏好）
  isGlobalLoading: false,
  globalError: null,

  /** 切换深色模式 */
  toggleDarkMode: () => {
    set((state: UIStoreState) => ({
      isDarkMode: !state.isDarkMode,
    }));
  },

  /** 设置全局加载状态 */
  setGlobalLoading: (loading: boolean) => {
    set({ isGlobalLoading: loading });
  },

  /** 设置全局错误 */
  setGlobalError: (error: string | null) => {
    set({ globalError: error });
  },

  /** 清除全局错误 */
  clearGlobalError: () => {
    set({ globalError: null });
  },
}));
