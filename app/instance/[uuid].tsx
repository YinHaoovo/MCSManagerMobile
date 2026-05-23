/**
 * 实例详情页
 * 状态显示 + 操作按钮 + 监控区
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, ActivityIndicator, Divider } from 'react-native-paper';
import { useInstanceStore } from '@/store/useInstanceStore';
import { useAuthStore } from '@/store/useAuthStore';
import StatusBadge from '@/components/StatusBadge';
import { InstanceDetail, InstanceStatus } from '@/types/instance';
import * as instanceApi from '@/api/instance';

interface InstanceDetailScreenProps {
  route: {
    params: {
      uuid: string;
      daemonId: string;
    };
  };
}

export default function InstanceDetailScreen({ route }: InstanceDetailScreenProps) {
  const { uuid, daemonId } = route.params;
  const [instance, setInstance] = useState<InstanceDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  /** 获取实例详情 */
  const fetchDetail = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await instanceApi.fetchInstanceDetail(uuid, daemonId);
      setInstance(response.data);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : '获取实例详情失败';
      Alert.alert('错误', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [uuid, daemonId]);

  /** 启动实例 */
  const handleStart = async (): Promise<void> => {
    try {
      setActionLoading(true);
      await instanceApi.startInstance(uuid, daemonId);
      await fetchDetail();
    } catch (error: unknown) {
      Alert.alert('错误', '启动实例失败');
    } finally {
      setActionLoading(false);
    }
  };

  /** 停止实例 */
  const handleStop = async (): Promise<void> => {
    Alert.alert('确认停止', '确定要停止此实例吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '停止',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(true);
            await instanceApi.stopInstance(uuid, daemonId);
            await fetchDetail();
          } catch (error: unknown) {
            Alert.alert('错误', '停止实例失败');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  /** 重启实例 */
  const handleRestart = async (): Promise<void> => {
    Alert.alert('确认重启', '确定要重启此实例吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '重启',
        onPress: async () => {
          try {
            setActionLoading(true);
            await instanceApi.restartInstance(uuid, daemonId);
            await fetchDetail();
          } catch (error: unknown) {
            Alert.alert('错误', '重启实例失败');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!instance) {
    return (
      <View style={styles.centered}>
        <Text>实例不存在</Text>
      </View>
    );
  }

  const { config, processInfo, space, started, status } = instance;

  return (
    <ScrollView style={styles.container}>
      {/* 实例基本信息 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">{config.nickname}</Text>
          <View style={styles.statusContainer}>
            <StatusBadge status={status} />
          </View>
          <Text variant="bodyMedium">类型: {config.type}</Text>
          <Text variant="bodyMedium">启动次数: {started}</Text>
        </Card.Content>
      </Card>

      {/* 操作按钮区 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">操作</Text>
          <Divider style={styles.divider} />
          <View style={styles.buttonContainer}>
            {status !== InstanceStatus.RUNNING && (
              <Button
                mode="contained"
                onPress={handleStart}
                loading={actionLoading}
                disabled={actionLoading}
                style={styles.button}
              >
                启动
              </Button>
            )}
            {status === InstanceStatus.RUNNING && (
              <>
                <Button
                  mode="outlined"
                  onPress={handleStop}
                  loading={actionLoading}
                  disabled={actionLoading}
                  style={[styles.button, styles.stopButton]}
                >
                  停止
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleRestart}
                  loading={actionLoading}
                  disabled={actionLoading}
                  style={styles.button}
                >
                  重启
                </Button>
              </>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* 实时监控区 */}
      {status === InstanceStatus.RUNNING && processInfo && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">资源监控</Text>
            <Divider style={styles.divider} />

            <View style={styles.monitorRow}>
              <Text variant="bodyMedium">CPU 使用率</Text>
              <Text variant="bodyLarge">{processInfo.cpu.toFixed(1)}%</Text>
            </View>

            <View style={styles.monitorRow}>
              <Text variant="bodyMedium">内存使用</Text>
              <Text variant="bodyLarge">{processInfo.memory.toFixed(0)} MB</Text>
            </View>

            <View style={styles.monitorRow}>
              <Text variant="bodyMedium">运行时长</Text>
              <Text variant="bodyLarge">{Math.floor(processInfo.elpased / 3600)} 小时</Text>
            </View>

            <View style={styles.monitorRow}>
              <Text variant="bodyMedium">磁盘占用</Text>
              <Text variant="bodyLarge">{space.toFixed(0)} MB</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* 功能入口 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">功能</Text>
          <Divider style={styles.divider} />
          <Button mode="outlined" style={styles.functionButton} disabled={status !== InstanceStatus.RUNNING}>
            控制台
          </Button>
          <Button mode="outlined" style={styles.functionButton}>
            文件管理
          </Button>
          <Button mode="outlined" style={styles.functionButton}>
            配置编辑
          </Button>
          <Button mode="outlined" style={styles.functionButton}>
            备份管理
          </Button>
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
  },
  card: {
    margin: 12,
    backgroundColor: '#1E1E1E',
  },
  statusContainer: {
    marginVertical: 8,
  },
  divider: {
    marginVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
  },
  stopButton: {
    borderColor: '#F44336',
  },
  monitorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  functionButton: {
    marginVertical: 4,
  },
});
