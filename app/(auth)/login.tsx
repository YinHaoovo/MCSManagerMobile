/**
 * 登录页（重构版）
 * 支持两种模式：
 *   - Daemon 直连（默认，推荐）
 *   - Panel 登录（保留，需认证）
 *
 * 「可选登录」逻辑：
 *   Daemon 若未设置 Key，留空即可直连。
 */
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import { useAuthStore } from '@/store/useAuthStore';

type LoginMode = 'daemon' | 'panel';

export default function LoginScreen() {
  const [mode, setMode] = useState<LoginMode>('daemon');
  const [daemonUrl, setDaemonUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [panelUrl, setPanelUrl] = useState('');
  const [panelKey, setPanelKey] = useState('');
  const { addDaemon, isLoading } = useAuthStore();

  /** 处理 Daemon 直连 */
  const handleDaemonConnect = async () => {
    if (!daemonUrl.trim()) {
      Alert.alert('错误', '请输入 Daemon 地址');
      return;
    }

    let url = daemonUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `http://${url}`;
    }

    const key = apiKey.trim() || undefined;
    const result = await addDaemon(url, key);

    if (!result.success && result.requireAuth) {
      Alert.alert('需要认证', '该 Daemon 已设置 API Key，请输入 Key 后重试');
    } else if (!result.success) {
      Alert.alert('连接失败', '无法连接到 Daemon，请检查地址和网络');
    }
  };

  /** 处理 Panel 登录（保留原逻辑）*/
  const handlePanelLogin = async () => {
    if (!panelUrl.trim()) {
      Alert.alert('错误', '请输入 Panel 地址');
      return;
    }
    if (!panelKey.trim()) {
      Alert.alert('错误', '请输入 API Token');
      return;
    }
    Alert.alert('提示', 'Panel 登录暂未迁移，请使用 Daemon 直连模式');
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text variant="headlineMedium" style={styles.title}>
          MCSManager 移动端
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {mode === 'daemon' ? '直连 Daemon（推荐）' : '通过 Panel 连接'}
        </Text>

        <SegmentedButtons
          value={mode}
          onValueChange={(v) => setMode(v as LoginMode)}
          buttons={[
            { value: 'daemon', label: 'Daemon 直连' },
            { value: 'panel', label: 'Panel 登录' },
          ]}
          style={styles.segment}
        />

        {mode === 'daemon' ? (
          <>
            <TextInput
              label="Daemon 地址"
              value={daemonUrl}
              onChangeText={setDaemonUrl}
              placeholder="http://192.168.1.100:24444"
              mode="outlined"
              autoCapitalize="none"
              keyboardType="url"
              style={styles.input}
              disabled={isLoading}
            />
            <TextInput
              label="API Key（可选）"
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="若 Daemon 未设 Key 可留空"
              mode="outlined"
              autoCapitalize="none"
              secureTextEntry
              style={styles.input}
              disabled={isLoading}
            />
            <Button
              mode="contained"
              onPress={handleDaemonConnect}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              连接
            </Button>
          </>
        ) : (
          <>
            <TextInput
              label="Panel 地址"
              value={panelUrl}
              onChangeText={setPanelUrl}
              placeholder="http://your-panel:23333"
              mode="outlined"
              autoCapitalize="none"
              keyboardType="url"
              style={styles.input}
              disabled={isLoading}
            />
            <TextInput
              label="API Token"
              value={panelKey}
              onChangeText={setPanelKey}
              placeholder="输入您的 API Token"
              mode="outlined"
              autoCapitalize="none"
              secureTextEntry
              style={styles.input}
              disabled={isLoading}
            />
            <Button
              mode="contained"
              onPress={handlePanelLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              登录
            </Button>
          </>
        )}

        {isLoading && (
          <ActivityIndicator size="large" style={styles.loader} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#121212',
  },
  formContainer: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#B0B0B0',
  },
  segment: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  loader: {
    marginTop: 20,
  },
});
