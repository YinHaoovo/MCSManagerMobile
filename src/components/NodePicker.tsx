/**
 * 节点选择器组件
 * 下拉选择切换节点
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { DaemonInfo } from '@/types/daemon';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface NodePickerProps {
  daemons: DaemonInfo[];
  selectedDaemonId: string;
  onSelect: (daemonId: string) => void;
}

export default function NodePicker({ daemons, selectedDaemonId, onSelect }: NodePickerProps) {
  const [expanded, setExpanded] = React.useState<boolean>(false);

  /** 获取选中的节点信息 */
  const selectedDaemon: DaemonInfo | undefined = daemons.find(
    (d: DaemonInfo) => d.uuid === selectedDaemonId
  );

  /** 处理节点选择 */
  const handleSelect = (daemonId: string): void => {
    onSelect(daemonId);
    setExpanded(false);
  };

  if (daemons.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>暂无可用节点</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.selectedInfo}>
          <Text variant="bodyMedium" style={styles.selectorText}>
            {selectedDaemon?.remarks || '选择节点'}
          </Text>
          <Text variant="bodySmall" style={styles.selectorSubtext}>
            {daemons.length} 个节点可用
          </Text>
        </View>
        <MaterialIcons
          name={expanded ? 'expand-less' : 'expand-more'}
          size={24}
          color="#9E9E9E"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.dropdown}>
          {daemons.map((daemon: DaemonInfo) => (
            <TouchableOpacity
              key={daemon.uuid}
              style={[
                styles.option,
                daemon.uuid === selectedDaemonId && styles.selectedOption,
              ]}
              onPress={() => handleSelect(daemon.uuid)}
            >
              <View style={styles.optionInfo}>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.optionText,
                    daemon.uuid === selectedDaemonId && styles.selectedOptionText,
                  ]}
                >
                  {daemon.remarks || daemon.ip}
                </Text>
                <Text variant="bodySmall" style={styles.optionSubtext}>
                  {daemon.ip}:{daemon.port} •{' '}
                  {daemon.available ? (
                    <Text style={{ color: '#4CAF50' }}>在线</Text>
                  ) : (
                    <Text style={{ color: '#F44336' }}>离线</Text>
                  )}
                </Text>
              </View>
              {daemon.uuid === selectedDaemonId && (
                <MaterialIcons name="check" size={20} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  emptyText: {
    color: '#9E9E9E',
    textAlign: 'center',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  selectedInfo: {
    flex: 1,
  },
  selectorText: {
    color: '#FFFFFF',
  },
  selectorSubtext: {
    color: '#9E9E9E',
    marginTop: 2,
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  selectedOption: {
    backgroundColor: '#4CAF5020',
  },
  optionInfo: {
    flex: 1,
  },
  optionText: {
    color: '#FFFFFF',
  },
  selectedOptionText: {
    color: '#4CAF50',
  },
  optionSubtext: {
    color: '#9E9E9E',
    marginTop: 2,
  },
});
