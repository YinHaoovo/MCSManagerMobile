/**
 * 状态徽章组件
 * 颜色编码：绿=运行，灰=停止，红=异常，橙=忙碌
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { InstanceStatus } from '@/types/instance';

interface StatusBadgeProps {
  status: InstanceStatus;
  count?: number;
}

/** 获取状态颜色 */
function getStatusColor(status: InstanceStatus): string {
  switch (status) {
    case InstanceStatus.RUNNING:
      return '#4CAF50'; // 绿色
    case InstanceStatus.STOPPED:
      return '#9E9E9E'; // 灰色
    case InstanceStatus.BUSY:
    case InstanceStatus.STARTING:
    case InstanceStatus.STOPPING:
      return '#FF9800'; // 橙色
    default:
      return '#F44336'; // 红色（异常）
  }
}

/** 获取状态文本 */
function getStatusText(status: InstanceStatus): string {
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
}

export default function StatusBadge({ status, count }: StatusBadgeProps) {
  const color: string = getStatusColor(status);
  const text: string = count !== undefined ? `${getStatusText(status)}: ${count}` : getStatusText(status);

  return (
    <View style={[styles.container, { backgroundColor: color + '20', borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
