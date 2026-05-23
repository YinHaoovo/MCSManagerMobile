/**
 * 文件管理页（Tab 3 · 重构版）
 * 路径面包屑 + 文件列表 + 操作菜单（Daemon 直连模式）
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Text, FAB, ActivityIndicator, Menu } from 'react-native-paper';
import { useFileStore } from '@/store/useFileStore';
import { useInstanceStore } from '@/store/useInstanceStore';
import FileIcon from '@/components/FileIcon';
import { FileItem } from '@/types/file';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function FileManagerScreen() {
  const { files, currentPath, isLoading, error, fetchFiles, clearError } = useFileStore();
  const { instances } = useInstanceStore();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  /** 获取第一个实例的 UUID */
  const getFirstInstanceUuid = (): string => {
    return instances.length > 0 ? instances[0].instanceUuid : '';
  };

  /** 加载文件列表 */
  const loadFiles = async (path: string = currentPath): Promise<void> => {
    const uuid: string = getFirstInstanceUuid();
    if (!uuid) return;

    await fetchFiles(uuid, path);
  };

  useEffect(() => {
    loadFiles('/');
  }, []);

  /** 下拉刷新 */
  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadFiles(currentPath);
    setRefreshing(false);
  };

  /** 点击文件/文件夹 */
  const handleItemPress = (item: FileItem): void => {
    if (item.type === 0) {
      // 文件夹：进入目录
      const newPath: string = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      loadFiles(newPath);
    } else {
      // 文件：显示操作菜单
      setSelectedFile(item);
      setMenuVisible(true);
    }
  };

  /** 返回上级目录 */
  const handleGoBack = (): void => {
    if (currentPath === '/') return;

    const parentPath: string = currentPath.split('/').slice(0, -1).join('/') || '/';
    loadFiles(parentPath);
  };

  /** 渲染文件项 */
  const renderFileItem = ({ item }: { item: FileItem }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)}>
      <View style={styles.fileItem}>
        <FileIcon type={item.type} name={item.name} />
        <View style={styles.fileInfo}>
          <Text variant="bodyMedium" style={styles.fileName}>
            {item.name}
          </Text>
          <Text variant="bodySmall" style={styles.fileSize}>
            {item.type === 0 ? '文件夹' : `${formatFileSize(item.size)}`}
          </Text>
        </View>
        <MaterialIcons name="more-vert" size={20} color="#9E9E9E" />
      </View>
    </TouchableOpacity>
  );

  /** 格式化文件大小 */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k: number = 1024;
    const sizes: string[] = ['B', 'KB', 'MB', 'GB'];
    const i: number = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /** 面包屑路径 */
  const renderBreadcrumb = (): JSX.Element => {
    const parts: string[] = currentPath.split('/').filter(Boolean);

    return (
      <View style={styles.breadcrumb}>
        <TouchableOpacity onPress={() => loadFiles('/')}>
          <MaterialIcons name="folder" size={16} color="#4CAF50" />
        </TouchableOpacity>
        {parts.map((part: string, index: number) => (
          <View key={index} style={styles.breadcrumbItem}>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <TouchableOpacity
              onPress={() => {
                const path: string = '/' + parts.slice(0, index + 1).join('/');
                loadFiles(path);
              }}
            >
              <Text style={styles.breadcrumbText}>{part}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 面包屑导航 */}
      {renderBreadcrumb()}

      {/* 返回按钮 */}
      {currentPath !== '/' && (
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backText}>返回上级</Text>
        </TouchableOpacity>
      )}

      {/* 错误提示 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 文件列表 */}
      <FlatList
        data={files}
        renderItem={renderFileItem}
        keyExtractor={(item: FileItem) => item.name}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>此文件夹为空</Text>
          </View>
        }
      />

      {/* 悬浮按钮：创建文件/文件夹 */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          Alert.alert('创建', '选择要创建的类型', [
            { text: '取消', style: 'cancel' },
            {
              text: '文件夹',
              onPress: () => {
                // TODO: 显示创建文件夹对话框
                Alert.alert('提示', '创建文件夹功能开发中');
              },
            },
            {
              text: '文件',
              onPress: () => {
                // TODO: 显示创建文件对话框
                Alert.alert('提示', '创建文件功能开发中');
              },
            },
          ]);
        }}
      />

      {/* 文件操作菜单 */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}
      >
        <Menu.Item onPress={() => {
          setMenuVisible(false);
          Alert.alert('提示', '查看文件功能开发中');
        }} title="查看" />
        <Menu.Item onPress={() => {
          setMenuVisible(false);
          Alert.alert('提示', '编辑文件功能开发中');
        }} title="编辑" />
        <Menu.Item onPress={() => {
          setMenuVisible(false);
          Alert.alert('提示', '下载文件功能开发中');
        }} title="下载" />
        <Menu.Item onPress={() => {
          setMenuVisible(false);
          Alert.alert('确认删除', '确定要删除此文件吗？', [
            { text: '取消', style: 'cancel' },
            {
              text: '删除',
              style: 'destructive',
              onPress: () => {
                if (selectedFile) {
                  const uuid: string = getFirstInstanceUuid();
                  if (uuid) {
                    useFileStore.getState().deleteFiles(uuid, [selectedFile.name]);
                  }
                }
              },
            },
          ]);
        }} title="删除" />
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1E1E1E',
    flexWrap: 'wrap',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbSeparator: {
    color: '#9E9E9E',
    marginHorizontal: 4,
  },
  breadcrumbText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#3B1515',
    margin: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#EF5350',
  },
  listContent: {
    padding: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginBottom: 8,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    color: '#FFFFFF',
  },
  fileSize: {
    color: '#9E9E9E',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4CAF50',
  },
});
