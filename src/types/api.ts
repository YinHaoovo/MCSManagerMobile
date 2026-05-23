/**
 * API 通用响应类型
 */

/** 通用 API 响应格式 */
export interface ApiResponse<T = unknown> {
  /** 200=成功, 400=参数错误, 403=权限不足, 500=内部错误 */
  status: number;
  /** 业务数据 */
  data: T;
  /** 响应时间戳（毫秒） */
  time: number;
}

/** API 错误类型 */
export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}
