/**
 * 文件管理 API 函数
 */
import apiClient from './client';
import { ApiResponse } from '@/types/api';
import { FileListResponse, FileUploadCredential, FileDownloadCredential } from '@/types/file';

/** 获取文件列表 */
export async function fetchFiles(
  daemonId: string,
  uuid: string,
  path: string = '/',
  page: number = 1,
  pageSize: number = 100
): Promise<ApiResponse<FileListResponse>> {
  return apiClient.get('/files/list', {
    params: {
      daemonId,
      uuid,
      target: path,
      page,
      page_size: pageSize,
    },
  });
}

/** 读取文件内容 */
export async function readFile(
  daemonId: string,
  uuid: string,
  path: string
): Promise<ApiResponse<string>> {
  return apiClient.put('/files', {
    daemonId,
    uuid,
    target: path,
  });
}

/** 写入/编辑文件 */
export async function writeFile(
  daemonId: string,
  uuid: string,
  path: string,
  text: string
): Promise<ApiResponse<null>> {
  return apiClient.put('/files', {
    daemonId,
    uuid,
    target: path,
    text,
  });
}

/** 删除文件 */
export async function deleteFiles(
  daemonId: string,
  uuid: string,
  targets: string[]
): Promise<ApiResponse<null>> {
  return apiClient.delete('/files', {
    params: {
      daemonId,
      uuid,
    },
    data: {
      targets,
    },
  });
}

/** 创建文件夹 */
export async function createDir(
  daemonId: string,
  uuid: string,
  path: string
): Promise<ApiResponse<null>> {
  return apiClient.post('/files/mkdir', {
    daemonId,
    uuid,
    target: path,
  });
}

/** 新建文件 */
export async function createFile(
  daemonId: string,
  uuid: string,
  path: string
): Promise<ApiResponse<null>> {
  return apiClient.post('/files/touch', {
    daemonId,
    uuid,
    target: path,
  });
}

/** 获取文件下载凭证 */
export async function getDownloadCredential(
  daemonId: string,
  uuid: string,
  fileName: string
): Promise<ApiResponse<FileDownloadCredential>> {
  return apiClient.post('/files/download', {
    daemonId,
    uuid,
    file_name: fileName,
  });
}

/** 获取文件上传凭证 */
export async function getUploadCredential(
  daemonId: string,
  uuid: string,
  uploadDir: string = '/'
): Promise<ApiResponse<FileUploadCredential>> {
  return apiClient.post('/files/upload', {
    daemonId,
    uuid,
    upload_dir: uploadDir,
  });
}

/** 复制文件 */
export async function copyFiles(
  daemonId: string,
  uuid: string,
  targets: [string, string][]
): Promise<ApiResponse<null>> {
  return apiClient.post('/files/copy', {
    daemonId,
    uuid,
    targets,
  });
}

/** 移动/重命名文件 */
export async function moveFiles(
  daemonId: string,
  uuid: string,
  targets: [string, string][]
): Promise<ApiResponse<null>> {
  return apiClient.put('/files/move', {
    daemonId,
    uuid,
    targets,
  });
}
