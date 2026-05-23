/**
 * WebSocket 管理类
 * 连接/重连/事件监听/自动重连指数退避
 */
import { io, Socket } from 'socket.io-client';

/** 重连延迟配置（指数退避）*/
const RECONNECT_DELAYS: number[] = [1000, 2000, 4000, 8000, 30000]; // 最大 30 秒

/** WebSocket 事件类型 */
export interface SocketEvents {
  connect: () => void;
  disconnect: () => void;
  error: (error: Error) => void;
  'instance/log': (logData: string) => void;
  'instance/status': (statusData: { uuid: string; status: number }) => void;
}

export class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private eventHandlers: Map<string, Set<Function>> = new Map<string, Set<Function>>();
  private savedUrl: string = '';
  private savedToken: string = '';
  private autoReconnectEnabled: boolean = true;

  /** 连接 WebSocket */
  connect(url: string, token: string): void {
    // 保存 URL 和 token 用于重连
    this.savedUrl = url;
    this.savedToken = token;
    this.autoReconnectEnabled = true;

    // 如果已连接，先断开
    if (this.socket) {
      this.disconnect();
    }

    // 创建 Socket.IO 连接
    this.socket = io(url, {
      query: {
        apikey: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: false, // 禁用内置重连，使用自定义重连逻辑
    });

    // 监听连接成功
    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      this.reconnectAttempts = 0;
      this.emit('connect');
    });

    // 监听断开连接
    this.socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      this.emit('disconnect');

      // 自动重连
      if (this.autoReconnectEnabled && this.savedUrl) {
        this.scheduleReconnect(this.savedUrl, this.savedToken);
      }
    });

    // 监听错误
    this.socket.on('error', (error: Error) => {
      console.error('[WebSocket] Error:', error);
      this.emit('error', error);
    });

    // 监听实例日志
    this.socket.on('instance/log', (logData: string) => {
      this.emit('instance/log', logData);
    });

    // 监听实例状态变化
    this.socket.on('instance/status', (statusData: { uuid: string; status: number }) => {
      this.emit('instance/status', statusData);
    });
  }

  /** 断开连接 */
  disconnect(): void {
    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // 禁用自动重连（手动断开时不重连）
    this.autoReconnectEnabled = false;

    // 断开连接
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // 重置重连计数
    this.reconnectAttempts = 0;
  }

  /** 发送事件 */
  emit(event: string, ...args: unknown[]): void {
    const handlers: Set<Function> | undefined = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler: Function) => {
        handler(...args);
      });
    }
  }

  /** 监听事件 */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set<Function>());
    }
    this.eventHandlers.get(event)?.add(handler);
  }

  /** 移除事件监听 */
  off(event: string, handler: Function): void {
    const handlers: Set<Function> | undefined = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /** 调度重连（指数退避）*/
  private scheduleReconnect(url: string, token: string): void {
    if (this.reconnectAttempts >= RECONNECT_DELAYS.length) {
      console.log('[WebSocket] Max reconnect attempts reached');
      return;
    }

    const delay: number = RECONNECT_DELAYS[this.reconnectAttempts];
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(url, token);
    }, delay);
  }

  /** 检查是否已连接 */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}
