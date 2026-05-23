/**
 * 设置页（Tab 4）
 * 服务地址管理/Token 管理/刷新频率/关于
 */
import React, { useState } from 'react';
import { View, StyleSheet, Alert, Switch, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { useAuthStore } from '@/store/useAuthStore';

export default function SettingsScreen() {
  const { panelURL, apiKey, logout } = useAuthStore();
  const [refreshInterval, setRefreshInterval] = useState<number>(5);
  const [autoReconnect, setAutoReconnect] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  /** 处理退出登录 */
  const handleLogout = (): void => {
    Alert.alert('确认退出', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  /** 清除缓存 */
  const handleClearCache = (): void => {
    Alert.alert('清除缓存', '确定要清除所有缓存数据吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清除',
        onPress: () => {
          Alert.alert('成功', '缓存已清除');
        },
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

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                服务地址
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {panelURL || '未设置'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                API Token
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {apiKey ? '••••••••' : '未设置'}
              </Text>
            </View>
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
                onChangeText={(value: string) => setRefreshInterval(Number(value) || 5)}
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
                开发者
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                MCSManager Team
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* 退出登录 */}
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#F44336"
        >
          退出登录
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
    borderColor: '#FF9800',
  },
  logoutButton: {
    margin: 12,
    marginBottom: 32,
    paddingVertical: 4,
  },
});
