/**
 * MCSManager Daemon Socket.io 客户端
 * 所有业务操作通过 Socket.io 事件完成
 * 协议格式：{ uuid, status, event, data }
 *
 * 重要：Daemon 要求连接后 6 秒内发送 auth 事件，否则会断开。
 */
import { io, Socket } from 'socket.io-client';
import type { Socket as SocketType } from 'socket.io-client';

/** 协议包格式（与 Daemon protocol.ts IPacket 对齐） */
export interface Packet<T = unknown> {
  uuid: string | null;
  status: number;
  event: string | null;
  data: T;
}

/** 连接状态 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'authenticated' | 'error';

// ─── 内部类型 ───────────────────────────────────────
// 待定请求
interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
}

// 事件订阅包装
interface EventListener {
  rawHandler: (data: unknown) => void;   // 用户传入的 handler
  wrappedHandler: (...args: unknown[]) => void;  // 绑到 socket.io 的包装函数
}
// ─────────────────────────────────────────────────────

/**
 * Daemon 客户端核心类
 *
 * 用法：
 *   const client = new DaemonClient();
 *   await client.connect('http://192.168.1.100:24444');
 *   await client.authenticate('your-api-key');
 *   const instances = await client.request<InstanceItem[]>('instance/list');
 */
export class DaemonClient {
  private socket: SocketType | null = null;
  private status: ConnectionStatus = 'disconnected';
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private eventListeners: Map<string, Set<EventListener>> = new Map();
  private authTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  /** 当前连接状态 */
  get connectionStatus(): ConnectionStatus {
    return this.status;
  }

  /** 连接 Daemon */
  async connect(url: string): Promise<void> {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.status = 'connecting';

    return new Promise((resolve, reject) => {
      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnection: false,
        auth: undefined,
      });

      this.socket.on('connect', () => {
        this.status = 'connected';
        // Daemon 要求 6 秒内完成认证
        this.authTimeoutTimer = setTimeout(() => {
          if (this.status === 'connected') {
            console.warn('[DaemonClient] Auth timeout warning (6s limit)');
          }
        }, 5500);
        resolve();
      });

      this.socket.on('connect_error', (err) => {
        this.status = 'error';
        reject(new Error(`Connection failed: ${err.message}`));
      });

      this.socket.on('disconnect', (_reason) => {
        this.status = 'disconnected';
        this.clearAuthTimer();
        // 拒绝所有待定请求
        for (const [, req] of this.pendingRequests) {
          clearTimeout(req.timer);
          req.reject(new Error('Disconnected'));
        }
        this.pendingRequests.clear();
      });

      this.socket.on('error', (err) => {
        console.error('[DaemonClient] Socket error:', err);
      });

      // 全局响应监听：匹配 uuid 并 resolve/reject 对应请求
      this.socket.onAny((_eventName: string, raw: unknown) => {
        try {
          const packet = raw as Packet;
          if (!packet.uuid) return;
          const req = this.pendingRequests.get(packet.uuid);
          if (!req) return;
          clearTimeout(req.timer);
          this.pendingRequests.delete(packet.uuid);
          if (packet.status === 200) {
            req.resolve(packet.data);
          } else {
            const errMsg = typeof packet.data === 'string'
              ? packet.data
              : JSON.stringify(packet.data);
            req.reject(new Error(errMsg));
          }
        } catch {
          // ignore
        }
      });
    });
  }

  /** 发送认证（Daemon 连接后 6 秒内必须调用） */
  async authenticate(apiKey: string): Promise<boolean> {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Not connected to Daemon');
    }

    return new Promise((resolve) => {
      const onAuth = (raw: unknown) => {
        try {
          const packet = raw as Packet<boolean>;
          if (packet.status === 200 && packet.data === true) {
            this.status = 'authenticated';
            this.clearAuthTimer();
            resolve(true);
          } else {
            this.status = 'error';
            resolve(false);
          }
        } catch {
          resolve(false);
        }
      };

      this.socket!.once('auth', onAuth);

      // 发送认证事件（Daemon auth_router 直接读 data 字段）
      if (this.socket) {
        this.socket.emit('auth', apiKey);
      }
    });
  }

  /**
   * 发送请求并等待响应（Promise 封装）
   *
   * @param event 事件名，如 "instance/list"
   * @param data  请求数据
   * @param options 请求选项
   */
  async request<T = unknown>(
    event: string,
    data?: unknown,
    options?: { timeout?: number },
  ): Promise<T> {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Not connected to Daemon');
    }

    const timeout = options?.timeout ?? 10000;
    const uuid = this.generateUUID();

    return new Promise<T>((resolve, reject) => {
      let settled = false;

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          this.pendingRequests.delete(uuid);
          reject(new Error(`Request timeout: ${event}`));
        }
      }, timeout);

      this.pendingRequests.set(uuid, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timer,
      });

      // 发送请求包
      const packet: Packet = {
        uuid,
        status: 200,
        event,
        data: data ?? null,
      };
      this.socket!.emit(event, packet);
    });
  }

  /**
   * 订阅持续事件（用于日志流、状态推送）
   * 返回取消订阅的函数
   */
  on<T = unknown>(event: string, handler: (data: T) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    const wrapped = (raw: unknown) => {
      try {
        const packet = raw as Packet<T>;
        handler(packet.data);
      } catch {
        handler(raw as T);
      }
    };

    const listener: EventListener = {
      rawHandler: handler as (data: unknown) => void,
      wrappedHandler: wrapped as (...args: unknown[]) => void,
    };

    this.eventListeners.get(event)!.add(listener);

    if (this.socket) {
      this.socket.on(event, wrapped as (...args: unknown[]) => void);
    }

    // 返回取消订阅函数
    return () => {
      this.off(event, handler);
    };
  }

  /** 取消订阅事件 */
  off<T = unknown>(event: string, handler: (data: T) => void): void {
    const listeners = this.eventListeners.get(event);
    if (!listeners) return;

    for (const l of listeners) {
      if (l.rawHandler === (handler as (data: unknown) => void)) {
        listeners.delete(l);
        if (this.socket) {
          this.socket.off(event, l.wrappedHandler);
        }
        break;
      }
    }

    if (listeners.size === 0) {
      this.eventListeners.delete(event);
    }
  }

  /** 断开连接 */
  disconnect(): void {
    this.clearAuthTimer();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.status = 'disconnected';
    this.pendingRequests.clear();
    this.eventListeners.clear();
  }

  private clearAuthTimer(): void {
    if (this.authTimeoutTimer) {
      clearTimeout(this.authTimeoutTimer);
      this.authTimeoutTimer = null;
    }
  }

  /** 生成简易 UUID v4 */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

// ─── 默认单例 ───────────────────────────────────────
// 应用全局共用一个 DaemonClient 实例

let defaultClient: DaemonClient | null = null;

export function getDaemonClient(): DaemonClient {
  if (!defaultClient) {
    defaultClient = new DaemonClient();
  }
  return defaultClient;
}

export function resetDaemonClient(): void {
  if (defaultClient) {
    defaultClient.disconnect();
    defaultClient = null;
  }
}
