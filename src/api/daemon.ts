/**
 * Daemon 连接测试 API
 * 直连模式下不再需要「管理多个 Daemon」，
 * 只需测试与单个 Daemon 的连接是否有效。
 */
import { getDaemonClient } from './client';
import type { Packet } from './client';
import { DaemonInfo } from '@/types/daemon';

/** 测试与 Daemon 的连接（调用 info/overview）*/
export async function testDaemonConnection(): Promise<DaemonInfo> {
  const client = getDaemonClient();
  return client.request<DaemonInfo>('info/overview');
}

/** 获取 Daemon 系统信息（CPU/内存/磁盘等）*/
export async function fetchDaemonInfo(): Promise<DaemonInfo> {
  const client = getDaemonClient();
  return client.request<DaemonInfo>('info/overview');
}
