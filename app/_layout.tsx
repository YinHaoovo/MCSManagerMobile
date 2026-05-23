/**
 * 根布局 - Stack 导航容器
 */
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/useAuthStore';

export default function RootLayout() {
  const { loadSavedAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // App 启动时加载保存的认证信息
    loadSavedAuth();
  }, []);

  return (
    <PaperProvider>
      <StatusBar style="auto" />
      <Stack>
        {!isAuthenticated ? (
          // 未认证时显示登录页
          <Stack.Screen
            name="(auth)/login"
            options={{
              headerShown: false,
              title: '登录',
            }}
          />
        ) : (
          // 已认证时显示主界面
          <>
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
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
          </>
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
    </PaperProvider>
  );
}
