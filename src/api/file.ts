/**
 * 文件管理 API —— 基于 Daemon Socket.io 协议
 *
 * 注意：
 *   - 文件列表/读取/写入 走 Socket.io 事件
 *   - 大文件上传/下载 仍走 HTTP（需先通过 Socket.io 获取 mission passport）
 */
import { getDaemonClient } from './client';
import type { Packet } from './client';
import { FileListResponse, FileUploadCredential, FileDownloadCredential } from '@/types/file';

/** 获取文件列表 */
export async function fetchFiles(
  uuid: string,
  path: string = '/',
): Promise<FileListResponse> {
  const client = getDaemonClient();
  return client.request<FileListResponse>('files/list', { uuid, target: path });
}

/** 读取文件内容 */
export async function readFile(
  uuid: string,
  filePath: string,
): Promise<string> {
  const client = getDaemonClient();
  return client.request<string>('files/read', { uuid, target: filePath });
}

/** 写入/编辑文件 */
export async function writeFile(
  uuid: string,
  filePath: string,
  text: string,
): Promise<void> {
  const client = getDaemonClient();
  return client.request<void>('files/write', { uuid, target: filePath, text });
}

/** 删除文件/目录 */
export async function deleteFiles(
  uuid: string,
  targets: string[],
): Promise<void> {
  const client = getDaemonClient();
  return client.request<void>('files/delete', { uuid, targets });
}

/** 创建文件夹 */
export async function createDir(
  uuid: string,
  dirPath: string,
): Promise<void> {
  const client = getDaemonClient();
  return client.request<void>('files/mkdir', { uuid, target: dirPath });
}

/** 新建文件 */
export async function createFile(
  uuid: string,
  filePath: string,
): Promise<void> {
  const client = getDaemonClient();
  return client.request<void>('files/touch', { uuid, target: filePath });
}

/** 复制文件 */
export async function copyFiles(
  uuid: string,
  targets: [string, string][],
): Promise<void> {
  const client = getDaemonClient();
  return client.request<void>('files/copy', { uuid, targets });
}

/** 移动/重命名文件 */
export async function moveFiles(
  uuid: string,
  targets: [string, string][],
): Promise<void> {
  const client = getDaemonClient();
  return client.request<void>('files/move', { uuid, targets });
}

/**
 * 获取文件下载 URL（HTTP 下载仍需 mission passport）
 * 返回可直接用于 fetch 下载的 URL
 */
export async function getDownloadUrl(
  baseUrl: string,
  uuid: string,
  fileName: string,
): Promise<string> {
  const client = getDaemonClient();
  const resp = await client.request<FileDownloadCredential>('files/download', {
    uuid,
    fileName,
  });
  // resp 里应包含 password 和 addr，拼成 HTTP URL
  // 格式：http://daemon-host:port/download/{password}/{fileName}
  const password = resp?.password ?? '';
  if (!password) return '';
  const sep = baseUrl.endsWith('/') ? '' : '/';
  return `${baseUrl}${sep}download/${password}/${fileName}`;
}

/**
 * 获取文件上传凭证（HTTP 上传仍需 mission passport）
 */
export async function getUploadCredential(
  uuid: string,
  uploadDir: string = '/',
): Promise<FileUploadCredential> {
  const client = getDaemonClient();
  return client.request<FileUploadCredential>('files/upload', {
    uuid,
    uploadDir,
  });
}
