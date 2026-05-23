/**
 * Daemon 信息 API（多 Daemon 支持）
 * 获取 Daemon 系统信息（CPU/内存/磁盘等）
 */
import { request } from './client';
import type { DaemonInfo } from '@/types/api';

/**
 * 获取指定 Daemon 的系统信息
 * @param daemonId  Daemon 唯一 ID
 * @returns         DaemonInfo
 */
export async function fetchDaemonInfo(daemonId: string): Promise<DaemonInfo> {
  return request<DaemonInfo>(daemonId, 'info/overview');
}

/**
 * 测试 Daemon 连接（不保存到连接池）
 * @param url      Daemon URL
 * @param apiKey   API Key（可选）
 * @returns        { success: boolean; requireAuth: boolean; info?: DaemonInfo }
 */
export async function testDaemonConnection(
  url: string,
  apiKey?: string,
): Promise<{ success: boolean; requireAuth: boolean; info?: DaemonInfo }> {
  // 使用临时 daemonId 进行测试
  const tempId = `__test_${Date.now()}`;
  
  try {
    // 导入 connectDaemon 进行连接测试
    const { connectDaemon } = await import('./auth');
    const result = await connectDaemon(tempId, url, apiKey);
    
    // 测试完成后断开
    if (result.success || result.requireAuth) {
      const { disconnectDaemon } = await import('./client');
      disconnectDaemon(tempId);
    }
    
    return result;
  } catch (error) {
    console.error('[daemon] test connection failed:', error);
    return { success: false, requireAuth: false };
  }
}
