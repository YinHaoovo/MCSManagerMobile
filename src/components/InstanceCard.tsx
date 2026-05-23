/**
 * 实例卡片组件
 * 名称/状态/快速操作按钮
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import { InstanceItem, InstanceStatus } from '@/types/instance';
import StatusBadge from './StatusBadge';

interface InstanceCardProps {
  instance: InstanceItem;
  onStart: (uuid: string) => void;
  onStop: (uuid: string) => void;
  onRestart: (uuid: string) => void;
}

export default function InstanceCard({ instance, onStart, onStop, onRestart }: InstanceCardProps) {
  const theme = useTheme();
  const { instanceUuid, config, status } = instance;

  /** 获取状态颜色 */
  const getStatusColor = (): string => {
    switch (status) {
      case InstanceStatus.RUNNING:
        return '#4CAF50';
      case InstanceStatus.STOPPED:
        return '#9E9E9E';
      case InstanceStatus.BUSY:
      case InstanceStatus.STARTING:
      case InstanceStatus.STOPPING:
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  /** 获取状态文本 */
  const getStatusText = (): string => {
    switch (status) {
      case InstanceStatus.RUNNING:
        return '运行中';
      case InstanceStatus.STOPPED:
        return '已停止';
      case InstanceStatus.BUSY:
        return '忙碌';
      case InstanceStatus.STARTING:
        return '启动中';
      case InstanceStatus.STOPPING:
        return '停止中';
      default:
        return '未知';
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        // 导航到实例详情页
        console.log('Navigate to instance detail:', instanceUuid);
      }}
    >
      <Card style={[styles.card, { borderLeftColor: getStatusColor() }]}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text variant="titleMedium" style={styles.name}>
              {config.nickname}
            </Text>
            <StatusBadge status={status} />
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.type}>
              类型: {config.type}
            </Text>
          </View>

          {/* 快速操作按钮 */}
          <View style={styles.actionRow}>
            {status !== InstanceStatus.RUNNING && (
              <Button
                mode="contained"
                onPress={() => onStart(instanceUuid)}
                style={styles.actionButton}
                compact
                buttonColor="#4CAF50"
              >
                启动
              </Button>
            )}

            {status === InstanceStatus.RUNNING && (
              <>
                <Button
                  mode="outlined"
                  onPress={() => onStop(instanceUuid)}
                  style={styles.actionButton}
                  compact
                  textColor="#F44336"
                >
                  停止
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => onRestart(instanceUuid)}
                  style={styles.actionButton}
                  compact
                >
                  重启
                </Button>
              </>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderLeftWidth: 4,
    backgroundColor: '#1E1E1E',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    flex: 1,
    marginRight: 8,
  },
  infoRow: {
    marginBottom: 12,
  },
  type: {
    color: '#9E9E9E',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});
