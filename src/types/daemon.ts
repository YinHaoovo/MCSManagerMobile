/**
 * 节点/守护进程相关类型定义
 */

/** 节点/守护进程信息 */
export interface DaemonInfo {
  uuid: string;
  ip: string;
  port: number;
  remarks: string;
  available: boolean;
  version?: string;
  system?: {
    type: string;
    hostname: string;
    platform: string;
    release: string;
    uptime: number;
    freemem: number;
    totalmem: number;
    cpuUsage: number;
    memUsage: number;
  };
  process?: {
    cpu: number;
    memory: number;
  };
  instance?: {
    running: number;
    total: number;
  };
}

/** 节点列表响应 */
export interface DaemonListResponse {
  instances: DaemonInfo[];
}

/** 添加节点请求 */
export interface AddDaemonRequest {
  ip: string;
  port: number;
  prefix: string;
  remarks: string;
  apiKey: string;
}

/** 更新节点请求 */
export interface UpdateDaemonRequest {
  ip?: string;
  port?: number;
  available?: boolean;
  remarks?: string;
}
