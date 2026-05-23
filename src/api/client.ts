/**
 * Socket.io 客户端（多 Daemon 支持）
 * 每个 Daemon 一个 Socket.io 连接，通过 daemonId 索引
 */
import { io, type Socket } from 'socket.io-client';
import type { Packet, RequestOptions } from '@/types/api';

/** 等待响应的请求记录 */
interface PendingRequest<T = unknown> {
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
}

/** 全局连接池：daemonId → Socket 实例 */
const connections: Map<string, Socket> = new Map();

/** 全局待处理请求池：uuid → PendingRequest */
const pendingRequests: Map<string, PendingRequest> = new Map();

/** 全局事件监听器：daemonId → event → Set<handler> */
const eventListeners: Map<string, Map<string, Set<(data: unknown) => void>>> = new Map();

/**
 * 连接到 Daemon（每个 Daemon 一个 Socket.io 连接）
 * @param daemonId  Daemon 唯一 ID
 * @param url       Daemon URL (e.g., http://192.168.1.100:24444)
 * @param apiKey    API Key（可选，未设时尝试空字符串）
 * @returns Promise<{ success: boolean; requireAuth: boolean; info?: any }>
 */
export async function connectDaemon(
  daemonId: string,
  url: string,
  apiKey?: string,
): Promise<{ success: boolean; requireAuth: boolean; info?: any }> {
  return new Promise((resolve) => {
    // 如果已存在连接，先断开
    if (connections.has(daemonId)) {
      disconnectDaemon(daemonId);
    }

    const socket: Socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    let resolved = false;

    // 全局响应监听：匹配请求/响应
    socket.onAny((eventName, raw) => {
      const packet = raw as Packet;
      if (!packet.uuid) return;

      const req = pendingRequests.get(packet.uuid);
      if (!req) return;

      clearTimeout(req.timer);
      pendingRequests.delete(packet.uuid);

      if (packet.status === 200) {
        req.resolve(packet.data);
      } else {
        req.reject(new Error(`Daemon Error: ${packet.data}`));
      }
    });

    // 连接成功
    socket.on('connect', () => {
      console.log(`[DaemonClient] Connected to daemon ${daemonId}: ${url}`);

      // 立即发送认证（Daemon 要求在 6 秒内认证）
      const authData = apiKey ? { key: apiKey } : { key: '' };
      console.log(`[DaemonClient] Sending auth to ${daemonId}`, authData);
      socket.emit('auth', authData);
    });

    // 认证成功
    socket.on('auth:success', (data) => {
      console.log(`[DaemonClient] Auth success for daemon ${daemonId}:`, data);
      if (!resolved) {
        resolved = true;
        connections.set(daemonId, socket);
        resolve({ success: true, requireAuth: false, info: data });
      }
    });

    // 认证失败
    socket.on('auth:fail', (data) => {
      console.error(`[DaemonClient] Auth failed for daemon ${daemonId}:`, data);
      if (!resolved) {
        resolved = true;
        socket.disconnect();
        resolve({ success: false, requireAuth: true });
      }
    });

    // 连接错误
    socket.on('connect_error', (error) => {
      console.error(`[DaemonClient] Connection error for daemon ${daemonId}:`, error.message);
      console.error(`[DaemonClient] Please check:
        1. Daemon URL is correct (e.g., http://192.168.1.100:24444)
        2. Daemon is running and accessible
        3. Firewall allows connection to port 24444
        4. API Key is correct (if required)
      `);
      if (!resolved) {
        resolved = true;
        resolve({ success: false, requireAuth: false });
      }
    });

    // 断开连接
    socket.on('disconnect', (reason) => {
      console.log(`[DaemonClient] Disconnected from daemon ${daemonId}:`, reason);
    });

    // 超时处理
    setTimeout(() => {
      if (!resolved) {
        console.error(`[DaemonClient] Connection timeout for daemon ${daemonId}`);
        resolved = true;
        socket.disconnect();
        resolve({ success: false, requireAuth: false });
      }
    }, 10000);
  });
}

/**
 * 断开指定 Daemon 的连接
 * @param daemonId  Daemon 唯一 ID
 */
export function disconnectDaemon(daemonId: string): void {
  const socket = connections.get(daemonId);
  if (socket) {
    socket.disconnect();
    connections.delete(daemonId);
  }

  // 清理事件监听器
  eventListeners.delete(daemonId);
}

/**
 * 获取指定 Daemon 的 Socket 实例
 * @param daemonId  Daemon 唯一 ID
 * @returns Socket 实例，未连接时返回 undefined
 */
export function getDaemonClient(daemonId: string): Socket | undefined {
  return connections.get(daemonId);
}

/**
 * 向指定 Daemon 发送请求（Promise 封装）
 * @param daemonId  Daemon 唯一 ID
 * @param event     事件名（如 "instance/list", "info/overview"）
 * @param data      请求数据（可选）
 * @param options   请求选项（可选）
 * @returns         Promise<T> 解析为响应数据
 */
export async function request<T = unknown>(
  daemonId: string,
  event: string,
  data?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const socket = connections.get(daemonId);
  if (!socket?.connected) {
    throw new Error(`Daemon ${daemonId} not connected`);
  }

  const uuid: string = generateUUID();
  const packet: Packet = {
    uuid,
    status: 200,
    event,
    data: data ?? null,
  };

  // 创建待处理请求记录
  const promise = new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingRequests.delete(uuid);
      reject(new Error(`Request timeout: ${event}`));
    }, options.timeout ?? 10000);

    pendingRequests.set(uuid, { resolve, reject, timer } as any);
  });

  // 发送请求
  socket.emit(event, packet);

  return promise;
}

/**
 * 监听指定 Daemon 的事件（用于日志流、状态更新等）
 * @param daemonId  Daemon 唯一 ID
 * @param event     事件名
 * @param handler   事件处理函数
 */
export function on<T = unknown>(
  daemonId: string,
  event: string,
  handler: (data: T) => void,
): void {
  const socket = connections.get(daemonId);
  if (!socket) {
    console.warn(`[DaemonClient] Cannot listen to ${event}: daemon ${daemonId} not connected`);
    return;
  }

  // 保存监听器引用，方便后续 off
  const wrappedHandler = (raw: unknown) => {
    const packet = raw as Packet;
    handler(packet.data as T);
  };

  socket.on(event, wrappedHandler);

  // 保存到事件监听器池
  if (!eventListeners.has(daemonId)) {
    eventListeners.set(daemonId, new Map());
  }
  const daemonListeners = eventListeners.get(daemonId)!;
  if (!daemonListeners.has(event)) {
    daemonListeners.set(event, new Set());
  }
  daemonListeners.get(event)!.add(wrappedHandler);
}

/**
 * 取消监听指定 Daemon 的事件
 * @param daemonId  Daemon 唯一 ID
 * @param event     事件名
 * @param handler   事件处理函数（可选，不传则取消该事件的所有监听器）
 */
export function off(
  daemonId: string,
  event: string,
  handler?: (data: unknown) => void,
): void {
  const socket = connections.get(daemonId);
  if (!socket) return;

  if (handler) {
    // 取消指定监听器
    const daemonListeners = eventListeners.get(daemonId);
    const eventListenersSet = daemonListeners?.get(event);
    if (eventListenersSet) {
      // 找到 wrappedHandler 并移除
      for (const wrapped of eventListenersSet) {
        socket.off(event, wrapped);
      }
      eventListenersSet.clear();
    }
  } else {
    // 取消该事件的所有监听器
    socket.off(event);
    const daemonListeners = eventListeners.get(daemonId);
    daemonListeners?.delete(event);
  }
}

/**
 * 检查指定 Daemon 是否已连接
 * @param daemonId  Daemon 唯一 ID
 * @returns 是否已连接
 */
export function isConnected(daemonId: string): boolean {
  return connections.get(daemonId)?.connected ?? false;
}

/**
 * 断开所有 Daemon 连接
 */
export function disconnectAll(): void {
  for (const daemonId of connections.keys()) {
    disconnectDaemon(daemonId);
  }
}

/** 生成 UUID v4 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
