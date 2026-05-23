/**
 * 文件上传/下载服务
 * 获取凭证 → 直连 Daemon
 */
import * as FileSystem from 'expo-file-system';
import * as fileApi from '@/api/file';
import { FileUploadCredential, FileDownloadCredential } from '@/types/file';

/** 下载文件 */
export async function downloadFile(
  daemonId: string,
  uuid: string,
  fileName: string,
  targetPath: string
): Promise<string> {
  try {
    // 1. 获取下载凭证
    const credentialResponse = await fileApi.getDownloadCredential(daemonId, uuid, fileName);
    const credential: FileDownloadCredential = credentialResponse.data;

    // 2. 构建下载 URL
    const downloadUrl: string = `http://${credential.addr}/download/${credential.password}/${fileName}`;

    // 3. 下载文件
    const downloadResult: FileSystem.FileSystemDownloadResult = await FileSystem.downloadAsync(
      downloadUrl,
      targetPath
    );

    if (downloadResult.status === 200) {
      return downloadResult.uri;
    } else {
      throw new Error(`下载失败: ${downloadResult.status}`);
    }
  } catch (error: unknown) {
    console.error('File download failed:', error);
    throw error;
  }
}

/** 上传文件 */
export async function uploadFile(
  daemonId: string,
  uuid: string,
  filePath: string,
  uploadDir: string = '/'
): Promise<void> {
  try {
    // 1. 获取上传凭证
    const credentialResponse = await fileApi.getUploadCredential(daemonId, uuid, uploadDir);
    const credential: FileUploadCredential = credentialResponse.data;

    // 2. 构建上传 URL
    const uploadUrl: string = `http://${credential.addr}/upload/${credential.password}`;

    // 3. 上传文件（使用 multipart/form-data）
    const formData: FormData = new FormData();
    formData.append('file', {
      uri: filePath,
      type: 'application/octet-stream',
      name: filePath.split('/').pop() || 'file',
    } as unknown as Blob);

    const response: Response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error(`上传失败: ${response.status}`);
    }
  } catch (error: unknown) {
    console.error('File upload failed:', error);
    throw error;
  }
}

/** 批量下载文件 */
export async function downloadFiles(
  daemonId: string,
  uuid: string,
  fileNames: string[],
  targetDir: string
): Promise<string[]> {
  const results: string[] = [];

  for (const fileName of fileNames) {
    const targetPath: string = `${targetDir}/${fileName}`;
    const result: string = await downloadFile(daemonId, uuid, fileName, targetPath);
    results.push(result);
  }

  return results;
}
