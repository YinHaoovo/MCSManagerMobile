/**
 * 文件管理相关类型定义
 */

/** 文件/文件夹条目 */
export interface FileItem {
  name: string;
  size: number;    // 字节，文件夹为 0
  time: string;    // 文件修改时间字符串
  mode: number;    // Linux 文件权限（如 777）
  type: 0 | 1;   // 0=文件夹, 1=文件
}

/** 文件列表响应 */
export interface FileListResponse {
  items: FileItem[];
  page: number;
  pageSize: number;
  total: number;
  absolutePath: string;
}

/** 文件操作请求 */
export interface FileDeleteRequest {
  targets: string[];
}

/** 文件读取请求 */
export interface FileReadRequest {
  target: string;
}

/** 文件写入请求 */
export interface FileWriteRequest {
  target: string;
  text: string;
}

/** 创建目录请求 */
export interface CreateDirRequest {
  target: string;
}

/** 创建文件请求 */
export interface CreateFileRequest {
  target: string;
}

/** 文件上传凭证响应 */
export interface FileUploadCredential {
  password: string;
  addr: string;
}

/** 文件下载凭证响应 */
export interface FileDownloadCredential {
  password: string;
  addr: string;
}
