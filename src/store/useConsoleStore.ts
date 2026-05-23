/**
 * Console state management（Daemon 直连模式）
 *  无需 daemonId，所有操作直接走已连接的 Daemon
 */
import { create } from 'zustand';
import * as instanceApi from '@/api/instance';

/** Console Store 状态接口 */
interface ConsoleStoreState {
  /** 日志内容 */
  logs: string;
  /** 是否正在连接 */
  isConnecting: boolean;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 当前订阅的实例 UUID */
  activeUuid: string | null;
  /** 取消日志流订阅的函数 */
  unsubscribeLogs: (() => void) | null;
  /** 取消状态订阅的函数 */
  unsubscribeStatus: (() => void) | null;

  /** 连接实例（启动日志流）*/
  connectInstance: (uuid: string) => void;
  /** 断开当前实例 */
  disconnectInstance: () => void;
  /** 发送命令 */
  sendCommand: (uuid: string, command: string) => Promise<void>;
  /** 获取实例输出日志 */
  fetchLogs: (uuid: string, size?: number) => Promise<void>;
  /** 清除日志 */
  clearLogs: () => void;
  /** 清除错误 */
  clearError: () => void;
}

export const useConsoleStore = create<ConsoleStoreState>((set, get) => ({
  logs: '',
  isConnecting: false,
  isLoading: false,
  error: null,
  activeUuid: null,
  unsubscribeLogs: null,
  unsubscribeStatus: null,

  connectInstance: (uuid: string) => {
    const state = get();
    // 先断开旧连接
    if (state.unsubscribeLogs) state.unsubscribeLogs();
    if (state.unsubscribeStatus) state.unsubscribeStatus();

    set({ isConnecting: true, activeUuid: uuid, error: null });

    // 订阅日志流
    const unsubLogs = instanceApi.subscribeInstanceLog(
      uuid,
      (log: string) => {
        set((s) => ({ logs: s.logs + log }));
      }
    );

    // 订阅状态变化
    const unsubStatus = instanceApi.subscribeInstanceStatus(
      (data: { uuid: string; status: number }) => {
        // 状态变化时可做额外处理
        console.log(`Instance ${data.uuid} status: ${data.status}`);
      }
    );

    set({
      isConnecting: false,
      unsubscribeLogs: unsubLogs,
      unsubscribeStatus: unsubStatus,
    });
  },

  disconnectInstance: () => {
    const { unsubscribeLogs, unsubscribeStatus } = get();
    if (unsubscribeLogs) unsubscribeLogs();
    if (unsubscribeStatus) unsubscribeStatus();
    set({
      activeUuid: null,
      unsubscribeLogs: null,
      unsubscribeStatus: null,
      logs: '',
    });
  },

  sendCommand: async (uuid: string, command: string) => {
    set({ error: null });
    try {
      await instanceApi.sendCommand(uuid, command);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '发送命令失败';
      set({ error: msg });
      throw error;
    }
  },

  fetchLogs: async (uuid: string, size: number = 100) => {
    set({ isLoading: true, error: null });
    try {
      const log = await instanceApi.fetchOutputLog(uuid, size);
      set({ logs: log || '', isLoading: false });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '获取日志失败';
      set({ error: msg, isLoading: false });
    }
  },

  clearLogs: () => {
    set({ logs: '' });
  },

  clearError: () => {
    set({ error: null });
  },
}));
