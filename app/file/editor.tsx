/**
 * 文件编辑器页（P1 只读，P2 可编辑）
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { useFileStore } from '@/store/useFileStore';
import { useInstanceStore } from '@/store/useInstanceStore';

interface FileEditorScreenProps {
  route: {
    params: {
      path: string;
    };
  };
}

export default function FileEditorScreen({ route }: FileEditorScreenProps) {
  const { path } = route.params;
  const { readFile, writeFile, isLoading, error, clearError } = useFileStore();
  const { selectedDaemonId, instances } = useInstanceStore();
  const [content, setContent] = useState<string>('');
  const [isReadOnly, setIsReadOnly] = useState<boolean>(true); // P1: 只读模式
  const [isSaving, setIsSaving] = useState<boolean>(false);

  /** 获取第一个实例的 UUID */
  const getFirstInstanceUuid = (): string => {
    return instances.length > 0 ? instances[0].instanceUuid : '';
  };

  /** 加载文件内容 */
  const loadFile = async (): Promise<void> => {
    const uuid: string = getFirstInstanceUuid();
    if (!selectedDaemonId || !uuid) return;

    try {
      const fileContent: string = await readFile(selectedDaemonId, uuid, path);
      setContent(fileContent);
    } catch (error: unknown) {
      console.error('Failed to load file:', error);
    }
  };

  useEffect(() => {
    loadFile();
  }, [path, selectedDaemonId]);

  /** 保存文件 */
  const handleSave = async (): Promise<void> => {
    if (isReadOnly) {
      Alert.alert('提示', '当前为只读模式，无法保存');
      return;
    }

    const uuid: string = getFirstInstanceUuid();
    if (!selectedDaemonId || !uuid) return;

    try {
      setIsSaving(true);
      await writeFile(selectedDaemonId, uuid, path, content);
      Alert.alert('成功', '文件已保存');
    } catch (error: unknown) {
      Alert.alert('错误', '保存文件失败');
    } finally {
      setIsSaving(false);
    }
  };

  /** 切换编辑模式（P2 功能）*/
  const handleToggleEdit = (): void => {
    Alert.alert('提示', 'P2 版本将支持编辑功能', [{ text: '确定' }]);
    // P2: setIsReadOnly(!isReadOnly);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 文件信息 */}
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.fileName}>
          {path.split('/').pop()}
        </Text>
        <Text variant="bodySmall" style={styles.filePath}>
          {path}
        </Text>
      </View>

      {/* 错误提示 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button onPress={clearError} compact>
            关闭
          </Button>
        </View>
      )}

      {/* 编辑器 */}
      <ScrollView style={styles.editorContainer}>
        <TextInput
          style={styles.editor}
          value={content}
          onChangeText={setContent}
          multiline
          editable={!isReadOnly}
          placeholder="文件内容为空或加载失败"
          placeholderTextColor="#666666"
        />
      </ScrollView>

      {/* 操作栏 */}
      <View style={styles.actionBar}>
        <Button
          mode="outlined"
          onPress={handleToggleEdit}
          style={styles.actionButton}
        >
          {isReadOnly ? '编辑' : '取消'}
        </Button>

        {!isReadOnly && (
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
            style={[styles.actionButton, styles.saveButton]}
            buttonColor="#4CAF50"
          >
            保存
          </Button>
        )}
      </View>
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
    backgroundColor: '#121212',
  },
  loadingText: {
    marginTop: 16,
    color: '#9E9E9E',
  },
  header: {
    padding: 12,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  fileName: {
    color: '#FFFFFF',
  },
  filePath: {
    color: '#9E9E9E',
    marginTop: 4,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#3B1515',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF5350',
    flex: 1,
  },
  editorContainer: {
    flex: 1,
  },
  editor: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    color: '#B0B0B0',
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
    textAlignVertical: 'top',
    minHeight: '100%',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  actionButton: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
});
