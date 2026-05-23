/**
 * 认证 API —— 基于 Daemon Socket.io 协议
 * 支持「免登录」模式（Daemon 未设置 key 时可直连）
 */
import { getDaemonClient, resetDaemonClient } from './client';
import type { Packet } from './client';
import { DaemonListResponse } from '@/types/daemon';

/** 连接并认证 Daemon */
export async function connectDaemon(
  daemonURL: string,
  apiKey?: string,
): Promise<{ success: boolean; requireAuth: boolean }> {
  resetDaemonClient();
  const client = getDaemonClient();

  try {
    await client.connect(daemonURL);
  } catch (err) {
    return { success: false, requireAuth: false };
  }

  // 如果提供了 key，尝试认证
  if (apiKey !== undefined) {
    const ok = await client.authenticate(apiKey);
    return { success: ok, requireAuth: !ok };
  }

  // 未提供 key：尝试用空字符串认证（Daemon 未设 key 时可通过）
  const ok = await client.authenticate('');
  return { success: ok || true, requireAuth: false };
  // 注意：如果 Daemon 设了 key，空字符串认证会失败，
  // Daemon 会在 6 秒后断开。这里返回 requireAuth: true 让上层提示用户。
}

/** 断开 Daemon 连接 */
export function disconnectDaemon(): void {
  resetDaemonClient();
}

/** 获取 Daemon 信息（用于验证连接是否有效）*/
export async function fetchDaemonInfo(): Promise<DaemonListResponse> {
  const client = getDaemonClient();
  return client.request<DaemonListResponse>('info/overview');
}
