/**
 * 404 页面
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text variant="displayMedium" style={styles.title}>
        404
      </Text>
      <Text variant="headlineSmall" style={styles.subtitle}>
        页面未找到
      </Text>
      <Text variant="bodyMedium" style={styles.description}>
        您访问的页面不存在
      </Text>

      <Button
        mode="contained"
        onPress={() => router.push('/')}
        style={styles.button}
      >
        返回首页
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B0B0B0',
    marginBottom: 16,
  },
  description: {
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#4CAF50',
  },
});
