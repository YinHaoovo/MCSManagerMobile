/**
 * 玩家相关类型定义（预留）
 */

/** 在线玩家信息 */
export interface PlayerInfo {
  name: string;
  uuid: string;
  onlineTime: number;  // 在线时长（秒）
  ip: string;
}

/** 玩家列表响应 */
export interface PlayerListResponse {
  players: PlayerInfo[];
  total: number;
}

/** 封禁玩家请求 */
export interface BanPlayerRequest {
  uuid: string;
  reason?: string;
}

/** 解封玩家请求 */
export interface UnbanPlayerRequest {
  uuid: string;
}
