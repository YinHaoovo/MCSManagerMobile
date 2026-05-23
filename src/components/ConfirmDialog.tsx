/**
 * 确认弹窗组件
 * 停止/删除时弹出
 */
import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>
              {title}
            </Text>
          </View>

          <View style={styles.content}>
            <Text variant="bodyMedium" style={styles.message}>
              {message}
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onCancel}
              style={[styles.button, styles.cancelButton]}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              mode="contained"
              onPress={onConfirm}
              style={[styles.button, styles.confirmButton]}
              loading={loading}
              disabled={loading}
              buttonColor="#F44336"
            >
              {confirmText}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  message: {
    color: '#B0B0B0',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    borderColor: '#666666',
  },
  confirmButton: {
    // 确认按钮使用危险色
  },
});
