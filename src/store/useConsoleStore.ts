/**
 * Console state management
 */
import { create } from 'zustand';
import { InstanceStatus } from '@/types/instance';
import * as instanceApi from '@/api/instance';
import { SocketManager } from '@/services/socket';
import { useAuthStore } from './useAuthStore';

/** Console Store state interface */
interface ConsoleStoreState {
  /** Log content */
  logs: string;
  /** Auto scroll */
  isAutoScroll: boolean;
  /** Connecting */
  isConnecting: boolean;
  /** Error message */
  error: string | null;
  /** WebSocket manager instance */
  socketManager: SocketManager | null;

  /** Fetch logs */
  fetchLogs: (uuid: string, daemonId: string, size?: number) => Promise<void>;
  /** Send command */
  sendCommand: (uuid: string, daemonId: string, cmd: string) => Promise<void>;
  /** Connect WebSocket */
  connectWebSocket: (uuid: string, daemonId: string) => void;
  /** Disconnect WebSocket */
  disconnectWebSocket: () => void;
  /** Append logs */
  appendLogs: (log: string) => void;
  /** Clear logs */
  clearLogs: () => void;
  /** Toggle auto scroll */
  toggleAutoScroll: () => void;
  /** Clear error */
  clearError: () => void;
}

/** Create Console Store */
export const useConsoleStore = create<ConsoleStoreState>((set, get) => ({
  logs: '',
  isAutoScroll: true,
  isConnecting: false,
  error: null,
  socketManager: null,

  /** Fetch logs */
  fetchLogs: async (uuid: string, daemonId: string, size: number = 100) => {
    try {
      set({ error: null });

      const response = await instanceApi.fetchOutputLog(uuid, daemonId, size);

      set({ logs: response.data || '' });
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Failed to fetch logs';
      set({ error: errorMessage });
    }
  },

  /** Send command */
  sendCommand: async (uuid: string, daemonId: string, cmd: string) => {
    try {
      set({ error: null });

      await instanceApi.sendCommand(uuid, daemonId, cmd);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Failed to send command';
      set({ error: errorMessage });
      throw error;
    }
  },

  /** Connect WebSocket */
  connectWebSocket: (uuid: string, daemonId: string) => {
    try {
      set({ error: null, isConnecting: true });

      const { panelURL, apiKey } = useAuthStore.getState();

      if (!panelURL || !apiKey) {
        set({ error: 'Not authenticated', isConnecting: false });
        return;
      }

      // Create WebSocket manager
      const manager: SocketManager = new SocketManager();

      // Listen for connect event
      manager.on('connect', () => {
        set({ isConnecting: false });
        console.log('WebSocket connected');
      });

      // Listen for disconnect event
      manager.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      // Listen for log events
      manager.on('instance/log', (logData: string) => {
        get().appendLogs(logData);
      });

      // Connect
      const wsUrl: string = `ws://${panelURL.replace(/^https?:\/\//, '')}/socket.io/`;
      manager.connect(wsUrl, apiKey);

      set({ socketManager: manager, isConnecting: false });
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Failed to connect WebSocket';
      set({
        error: errorMessage,
        isConnecting: false,
      });
    }
  },

  /** Disconnect WebSocket */
  disconnectWebSocket: () => {
    const { socketManager } = get();

    if (socketManager) {
      socketManager.disconnect();
      set({ socketManager: null });
    }
  },

  /** Append logs */
  appendLogs: (log: string) => {
    set((state: ConsoleStoreState) => ({
      logs: state.logs + log,
    }));
  },

  /** Clear logs */
  clearLogs: () => {
    set({ logs: '' });
  },

  /** Toggle auto scroll */
  toggleAutoScroll: () => {
    set((state: ConsoleStoreState) => ({
      isAutoScroll: !state.isAutoScroll,
    }));
  },

  /** Clear error */
  clearError: () => {
    set({ error: null });
  },
}));
