/**
 * 根布局 - Stack 导航容器
 * 修复：始终渲染所有 Screen，用 useEffect + router.replace 处理认证重定向
 */
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/useAuthStore';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
});

export default function RootLayout() {
  const { loadSavedAuth, isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // App 启动时加载保存的认证信息
  useEffect(() => {
    loadSavedAuth();
  }, []);

  // 认证状态变化时重定向
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // 未认证 → 跳转登录页
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // 已认证 + 在登录页 → 跳转主界面
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  // 加载中显示启动屏
  if (isLoading) {
    return (
      <PaperProvider>
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </PaperProvider>
    );
  }

  // 始终渲染所有 Screen，避免路由器找不到路由
  return (
    <PaperProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="instance/[uuid]"
          options={{
            title: '实例详情',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen
          name="file/editor"
          options={{
            title: '文件编辑器',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </PaperProvider>
  );
}
