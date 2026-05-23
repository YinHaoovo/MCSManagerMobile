/**
 * 文件类型图标组件
 * 文件夹/代码/配置/压缩包等
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface FileIconProps {
  type: 0 | 1; // 0=文件夹, 1=文件
  name: string;
}

/** 根据文件名判断文件类型 */
function getFileType(name: string): string {
  const ext: string = name.split('.').pop()?.toLowerCase() || '';

  // 代码文件
  const codeExts: string[] = ['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'sh'];
  if (codeExts.includes(ext)) return 'code';

  // 配置文件
  const configExts: string[] = ['json', 'yml', 'yaml', 'xml', 'properties', 'conf', 'ini', 'env'];
  if (configExts.includes(ext)) return 'config';

  // 压缩包
  const archiveExts: string[] = ['zip', 'tar', 'gz', 'rar', '7z'];
  if (archiveExts.includes(ext)) return 'archive';

  // 文本文件
  const textExts: string[] = ['txt', 'md', 'log', 'html', 'css'];
  if (textExts.includes(ext)) return 'text';

  // 图片文件
  const imageExts: string[] = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
  if (imageExts.includes(ext)) return 'image';

  // 视频文件
  const videoExts: string[] = ['mp4', 'avi', 'mkv', 'mov', 'wmv'];
  if (videoExts.includes(ext)) return 'video';

  return 'file';
}

/** 根据文件类型返回图标名称和颜色 */
function getIconInfo(type: 0 | 1, name: string): { iconName: string; color: string } {
  if (type === 0) {
    return { iconName: 'folder', color: '#FFD54F' }; // 文件夹：黄色
  }

  const fileType: string = getFileType(name);

  switch (fileType) {
    case 'code':
      return { iconName: 'code', color: '#42A5F5' }; // 代码：蓝色
    case 'config':
      return { iconName: 'settings', color: '#FF9800' }; // 配置：橙色
    case 'archive':
      return { iconName: 'archive', color: '#AB47BC' }; // 压缩包：紫色
    case 'text':
      return { iconName: 'description', color: '#66BB6A' }; // 文本：绿色
    case 'image':
      return { iconName: 'image', color: '#EC407A' }; // 图片：粉色
    case 'video':
      return { iconName: 'videocam', color: '#26C6DA' }; // 视频：青色
    default:
      return { iconName: 'insert-drive-file', color: '#9E9E9E' }; // 其他：灰色
  }
}

export default function FileIcon({ type, name }: FileIconProps) {
  const { iconName, color } = getIconInfo(type, name);

  return (
    <View style={[styles.container, { backgroundColor: color + '20' }]}>
      <MaterialIcons name={iconName as any} size={24} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
