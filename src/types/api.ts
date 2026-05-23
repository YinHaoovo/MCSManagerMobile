/**
 * API 通用响应类型
 */

/** Socket.io 通信数据包格式（IPacket） */
export interface Packet<T = unknown> {
  /** 请求唯一 ID（UUID v4） */
  uuid: string;
  /** 200=成功, 500=错误 */
  status: number;
  /** 事件名（如 "instance/list", "info/overview"） */
  event: string;
  /** 业务数据 */
  data: T;
}

/** 请求选项 */
export interface RequestOptions {
  /** 超时（毫秒），默认 10000 */
  timeout?: number;
}

/** 通用 API 响应格式（REST API） */
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

/** Daemon 系统信息（来自 info/overview） */
export interface DaemonInfo {
  /** 版本号 */
  version: string;
  /** 系统平台（linux/darwin/win32） */
  platform: string;
  /** 系统架构（amd64/arm64） */
  arch: string;
  /** 总内存（MB） */
  totalMemory: number;
  /** 已用内存（MB） */
  usedMemory: number;
  /** 总磁盘（MB） */
  totalDisk: number;
  /** 已用磁盘（MB） */
  usedDisk: number;
  /** CPU 型号 */
  cpuModel: string;
  /** CPU 核心数 */
  cpuCores: number;
}
