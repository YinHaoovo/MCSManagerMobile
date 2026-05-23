/**
 * Axios 实例 + 请求拦截器
 * 所有请求自动附加 apikey + X-Requested-With Header
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { ApiResponse } from '@/types/api';

/** 创建 Axios 实例 */
const apiClient: AxiosInstance = axios.create({
  timeout: 10000, // 10 秒超时
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

/** 请求拦截器：自动附加认证参数 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const { panelURL, apiKey } = useAuthStore.getState();

    // 设置 baseURL
    if (panelURL) {
      config.baseURL = `${panelURL}/api`;
    }

    // 附加 apikey 到 URL 参数
    config.params = {
      ...config.params,
      apikey: apiKey,
    };

    // 必须 Header（用 Object.assign 保留 AxiosHeaders 方法）
    Object.assign(config.headers, {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json; charset=utf-8',
    });

    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

/** 响应拦截器：检查业务状态 */
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>): AxiosResponse['data'] => {
    const body: ApiResponse = response.data;

    // 检查 MCSManager 业务错误（status ≠ 200）
    if (body.status !== 200) {
      return Promise.reject(new Error(`API Error: ${body.status}`));
    }

    // 只返回 data 部分
    return response.data;
  },
  (error: unknown) => {
    // HTTP 层错误（网络/超时/认证失败）
    if (axios.isAxiosError(error)) {
      const status: number | undefined = error.response?.status;

      if (status === 401 || status === 403) {
        // Token 失效，跳转登录页
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
