/**
 * 文件上传/下载服务（多 Daemon 支持）
 * 获取凭证 → 直连 Daemon
 */
import * as FileSystem from 'expo-file-system';
import * as fileApi from '@/api/file';
import type { FileUploadCredential } from '@/types/file';
import { useAuthStore } from '@/store/useAuthStore';

/** 获取当前选中的 Daemon */
function getSelectedDaemon() {
  const daemon = useAuthStore.getState().getSelectedDaemon();
  if (!daemon) {
    throw new Error('未选择 Daemon，请在设置中添加并选择一个 Daemon');
  }
  return daemon;
}

/** 下载文件 */
export async function downloadFile(
  uuid: string,
  fileName: string,
  targetPath: string
): Promise<string> {
  try {
    const daemon = getSelectedDaemon();
    
    // 1. 获取下载凭证
    const credential = await fileApi.getDownloadCredential(daemon.id, uuid, fileName);
    
    // 2. 构建下载 URL
    const baseUrl: string = daemon.url;
    const sep = baseUrl.endsWith('/') ? '' : '/';
    const downloadUrl: string = `${baseUrl}${sep}download/${credential.password}/${fileName}`;
    
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
  uuid: string,
  filePath: string,
  uploadDir: string = '/'
): Promise<void> {
  try {
    const daemon = getSelectedDaemon();
    
    // 1. 获取上传凭证
    const credential: FileUploadCredential = await fileApi.getUploadCredential(daemon.id, uuid, uploadDir);
    
    // 2. 构建上传 URL
    const baseUrl: string = daemon.url;
    const sep = baseUrl.endsWith('/') ? '' : '/';
    const uploadUrl: string = `${baseUrl}${sep}upload/${credential.password}`;
    
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
  uuid: string,
  fileNames: string[],
  targetDir: string
): Promise<string[]> {
  const results: string[] = [];
  
  for (const fileName of fileNames) {
    const targetPath: string = `${targetDir}/${fileName}`;
    const result: string = await downloadFile(uuid, fileName, targetPath);
    results.push(result);
  }
  
  return results;
}
