/**
 * 实例相关类型定义
 */

/** 实例状态枚举（与 MCSManager 后端对齐）*/
export enum InstanceStatus {
  BUSY = -1,      // 忙碌（正在操作）
  STOPPED = 0,     // 已停止
  STOPPING = 1,    // 停止中
  STARTING = 2,     // 启动中
  RUNNING = 3,      // 运行中
}

/** Docker 配置 */
export interface DockerConfig {
  containerName: string;
  image: string;
  memory: number;
  ports: string[];
  extraVolumes: string[];
  networkMode: string;
  cpusetCpus: string;
  cpuUsage: number;
  env: string[];
}

/** 实例配置（InstanceConfig）*/
export interface InstanceConfig {
  nickname: string;
  startCommand: string;
  stopCommand: string;
  cwd: string;
  ie: string;
  oe: string;
  createDatetime: number;
  lastDatetime: number;
  type: string;
  tag: string[];
  endTime: number;
  fileCode: string;
  processType: 'docker' | 'normal';
  docker: DockerConfig;
  enableRcon: boolean;
  rconPassword: string;
  rconPort: number;
  rconIp: string;
  terminalOption: {
    haveColor: boolean;
    pty: boolean;
  };
  eventTask: {
    autoStart: boolean;
    autoRestart: boolean;
    ignore: boolean;
  };
  pingConfig: {
    ip: string;
    port: number;
    type: number;
  };
}

/** 实例进程信息 */
export interface InstanceProcessInfo {
  cpu: number;       // CPU 使用率（百分比）
  memory: number;    // 内存使用（MB）
  ppid: number;
  pid: number;
  ctime: number;     // 进程创建时间（时间戳 ms）
  elpased: number;   // 运行时长（秒）
  timestamp: number;
}

/** 实例详细信息（InstanceDetail）*/
export interface InstanceDetail {
  instanceUuid: string;
  daemonId: string;
  config: InstanceConfig;
  info: {
    currentPlayers: number;
    maxPlayers: number;
    version: string;
    openFrpStatus: boolean;
  };
  processInfo: InstanceProcessInfo;
  space: number;     // 磁盘占用（MB）
  started: number;    // 累计启动次数
  status: InstanceStatus;
}

/** 实例列表项（简化版）*/
export interface InstanceItem {
  instanceUuid: string;
  daemonId: string;
  config: {
    nickname: string;
    type: string;
  };
  status: InstanceStatus;
}
