/**
 * 设置页（Tab 4 · 重构版）
 *   - 显示/修改 Daemon 地址和 API Key
 *   - 直连模式下不需要 Panel 地址
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Divider, Switch } from 'react-native-paper';
import { useAuthStore } from '@/store/useAuthStore';

export default function SettingsScreen() {
  const { daemonUrl, apiKey, logout, loadSavedAuth } = useAuthStore();

  const [dUrl, setDUrl] = useState(daemonUrl || '');
  const [dKey, setDKey] = useState(apiKey || '');
  const [refreshInterval, setRefreshInterval] = useState<number>(5);
  const [autoReconnect, setAutoReconnect] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDUrl(daemonUrl || '');
    setDKey(apiKey || '');
  }, [daemonUrl, apiKey]);

  /** 保存连接设置 */
  const handleSave = async () => {
    setSaving(true);
    try {
      // 格式化 URL
      let url = dUrl.trim();
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = `http://${url}`;
      }
      // 通过重新连接来保存
      const { connectDaemon } = useAuthStore.getState();
      const ok = await connectDaemon(url, dKey.trim() || undefined);
      if (ok.success || !ok.requireAuth) {
        Alert.alert('成功', 'Daemon 连接已保存');
      } else {
        Alert.alert('需要认证', '该 Daemon 已设置 Key，请输入后重试');
      }
    } catch (e: any) {
      Alert.alert('连接失败', e.message);
    } finally {
      setSaving(false);
    }
  };

  /** 处理退出登录 */
  const handleLogout = () => {
    Alert.alert('确认退出', '确定要断开连接吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '断开',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  /** 清除缓存（占位） */
  const handleClearCache = () => {
    Alert.alert('清除缓存', '确定要清除所有缓存数据吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清除',
        onPress: () => Alert.alert('成功', '缓存已清除'),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>

        {/* 连接信息 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">连接信息</Text>
            <Divider style={styles.divider} />

            <Text variant="bodyMedium" style={styles.infoLabel}>
              连接模式
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              Daemon 直连
            </Text>

            <TextInput
              label="Daemon 地址"
              value={dUrl}
              onChangeText={setDUrl}
              placeholder="http://192.168.1.100:24444"
              mode="outlined"
              autoCapitalize="none"
              keyboardType="url"
              style={styles.input}
              disabled={saving}
            />

            <TextInput
              label="API Key（可选）"
              value={dKey}
              onChangeText={setDKey}
              placeholder="若 Daemon 未设 Key 可留空"
              mode="outlined"
              autoCapitalize="none"
              secureTextEntry
              style={styles.input}
              disabled={saving}
            />

            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
              disabled={saving || !dUrl.trim()}
              style={styles.button}
            >
              保存并连接
            </Button>
          </Card.Content>
        </Card>

        {/* 通用设置 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">通用设置</Text>
            <Divider style={styles.divider} />

            <View style={styles.settingRow}>
              <Text variant="bodyMedium">自动重连</Text>
              <Switch
                value={autoReconnect}
                onValueChange={setAutoReconnect}
              />
            </View>

            <View style={styles.settingRow}>
              <Text variant="bodyMedium">深色模式</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
              />
            </View>

            <View style={styles.settingItem}>
              <Text variant="bodyMedium">刷新频率（秒）</Text>
              <TextInput
                style={styles.input}
                value={String(refreshInterval)}
                onChangeText={(v) => setRefreshInterval(Number(v) || 5)}
                keyboardType="numeric"
                mode="outlined"
              />
            </View>
          </Card.Content>
        </Card>

        {/* 存储管理 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">存储管理</Text>
            <Divider style={styles.divider} />
            <Button
              mode="outlined"
              onPress={handleClearCache}
              style={styles.button}
              textColor="#FF9800"
            >
              清除缓存
            </Button>
          </Card.Content>
        </Card>

        {/* 关于 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">关于</Text>
            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                应用名称
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                MCSManager 移动端
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                版本
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                v1.0.0
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                架构
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                Daemon 直连（Socket.io）
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* 断开连接 */}
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#F44336"
        >
          断开连接
        </Button>

      </ScrollView>
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingItem: {
    paddingVertical: 12,
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
    marginBottom: 32,
    paddingVertical: 4,
  },
});
