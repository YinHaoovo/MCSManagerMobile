/**
 * 设置页（多 Daemon 支持）
 *   - 显示已保存的 Daemons 列表
 *   - 添加新的 Daemon
 *   - 选择当前 Daemon
 *   - 断开指定 Daemon
 */
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, FlatList } from 'react-native';
import { Text, TextInput, Button, Card, Divider, Switch, ActivityIndicator } from 'react-native-paper';
import { useAuthStore } from '@/store/useAuthStore';
import type { DaemonConfig } from '@/store/useAuthStore';

export default function SettingsScreen() {
  const {
    daemons,
    selectedDaemonId,
    addDaemon,
    removeDaemon,
    selectDaemon,
    disconnectDaemon,
    isLoading,
  } = useAuthStore();

  const [newUrl, setNewUrl] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  /** 添加 Daemon */
  const handleAddDaemon = async () => {
    if (!newUrl.trim()) {
      Alert.alert('错误', '请输入 Daemon 地址');
      return;
    }

    setSaving(true);
    try {
      let url = newUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `http://${url}`;
      }

      const key = newKey.trim() || undefined;
      const result = await addDaemon(url, key, newName.trim() || undefined);

      if (result.success) {
        Alert.alert('成功', 'Daemon 已连接');
        setNewUrl('');
        setNewKey('');
        setNewName('');
      } else if (result.requireAuth) {
        Alert.alert('需要认证', '该 Daemon 已设置 API Key，请输入 Key 后重试');
      } else {
        Alert.alert('连接失败', '无法连接到 Daemon，请检查地址和网络');
      }
    } catch (error) {
      Alert.alert('错误', error instanceof Error ? error.message : '添加 Daemon 失败');
    } finally {
      setSaving(false);
    }
  };

  /** 删除 Daemon */
  const handleRemoveDaemon = (daemon: DaemonConfig) => {
    Alert.alert('确认删除', `确定要删除 Daemon "${daemon.name || daemon.url}" 吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => removeDaemon(daemon.id),
      },
    ]);
  };

  /** 选择 Daemon */
  const handleSelectDaemon = (daemonId: string) => {
    selectDaemon(daemonId);
  };

  /** 断开 Daemon */
  const handleDisconnectDaemon = (daemonId: string) => {
    disconnectDaemon(daemonId);
  };

  /** 断开所有 Daemon */
  const handleDisconnectAll = () => {
    daemons.forEach((d) => {
      if (d.isConnected) {
        disconnectDaemon(d.id);
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>

        {/* 当前选中的 Daemon */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">当前 Daemon</Text>
            <Divider style={styles.divider} />

            {selectedDaemonId ? (
              (() => {
                const daemon = daemons.find((d) => d.id === selectedDaemonId);
                return daemon ? (
                  <View>
                    <Text variant="bodyLarge">{daemon.name || daemon.url}</Text>
                    <Text variant="bodyMedium" style={styles.infoText}>
                      URL: {daemon.url}
                    </Text>
                    <Text variant="bodyMedium" style={styles.infoText}>
                      状态: {daemon.isConnected ? '已连接' : '未连接'}
                    </Text>
                    {daemon.info && (
                      <Text variant="bodyMedium" style={styles.infoText}>
                        版本: {daemon.info.version} | 平台: {daemon.info.platform}
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text variant="bodyMedium" style={styles.infoText}>
                    未选择 Daemon
                  </Text>
                );
              })()
            ) : (
              <Text variant="bodyMedium" style={styles.infoText}>
                未选择 Daemon
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* 已保存的 Daemons 列表 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">已保存的 Daemons</Text>
            <Divider style={styles.divider} />

            {daemons.length === 0 ? (
              <Text variant="bodyMedium" style={styles.infoText}>
                暂无已保存的 Daemon
              </Text>
            ) : (
              daemons.map((daemon) => (
                <View key={daemon.id} style={styles.daemonItem}>
                  <View style={styles.daemonInfo}>
                    <Text variant="bodyLarge">{daemon.name || daemon.url}</Text>
                    <Text variant="bodyMedium" style={styles.infoText}>
                      {daemon.url}
                    </Text>
                    <Text variant="bodyMedium" style={styles.infoText}>
                      {daemon.isConnected ? '🟢 已连接' : '🔴 未连接'}
                    </Text>
                  </View>

                  <View style={styles.daemonActions}>
                    {daemon.id === selectedDaemonId ? (
                      <Text variant="bodyMedium" style={styles.selectedText}>
                        当前选中
                      </Text>
                    ) : (
                      <Button
                        mode="text"
                        onPress={() => handleSelectDaemon(daemon.id)}
                        disabled={!daemon.isConnected}
                      >
                        选中
                      </Button>
                    )}

                    {daemon.isConnected ? (
                      <Button
                        mode="text"
                        onPress={() => handleDisconnectDaemon(daemon.id)}
                        textColor="#F44336"
                      >
                        断开
                      </Button>
                    ) : (
                      <Button
                        mode="text"
                        onPress={() => handleSelectDaemon(daemon.id)}
                      >
                        连接
                      </Button>
                    )}

                    <Button
                      mode="text"
                      onPress={() => handleRemoveDaemon(daemon)}
                      textColor="#F44336"
                    >
                      删除
                    </Button>
                  </View>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* 添加新的 Daemon */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">添加 Daemon</Text>
            <Divider style={styles.divider} />

            <TextInput
              label="名称（可选）"
              value={newName}
              onChangeText={setNewName}
              mode="outlined"
              style={styles.input}
              disabled={saving}
            />

            <TextInput
              label="Daemon 地址"
              value={newUrl}
              onChangeText={setNewUrl}
              placeholder="http://192.168.1.100:24444"
              mode="outlined"
              autoCapitalize="none"
              keyboardType="url"
              style={styles.input}
              disabled={saving}
            />

            <TextInput
              label="API Key（可选）"
              value={newKey}
              onChangeText={setNewKey}
              placeholder="若 Daemon 未设 Key 可留空"
              mode="outlined"
              autoCapitalize="none"
              secureTextEntry
              style={styles.input}
              disabled={saving}
            />

            <Button
              mode="contained"
              onPress={handleAddDaemon}
              loading={saving}
              disabled={saving || !newUrl.trim()}
              style={styles.button}
            >
              添加并连接
            </Button>
          </Card.Content>
        </Card>

        {/* 断开所有连接 */}
        <Button
          mode="outlined"
          onPress={handleDisconnectAll}
          style={styles.logoutButton}
          textColor="#F44336"
          disabled={!daemons.some((d) => d.isConnected)}
        >
          断开所有连接
        </Button>

      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 12,
    backgroundColor: '#1E1E1E',
  },
  divider: {
    marginVertical: 12,
  },
  infoText: {
    color: '#9E9E9E',
    marginTop: 4,
  },
  selectedText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  daemonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  daemonInfo: {
    flex: 1,
  },
  daemonActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    marginTop: 8,
    backgroundColor: '#2A2A2A',
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  logoutButton: {
    margin: 12,
    paddingVertical: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
