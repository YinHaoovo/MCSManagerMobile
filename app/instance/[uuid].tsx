/**
 * 实例详情页（多 Daemon 支持）
 * 使用 useInstanceStore（自动获取 selectedDaemonId）
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, Card, Divider, Button, ProgressBar } from 'react-native-paper';
import { useInstanceStore } from '@/store/useInstanceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { InstanceStatus } from '@/types/instance';
import type { InstanceDetail, ProcessInfo } from '@/types/instance';

export default function InstanceDetailScreen({ route }: { route: { params: { uuid: string } } }) {
  const { uuid } = route.params;
  
  const {
    instanceDetails,
    isLoading,
    error,
    fetchInstanceDetail,
    startInstance,
    stopInstance,
    restartInstance,
    killInstance,
    clearError,
  } = useInstanceStore();

  const [instance, setInstance] = useState<InstanceDetail | null>(null);
  const [processInfo, setProcessInfo] = useState<ProcessInfo | null>(null);

  /** 初始化：获取实例详情 */
  useEffect(() => {
    loadInstanceDetail();
  }, [uuid]);

  /** 加载实例详情 */
  const loadInstanceDetail = async () => {
    const detail = await fetchInstanceDetail(uuid);
    if (detail) {
      setInstance(detail);
    }
  };

  /** 启动实例 */
  const handleStart = async () => {
    Alert.alert('确认启动', '确定要启动此实例吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '启动',
        onPress: async () => {
          await startInstance(uuid);
          loadInstanceDetail();
        },
      },
    ]);
  };

  /** 停止实例 */
  const handleStop = async () => {
    Alert.alert('确认停止', '确定要停止此实例吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '停止',
        style: 'destructive',
        onPress: async () => {
          await stopInstance(uuid);
          loadInstanceDetail();
        },
      },
    ]);
  };

  /** 重启实例 */
  const handleRestart = async () => {
    Alert.alert('确认重启', '确定要重启此实例吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '重启',
        onPress: async () => {
          await restartInstance(uuid);
          loadInstanceDetail();
        },
      },
    ]);
  };

  /** 强制结束实例 */
  const handleKill = async () => {
    Alert.alert('确认强制结束', '确定要强制结束此实例吗？此操作可能丢失数据！', [
      { text: '取消', style: 'cancel' },
      {
        text: '强制结束',
        style: 'destructive',
        onPress: async () => {
          await killInstance(uuid);
          loadInstanceDetail();
        },
      },
    ]);
  };

  /** 获取状态颜色 */
  const getStatusColor = (status: InstanceStatus): string => {
    switch (status) {
      case InstanceStatus.RUNNING: return '#4CAF50';
      case InstanceStatus.STOPPED: return '#F44336';
      case InstanceStatus.STARTING: return '#FF9800';
      case InstanceStatus.STOPPING: return '#FF9800';
      case InstanceStatus.BUSY: return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  if (isLoading && !instance) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (!instance) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>实例不存在</Text>
      </View>
    );
  }

  const { config, processInfo: procInfo, status } = instance;
  const isRunning = status === InstanceStatus.RUNNING;

  return (
    <ScrollView style={styles.container}>
      {/* 实例信息 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">{config.nickname || '未命名实例'}</Text>
          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>状态</Text>
            <Text
              variant="bodyMedium"
              style={[styles.infoValue, { color: getStatusColor(status) }]}
            >
              {InstanceStatus[status] || '未知'}
            </Text>
          </View>

          {procInfo && isRunning && (
            <>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>CPU 使用率</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {procInfo.cpu.toFixed(1)}%
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>内存使用</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {procInfo.memory} MB
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>运行时长</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {Math.floor(procInfo.elpased / 3600)} 小时
                </Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* 操作按钮 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">操作</Text>
          <Divider style={styles.divider} />

          {isRunning ? (
            <>
              <Button
                mode="contained"
                onPress={handleStop}
                style={styles.button}
                buttonColor="#F44336"
              >
                停止
              </Button>
              <Button
                mode="outlined"
                onPress={handleRestart}
                style={styles.button}
              >
                重启
              </Button>
              <Button
                mode="text"
                onPress={handleKill}
                style={styles.button}
                textColor="#F44336"
              >
                强制结束
              </Button>
            </>
          ) : (
            <Button
              mode="contained"
              onPress={handleStart}
              style={styles.button}
              buttonColor="#4CAF50"
            >
              启动
            </Button>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
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
    color: '#B0B0B0',
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
  },
  card: {
    margin: 12,
    backgroundColor: '#1E1E1E',
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    color: '#9E9E9E',
  },
  infoValue: {
    color: '#FFFFFF',
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
});
