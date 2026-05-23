/**
 * 认证 API 函数
 */
import apiClient from './client';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '@/types/api';
import { DaemonListResponse } from '@/types/daemon';

/** 验证 API Key（通过获取节点列表来测试凭据）*/
export async function verifyAuth(panelURL: string, apiKey: string): Promise<boolean> {
  try {
    const url: string = `${panelURL}/api/service/remote_services_system`;
    const response: AxiosResponse<ApiResponse<DaemonListResponse>> = await apiClient.get(
      '/service/remote_services_system',
      {
        baseURL: `${panelURL}/api`,
        params: {
          apikey: apiKey,
        },
      }
    );

    return response.data.status === 200;
  } catch (error) {
    console.error('Auth verification failed:', error);
    return false;
  }
}

/** 获取节点列表（用于验证凭据）*/
export async function fetchDaemonsForAuth(): Promise<ApiResponse<DaemonListResponse>> {
  return apiClient.get('/service/remote_services_system');
}
