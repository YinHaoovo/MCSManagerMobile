/**
 * 实例列表页（Tab 1 · 重构版）
 * Daemon 直连模式：无需节点选择器，直接显示实例列表
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, FAB, ActivityIndicator } from 'react-native-paper';
import { useInstanceStore } from '@/store/useInstanceStore';
import { useAuthStore } from '@/store/useAuthStore';
import InstanceCard from '@/components/InstanceCard';
import StatusBadge from '@/components/StatusBadge';
import { InstanceItem, InstanceStatus } from '@/types/instance';

export default function InstanceListScreen() {
  const { instances, isLoading, error, fetchInstances, startInstance, stopInstance, restartInstance, clearError } =
    useInstanceStore();
  const { daemons } = useAuthStore();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  /** 初始化：获取实例列表 */
  useEffect(() => {
    if (daemons.length > 0) {
      fetchInstances();
    }
  }, [daemons]);

  /** 下拉刷新 */
  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await fetchInstances();
    } finally {
      setRefreshing(false);
    }
  };

  /** 渲染实例卡片 */
  const renderInstanceCard = ({ item }: { item: InstanceItem }) => (
    <InstanceCard
      instance={item}
      onStart={(uuid: string) => {
        startInstance(uuid);
      }}
      onStop={(uuid: string) => {
        Alert.alert('确认停止', '确定要停止此实例吗？', [
          { text: '取消', style: 'cancel' },
          {
            text: '停止',
            style: 'destructive',
            onPress: () => {
              stopInstance(uuid);
            },
          },
        ]);
      }}
      onRestart={(uuid: string) => {
        Alert.alert('确认重启', '确定要重启此实例吗？', [
          { text: '取消', style: 'cancel' },
          {
            text: '重启',
            onPress: () => {
              restartInstance(uuid);
            },
          },
        ]);
      }}
    />
  );

  /** 获取状态统计 */
  const getStatusCount = (status: InstanceStatus): number => {
    return instances.filter((inst: InstanceItem) => inst.status === status).length;
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 状态统计 */}
      <View style={styles.statsContainer}>
        <StatusBadge status={InstanceStatus.RUNNING} count={getStatusCount(InstanceStatus.RUNNING)} />
        <StatusBadge status={InstanceStatus.STOPPED} count={getStatusCount(InstanceStatus.STOPPED)} />
        <StatusBadge status={InstanceStatus.BUSY} count={getStatusCount(InstanceStatus.BUSY)} />
      </View>

      {/* 错误提示 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 实例列表 */}
      <FlatList
        data={instances}
        renderItem={renderInstanceCard}
        keyExtractor={(item: InstanceItem) => item.instanceUuid}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无实例</Text>
            <Text style={styles.emptySubtext}>当前 Daemon 没有可用的实例</Text>
          </View>
        }
      />
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
    color: '#B0B0B0',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#3B1515',
    marginHorizontal: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#EF5350',
  },
  listContent: {
    padding: 12,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#9E9E9E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
  },
});
