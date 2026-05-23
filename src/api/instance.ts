/**
 * 实例管理 API 函数
 */
import apiClient from './client';
import { ApiResponse } from '@/types/api';
import { InstanceDetail, InstanceItem, InstanceStatus } from '@/types/instance';

/** 获取实例列表 */
export async function fetchInstances(
  daemonId: string,
  page: number = 1,
  pageSize: number = 20,
  status?: InstanceStatus
): Promise<ApiResponse<InstanceItem[]>> {
  const params: Record<string, string | number> = {
    daemonId,
    page,
    page_size: pageSize,
  };

  if (status !== undefined) {
    params.status = status;
  }

  return apiClient.get('/service/remote_service_instances', { params });
}

/** 获取实例详情 */
export async function fetchInstanceDetail(
  uuid: string,
  daemonId: string
): Promise<ApiResponse<InstanceDetail>> {
  return apiClient.get('/instance', {
    params: {
      uuid,
      daemonId,
    },
  });
}

/** 启动实例 */
export async function startInstance(
  uuid: string,
  daemonId: string
): Promise<ApiResponse<null>> {
  return apiClient.get('/protected_instance/open', {
    params: {
      uuid,
      daemonId,
    },
  });
}

/** 停止实例 */
export async function stopInstance(
  uuid: string,
  daemonId: string
): Promise<ApiResponse<null>> {
  return apiClient.get('/protected_instance/stop', {
    params: {
      uuid,
      daemonId,
    },
  });
}

/** 重启实例 */
export async function restartInstance(
  uuid: string,
  daemonId: string
): Promise<ApiResponse<null>> {
  return apiClient.get('/protected_instance/restart', {
    params: {
      uuid,
      daemonId,
    },
  });
}

/** 强制结束实例 */
export async function killInstance(
  uuid: string,
  daemonId: string
): Promise<ApiResponse<null>> {
  return apiClient.get('/protected_instance/kill', {
    params: {
      uuid,
      daemonId,
    },
  });
}

/** 发送命令到实例终端 */
export async function sendCommand(
  uuid: string,
  daemonId: string,
  command: string
): Promise<ApiResponse<null>> {
  return apiClient.get('/protected_instance/command', {
    params: {
      uuid,
      daemonId,
      command,
    },
  });
}

/** 获取实例终端输出日志 */
export async function fetchOutputLog(
  uuid: string,
  daemonId: string,
  size: number = 100
): Promise<ApiResponse<string>> {
  return apiClient.get('/protected_instance/outputlog', {
    params: {
      uuid,
      daemonId,
      size,
    },
  });
}
