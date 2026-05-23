/**
 * 文件管理 API（多 Daemon 支持）
 * 所有函数第一个参数为 daemonId
 * 注意：文件上传/下载使用 HTTP（需先通过 Socket.io 获取 mission passport）
 */
import { request } from './client';
import type { FileItem, FileDownloadCredential, FileUploadCredential } from '@/types/file';
import type { RequestOptions } from '@/types/api';

/** 请求选项 */
interface FileRequestOptions extends RequestOptions {
  /** 超时（毫秒），默认 30000 */
  timeout?: number;
}

/**
 * 获取文件列表
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 * @param path      目录路径（绝对路径）
 * @returns         FileItem[]
 */
export async function fetchFiles(
  daemonId: string,
  uuid: string,
  path: string,
): Promise<FileItem[]> {
  return request<FileItem[]>(daemonId, 'files/list', { uuid, path });
}

/**
 * 创建目录
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 * @param path      目录路径（绝对路径）
 * @param dirName   新目录名
 */
export async function createDirectory(
  daemonId: string,
  uuid: string,
  path: string,
  dirName: string,
): Promise<void> {
  await request<void>(daemonId, 'files/mkdir', { uuid, path, dirName });
}

/**
 * 删除文件/目录
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 * @param paths     要删除的路径数组（绝对路径）
 */
export async function deleteFiles(
  daemonId: string,
  uuid: string,
  paths: string[],
): Promise<void> {
  await request<void>(daemonId, 'files/delete', { uuid, paths });
}

/**
 * 解压文件
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 * @param path      压缩包路径（绝对路径）
 * @param targetDir 解压目标目录（绝对路径）
 */
export async function unzipFile(
  daemonId: string,
  uuid: string,
  path: string,
  targetDir: string,
): Promise<void> {
  await request<void>(daemonId, 'files/unzip', { uuid, path, targetDir });
}

/**
 * 读取文件内容
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 * @param path      文件路径（绝对路径）
 * @returns         文件内容（字符串）
 */
export async function readFile(
  daemonId: string,
  uuid: string,
  path: string,
): Promise<string> {
  return request<string>(daemonId, 'files/read', { uuid, path });
}

/**
 * 写入文件内容
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 * @param path      文件路径（绝对路径）
 * @param content   文件内容
 */
export async function writeFile(
  daemonId: string,
  uuid: string,
  path: string,
  content: string,
): Promise<void> {
  await request<void>(daemonId, 'files/write', { uuid, path, content });
}

/**
 * 获取文件下载凭证（用于 HTTP 下载）
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 * @param fileName  文件名
 * @returns         FileDownloadCredential { password, addr }
 */
export async function getDownloadCredential(
  daemonId: string,
  uuid: string,
  fileName: string,
): Promise<FileDownloadCredential> {
  return request<FileDownloadCredential>(daemonId, 'files/download', { uuid, fileName });
}

/**
 * 获取文件上传凭证（用于 HTTP 上传）
 * @param daemonId  Daemon 唯一 ID
 * @param uuid      实例 UUID
 * @param path      目标目录路径（绝对路径）
 * @returns         FileUploadCredential { password, addr }
 */
export async function getUploadCredential(
  daemonId: string,
  uuid: string,
  path: string,
): Promise<FileUploadCredential> {
  return request<FileUploadCredential>(daemonId, 'files/upload', { uuid, path });
}

/**
 * 获取文件下载 URL（HTTP 下载仍需 mission passport）
 * 返回可直接用于 fetch 下载的 URL
 * @param daemonId  Daemon 唯一 ID
 * @param baseUrl   Daemon Base URL（用于拼装 HTTP URL）
 * @param uuid      实例 UUID
 * @param fileName  文件名
 * @returns         完整的 HTTP 下载 URL
 */
export async function getDownloadUrl(
  daemonId: string,
  baseUrl: string,
  uuid: string,
  fileName: string,
): Promise<string> {
  const resp = await getDownloadCredential(daemonId, uuid, fileName);
  // resp 里应包含 password 和 addr，拼成 HTTP URL
  // 格式：http://daemon-host:port/download/{password}/{fileName}
  const password = resp?.password ?? '';
  if (!password) return '';
  const sep = baseUrl.endsWith('/') ? '' : '/';
  return `${baseUrl}${sep}download/${password}/${fileName}`;
}

/**
 * 获取 Daemon Base URL（用于拼装 HTTP 上传/下载 URL）
 * 注意：这个函数需要从某个地方获取 Daemon URL（可能从 useAuthStore）
 * 这里先留空，由调用者传入
 * @param daemonId  Daemon 唯一 ID
 * @returns         Daemon Base URL
 */
export function getDaemonBaseUrl(daemonId: string): string {
  // 从 useAuthStore 获取 Daemon URL
  // 这里返回一个占位符，实际使用时需要传入
  return '';
}
