/**
 * 日志显示组件
 * 自动滚动 + 清空 + 性能优化
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useConsoleStore } from '@/store/useConsoleStore';

interface LogViewerProps {
  logs: string;
  isAutoScroll?: boolean;  // 可选，默认 true
}

export default function LogViewer({ logs, isAutoScroll }: LogViewerProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  /** 自动滚动到底部 */
  useEffect(() => {
    if (isAutoScroll && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [logs, isAutoScroll]);

  /** 格式化日志（添加行号、颜色等） */
  const formatLogs = (logText: string): string => {
    if (!logText) return '暂无日志输出';

    // 限制日志行数（性能优化）
    const lines: string[] = logText.split('\n');
    const maxLines: number = 500;

    if (lines.length > maxLines) {
      return (
        `[... 省略了 ${lines.length - maxLines} 行 ...]\n\n` +
        lines.slice(-maxLines).join('\n')
      );
    }

    return logText;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
      >
        <Text style={styles.logText}>{formatLogs(logs)}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 12,
    flexGrow: 1,
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#B0B0B0',
    lineHeight: 18,
  },
});
