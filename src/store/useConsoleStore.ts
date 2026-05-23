/**
 * 终端/日志状态管理（多 Daemon 支持）
 * 自动使用 useAuthStore 中的 selectedDaemonId
 */
import { create } from 'zustand';
import * as instanceApi from '@/api/instance';
import { useAuthStore } from './useAuthStore';

/** 日志行 */
interface LogLine {
  text: string;
  timestamp: number;
}

/** Console Store 状态接口 */
interface ConsoleStoreState {
  /** 当前连接的实例 UUID */
  currentInstanceUuid: string | null;
  /** 日志内容（字符串） */
  logs: string;
  /** 是否自动滚动 */
  isAutoScroll: boolean;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 内部状态：取消日志监听函数（可选） */
  _unsubscribeLog?: (() => void) | null;
  /** 内部状态：取消状态监听函数（可选） */
  _unsubscribeStatus?: (() => void) | null;

  /** 连接到实例（开始接收日志） */
  connectInstance: (uuid: string) => void;
  /** 断开当前实例连接 */
  disconnectInstance: () => void;
  /** 发送命令到实例终端 */
  sendCommand: (uuid: string, command: string) => Promise<void>;
  /** 切换自动滚动 */
  toggleAutoScroll: () => void;
  /** 清除日志 */
  clearLogs: () => void;
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

/** 创建 Console Store */
export const useConsoleStore = create<ConsoleStoreState>((set, get) => ({
  currentInstanceUuid: null,
  logs: '',
  isAutoScroll: true,
  isLoading: false,
  error: null,

  /** 连接到实例（开始接收日志） */
  connectInstance: (uuid: string) => {
    const daemonId = getSelectedDaemonId();
    
    // 先断开之前的连接
    if (get().currentInstanceUuid) {
      get().disconnectInstance();
    }

    // 监听日志流
    const unsubscribeLog = instanceApi.subscribeInstanceLog(
      daemonId,
      uuid,
      (data: string) => {
        set((state) => ({
          logs: state.logs + data,
        }));
      }
    );

    // 监听状态更新
    const unsubscribeStatus = instanceApi.subscribeInstanceStatus(
      daemonId,
      uuid,
      (status) => {
        // 可以在这里处理状态更新（如 CPU/内存使用率）
        console.log('[ConsoleStore] Instance status update:', status);
      }
    );

    set({
      currentInstanceUuid: uuid,
      isLoading: false,
      error: null,
    });

    // 保存取消监听函数（在 disconnectInstance 中调用）
    (get() as any)._unsubscribeLog = unsubscribeLog;
    (get() as any)._unsubscribeStatus = unsubscribeStatus;
  },

  /** 断开当前实例连接 */
  disconnectInstance: () => {
    const unsubscribeLog = (get() as any)._unsubscribeLog;
    const unsubscribeStatus = (get() as any)._unsubscribeStatus;

    if (unsubscribeLog) unsubscribeLog();
    if (unsubscribeStatus) unsubscribeStatus();

    set({
      currentInstanceUuid: null,
      _unsubscribeLog: null,
      _unsubscribeStatus: null,
    });
  },

  /** 发送命令到实例终端 */
  sendCommand: async (uuid: string, command: string) => {
    const daemonId = getSelectedDaemonId();
    try {
      set({ error: null });
      await instanceApi.sendCommand(daemonId, uuid, command);
    } catch (error) {
      console.error('[ConsoleStore] sendCommand failed:', error);
      set({
        error: error instanceof Error ? error.message : '发送命令失败',
      });
    }
  },

  /** 切换自动滚动 */
  toggleAutoScroll: () => {
    set((state) => ({ isAutoScroll: !state.isAutoScroll }));
  },

  /** 清除日志 */
  clearLogs: () => {
    set({ logs: '' });
  },

  /** 清除错误 */
  clearError: () => {
    set({ error: null });
  },

  /** 内部状态（取消监听函数） */
  _unsubscribeLog: null,
  _unsubscribeStatus: null,
}));
