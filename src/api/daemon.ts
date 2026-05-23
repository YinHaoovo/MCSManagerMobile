/**
 * 节点管理 API 函数
 */
import apiClient from './client';
import { ApiResponse } from '@/types/api';
import { DaemonInfo, DaemonListResponse, AddDaemonRequest, UpdateDaemonRequest } from '@/types/daemon';

/** 获取节点列表 */
export async function fetchDaemons(): Promise<ApiResponse<DaemonListResponse>> {
  return apiClient.get('/service/remote_services_system');
}

/** 添加节点 */
export async function addDaemon(data: AddDaemonRequest): Promise<ApiResponse<DaemonInfo>> {
  return apiClient.post('/service/remote_service', data);
}

/** 删除节点 */
export async function deleteDaemon(daemonId: string): Promise<ApiResponse<null>> {
  return apiClient.delete(`/service/remote_service?uuid=${daemonId}`);
}

/** 连接节点 */
export async function linkDaemon(daemonId: string): Promise<ApiResponse<null>> {
  return apiClient.get(`/service/link_remote_service?uuid=${daemonId}`);
}

/** 更新节点 */
export async function updateDaemon(
  daemonId: string,
  data: UpdateDaemonRequest
): Promise<ApiResponse<DaemonInfo>> {
  return apiClient.put(`/service/remote_service?uuid=${daemonId}`, data);
}
