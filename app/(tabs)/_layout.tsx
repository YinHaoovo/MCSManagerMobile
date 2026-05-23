/**
 * 底部 Tab 导航布局
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#333333',
        },
        headerStyle: {
          backgroundColor: '#1E1E1E',
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '实例列表',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialIcons name="list" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="console"
        options={{
          title: '控制台',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialIcons name="terminal" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="files"
        options={{
          title: '文件管理',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialIcons name="folder" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
