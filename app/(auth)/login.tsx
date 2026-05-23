/**
 * 登录页
 * 输入服务地址 + API Token 进行连接和认证
 */
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginScreen() {
  const [panelURL, setPanelURL] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const { login, isLoading } = useAuthStore();

  /** 处理登录 */
  const handleLogin = async (): Promise<void> => {
    // 验证输入
    if (!panelURL.trim()) {
      Alert.alert('错误', '请输入服务地址');
      return;
    }

    if (!apiKey.trim()) {
      Alert.alert('错误', '请输入 API Token');
      return;
    }

    // 格式化 URL（确保有 http:// 前缀）
    let formattedURL: string = panelURL.trim();
    if (!formattedURL.startsWith('http://') && !formattedURL.startsWith('https://')) {
      formattedURL = `http://${formattedURL}`;
    }

    // 尝试登录
    const success: boolean = await login(formattedURL, apiKey.trim());

    if (!success) {
      Alert.alert('认证失败', '无法连接到 MCSManager 服务，请检查服务地址和 API Token');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text variant="headlineMedium" style={styles.title}>
          MCSManager 移动端
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          连接您的游戏服务器管理面板
        </Text>

        <TextInput
          label="服务地址"
          value={panelURL}
          onChangeText={setPanelURL}
          placeholder="http://your-ip:23333"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          disabled={isLoading}
        />

        <TextInput
          label="API Token"
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="输入您的 API Token"
          mode="outlined"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          disabled={isLoading}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
        >
          连接并登录
        </Button>

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
    backgroundColor: '#1E1E1E',
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
    marginBottom: 32,
    color: '#B0B0B0',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#2A2A2A',
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  loader: {
    marginTop: 20,
  },
});
