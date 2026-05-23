/**
 * 实例管理 API（多 Daemon 支持）
 * 所有函数第一个参数为 daemonId
 */
import { request, on as socketOn, off as socketOff } from './client';
import type { Instance, InstanceDetail, ProcessInfo, RequestOptions } from '@/types/instance';

/** 请求选项 */
interface InstanceRequestOptions extends RequestOptions {
  /** 超时（毫秒），默认 10000 */
  timeout?: number;
}

/**
 * 获取实例列表
 * @param daemonId  Daemon 唯一 ID
 * @returns         Instance[]
 */
export async function fetchInstances(daemonId: string): Promise<Instance[]> {
  return request<Instance[]>(daemonId, 'instance/list');
}

/**
 * 获取实例详情
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 * @returns         InstanceDetail
 */
export async function fetchInstanceDetail(daemonId: string, uuid: string): Promise<InstanceDetail> {
  return request<InstanceDetail>(daemonId, 'instance/detail', { uuid });
}

/**
 * 启动实例
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 */
export async function startInstance(daemonId: string, uuid: string): Promise<void> {
  await request<void>(daemonId, 'instance/start', { uuid });
}

/**
 * 停止实例
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 */
export async function stopInstance(daemonId: string, uuid: string): Promise<void> {
  await request<void>(daemonId, 'instance/stop', { uuid });
}

/**
 * 重启实例
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 */
export async function restartInstance(daemonId: string, uuid: string): Promise<void> {
  await request<void>(daemonId, 'instance/restart', { uuid });
}

/**
 * 强制结束实例（Kill）
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 */
export async function killInstance(daemonId: string, uuid: string): Promise<void> {
  await request<void>(daemonId, 'instance/kill', { uuid });
}

/**
 * 发送命令到实例终端
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 * @param command   命令字符串
 */
export async function sendCommand(daemonId: string, uuid: string, command: string): Promise<void> {
  await request<void>(daemonId, 'instance/command', { uuid, command });
}

/**
 * 获取实例日志（历史日志，非流式）
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 * @param options   请求选项
 * @returns         日志字符串
 */
export async function fetchLogs(
  daemonId: string,
  uuid: string,
  options?: InstanceRequestOptions,
): Promise<string> {
  return request<string>(daemonId, 'instance/log', { uuid }, options);
}

/**
 * 监听实例日志流（实时）
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 * @param onData    数据回调
 * @returns         取消监听函数
 */
export function subscribeInstanceLog(
  daemonId: string,
  uuid: string,
  onData: (data: string) => void,
): () => void {
  const event = `instance/log/${uuid}`;
  
  // 监听日志事件
  socketOn<string>(daemonId, event, onData as any);

  // 发送订阅请求
  request<void>(daemonId, 'instance/log/subscribe', { uuid })
    .catch((err) => console.error('[instance] subscribe log failed:', err));

  // 返回取消监听函数
  return () => {
    socketOff(daemonId, event, onData as any);
    request<void>(daemonId, 'instance/log/unsubscribe', { uuid })
      .catch((err) => console.error('[instance] unsubscribe log failed:', err));
  };
}

/**
 * 监听实例状态更新
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 * @param onStatus  状态回调
 * @returns         取消监听函数
 */
export function subscribeInstanceStatus(
  daemonId: string,
  uuid: string,
  onStatus: (status: ProcessInfo) => void,
): () => void {
  const event = `instance/status/${uuid}`;
  
  // 监听状态事件
  socketOn<ProcessInfo>(daemonId, event, onStatus as any);

  // 发送订阅请求
  request<void>(daemonId, 'instance/status/subscribe', { uuid })
    .catch((err) => console.error('[instance] subscribe status failed:', err));

  // 返回取消监听函数
  return () => {
    socketOff(daemonId, event, onStatus as any);
    request<void>(daemonId, 'instance/status/unsubscribe', { uuid })
      .catch((err) => console.error('[instance] unsubscribe status failed:', err));
  };
}

/**
 * 获取实例进程信息
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 * @returns         ProcessInfo
 */
export async function fetchProcessInfo(daemonId: string, uuid: string): Promise<ProcessInfo> {
  return request<ProcessInfo>(daemonId, 'instance/process', { uuid });
}
