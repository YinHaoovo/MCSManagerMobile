/**
 * API 模块通用类型
 */

/** 分页请求参数 */
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

/** 通用请求参数 */
export interface BaseRequestParams {
  daemonId?: string;
  uuid?: string;
}

/** 实例状态过滤 */
export interface InstanceListParams extends BaseRequestParams, PaginationParams {
  status?: number;
}

/** 文件列表请求参数 */
export interface FileListParams extends BaseRequestParams {
  target?: string;
  page?: number;
  page_size?: number;
}
