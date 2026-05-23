/**
 * 控制台页（Tab 2 · 重构版）
 * 日志显示 + 命令输入（Daemon 直连模式）
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useConsoleStore } from '@/store/useConsoleStore';
import { useInstanceStore } from '@/store/useInstanceStore';
import LogViewer from '@/components/LogViewer';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ConsoleScreen() {
  const { logs, isLoading, error, connectInstance, disconnectInstance, sendCommand, clearLogs, clearError, currentInstanceUuid } =
    useConsoleStore();
  const { instances } = useInstanceStore();
  const [command, setCommand] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  /** 获取第一个实例的 UUID */
  const getFirstInstanceUuid = (): string => {
    return instances.length > 0 ? instances[0].instanceUuid : '';
  };

  /** 连接实例（启动日志流）*/
  const handleConnect = (): void => {
    const uuid: string = getFirstInstanceUuid();
    if (!uuid) {
      Alert.alert('错误', '没有可用的实例');
      return;
    }

    connectInstance(uuid);
    setIsConnected(true);
  };

  /** 断开实例 */
  const handleDisconnect = (): void => {
    disconnectInstance();
    setIsConnected(false);
  };

  /** 发送命令 */
  const handleSendCommand = async (): Promise<void> => {
    if (!command.trim()) return;

    const uuid: string = getFirstInstanceUuid();
    if (!uuid) return;

    try {
      await sendCommand(uuid, command);
      setCommand('');
    } catch (error: unknown) {
      console.error('Failed to send command:', error);
    }
  };

  /** 清空日志 */
  const handleClearLogs = (): void => {
    clearLogs();
  };

  /** 组件卸载时断开连接 */
  useEffect(() => {
    return () => {
      disconnectInstance();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* 控制栏 */}
      <View style={styles.controlBar}>
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4CAF50' : '#9E9E9E' }]} />
          <Text variant="bodySmall" style={styles.statusText}>
            {isConnected ? '已连接' : '未连接'}
          </Text>
        </View>

        <View style={styles.controlButtons}>
          {!isConnected ? (
            <Button
              mode="contained"
              onPress={handleConnect}
              loading={isLoading}
              disabled={isLoading || instances.length === 0}
              compact
              style={styles.connectButton}
            >
              连接
            </Button>
          ) : (
            <Button
              mode="outlined"
              onPress={handleDisconnect}
              compact
              textColor="#F44336"
              style={styles.disconnectButton}
            >
              断开
            </Button>
          )}

          <TouchableOpacity onPress={handleClearLogs} style={styles.iconButton}>
            <MaterialIcons name="delete" size={24} color="#9E9E9E" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 错误提示 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.errorDismiss}>关闭</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 日志显示区 */}
      <View style={styles.logContainer}>
        <LogViewer logs={logs} />
      </View>

      {/* 命令输入区 */}
      <View style={styles.commandBar}>
        <TextInput
          style={styles.commandInput}
          value={command}
          onChangeText={setCommand}
          placeholder="输入命令..."
          placeholderTextColor="#666666"
          onSubmitEditing={handleSendCommand}
          editable={isConnected}
        />
        <TouchableOpacity
          style={[styles.sendButton, !isConnected && styles.sendButtonDisabled]}
          onPress={handleSendCommand}
          disabled={!isConnected || !command.trim()}
        >
          <MaterialIcons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#9E9E9E',
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    borderColor: '#F44336',
  },
  iconButton: {
    padding: 4,
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
  errorDismiss: {
    color: '#9E9E9E',
    marginLeft: 8,
  },
  logContainer: {
    flex: 1,
  },
  commandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  commandInput: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#666666',
  },
});
