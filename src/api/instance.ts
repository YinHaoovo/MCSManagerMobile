/**
 * 实例管理 API —— 基于 Daemon Socket.io 协议
 * 事件名与 Daemon instance_router / instance_event_router 对齐
 */
import { getDaemonClient } from './client';
import type { Packet } from './client';
import { InstanceDetail, InstanceItem, InstanceStatus } from '@/types/instance';

/** 获取实例列表（直连模式无需 daemonId）*/
export async function fetchInstances(): Promise<InstanceItem[]> {
  const client = getDaemonClient();
  return client.request<InstanceItem[]>('instance/list');
}

/** 获取实例详情 */
export async function fetchInstanceDetail(
  uuid: string,
): Promise<InstanceDetail> {
  const client = getDaemonClient();
  return client.request<InstanceDetail>('instance/info', { uuid });
}

/** 启动实例 */
export async function startInstance(
  uuid: string,
): Promise<void> {
  const client = getDaemonClient();
  return client.request<void>('instance/open', { uuid });
}

/** 停止实例 */
export async function stopInstance(
  uuid: string,
): Promise<void> {
  const client = getDaemonClient();
  return client.request<void>('instance/stop', { uuid });
}

/** 重启实例 */
export async function restartInstance(
  uuid: string,
): Promise<void> {
  const client = getDaemonClient();
  return client.request<void>('instance/restart', { uuid });
}

/** 强制结束实例 */
export async function killInstance(
  uuid: string,
): Promise<void> {
  const client = getDaemonClient();
  return client.request<void>('instance/kill', { uuid });
}

/** 发送命令到实例终端 */
export async function sendCommand(
  uuid: string,
  command: string,
): Promise<void> {
  const client = getDaemonClient();
  return client.request<void>('instance/command', { uuid, command });
}

/** 获取实例终端输出日志（一次性拉取）*/
export async function fetchOutputLog(
  uuid: string,
  size: number = 100,
): Promise<string> {
  const client = getDaemonClient();
  return client.request<string>('instance/outputlog', { uuid, size });
}

/**
 * 订阅实例日志流（持续接收）
 * 返回取消订阅函数
 */
export function subscribeInstanceLog(
  uuid: string,
  onData: (log: string) => void,
): () => void {
  const client = getDaemonClient();

  const handler = (data: string) => {
    onData(data);
  };

  client.on<string>('instance/log', handler);

  // 通知 Daemon 开始推送日志
  client.request('instance/log/start', { uuid }).catch(() => {});

  // 返回取消订阅函数
  return () => {
    client.request('instance/log/stop', { uuid }).catch(() => {});
    client.off('instance/log', handler);
  };
}

/**
 * 订阅实例状态变化
 * 返回取消订阅函数
 */
export function subscribeInstanceStatus(
  onStatus: (data: { uuid: string; status: number }) => void,
): () => void {
  const client = getDaemonClient();

  const handler = (data: { uuid: string; status: number }) => {
    onStatus(data);
  };

  client.on<{ uuid: string; status: number }>('instance/status', handler);

  return () => client.off('instance/status', handler);
}
