/**
 * 认证相关 API（多 Daemon 支持）
 * 连接到 Daemon 并进行认证
 */
import { connectDaemon as socketConnect, disconnectDaemon as socketDisconnect, request } from './client';
import type { DaemonInfo, RequestOptions } from '@/types/api';

export { type DaemonInfo } from '@/types/api';

/** 连接选项 */
interface ConnectOptions extends RequestOptions {
  /** 连接超时（毫秒），默认 10000 */
  timeout?: number;
}

/**
 * 连接到 Daemon（建立 Socket.io 连接并认证）
 * @param daemonId  Daemon 唯一 ID
 * @param url       Daemon URL
 * @param apiKey    API Key（可选，未设时尝试空字符串）
 * @param options   连接选项
 * @returns         { success: boolean; requireAuth: boolean; info?: DaemonInfo }
 */
export async function connectDaemon(
  daemonId: string,
  url: string,
  apiKey?: string,
  options?: ConnectOptions,
): Promise<{ success: boolean; requireAuth: boolean; info?: DaemonInfo }> {
  try {
    // 1. 建立 Socket.io 连接（会在 connect 事件中自动发送 auth）
    const socket = socketConnect(daemonId, url, apiKey);

    // 2. 等待连接成功（或失败）
    const connected = await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, options?.timeout ?? 10000);

      socket.once('connect', () => {
        clearTimeout(timeout);
        resolve(true);
      });

      socket.once('connect_error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });

    if (!connected) {
      return { success: false, requireAuth: false };
    }

    // 3. 等待认证结果（Daemon 会在 auth 成功后发送 welcome 事件？或者我们直接请求 info/overview 测试）
    // 简单方案：直接请求 info/overview，如果成功则说明认证通过
    try {
      const info = await fetchDaemonInfo(daemonId);
      return { success: true, requireAuth: false, info };
    } catch (error) {
      // 如果请求失败，可能是 API Key 错误
      return { success: false, requireAuth: true };
    }
  } catch (error) {
    console.error('[auth] connectDaemon failed:', error);
    return { success: false, requireAuth: false };
  }
}

/**
 * 断开指定 Daemon 的连接
 * @param daemonId  Daemon 唯一 ID
 */
export function disconnectDaemon(daemonId: string): void {
  socketDisconnect(daemonId);
}

/**
 * 获取 Daemon 系统信息
 * @param daemonId  Daemon 唯一 ID
 * @returns         DaemonInfo
 */
export async function fetchDaemonInfo(daemonId: string): Promise<DaemonInfo> {
  return request<DaemonInfo>(daemonId, 'info/overview');
}

/**
 * 测试 Daemon 连接（不保存）
 * @param url      Daemon URL
 * @param apiKey   API Key（可选）
 * @returns        { success: boolean; requireAuth: boolean; info?: DaemonInfo }
 */
export async function testDaemonConnection(
  url: string,
  apiKey?: string,
): Promise<{ success: boolean; requireAuth: boolean; info?: DaemonInfo }> {
  // 使用一个临时 daemonId 进行测试
  const tempId = `__test_${Date.now()}`;
  const result = await connectDaemon(tempId, url, apiKey);
  
  // 测试完成后断开
  if (result.success || result.requireAuth) {
    disconnectDaemon(tempId);
  }

  return result;
}
