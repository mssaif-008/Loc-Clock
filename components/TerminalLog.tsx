import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, typography } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface LogEntry {
  timestamp: string;
  message: string;
  level?: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
}

interface TerminalLogProps {
  logs: LogEntry[];
  isOpen: boolean;
  onToggle: () => void;
}

export const TerminalLog: React.FC<TerminalLogProps> = ({ logs, isOpen, onToggle }) => {
  const scrollRef = useRef<ScrollView>(null);
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heightAnim, {
      toValue: isOpen ? 250 : 40,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [logs, isOpen]);

  return (
    <Animated.View style={[styles.container, { height: heightAnim }]}>
      <TouchableOpacity 
        style={styles.header} 
        activeOpacity={0.8} 
        onPress={onToggle}
      >
        <View style={styles.headerContent}>
          <Ionicons name="terminal-outline" size={12} color={colors.terminal} />
          <Text style={styles.headerText}>SYSTEM_LOG_FEED</Text>
        </View>
        <Ionicons 
          name={isOpen ? "chevron-down-outline" : "chevron-up-outline"} 
          size={14} 
          color={colors.textMuted} 
        />
      </TouchableOpacity>

      {isOpen && (
        <ScrollView 
          ref={scrollRef}
          style={styles.logArea}
          contentContainerStyle={styles.logContent}
        >
          {logs.map((log, index) => (
            <View key={index} style={styles.logItem}>
              <Text style={styles.timestamp}>[{log.timestamp}]</Text>
              <Text style={[
                styles.message,
                log.level === 'ERROR' && { color: colors.danger },
                log.level === 'SUCCESS' && { color: colors.accent },
                log.level === 'INFO' && { color: colors.terminal },
              ]}>
                {log.message}
              </Text>
            </View>
          ))}
          <View style={styles.cursorRow}>
            <View style={styles.cursor} />
          </View>
        </ScrollView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
  },
  header: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textMuted,
  },
  logArea: {
    flex: 1,
  },
  logContent: {
    padding: 16,
  },
  logItem: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 8,
  },
  timestamp: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  message: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.terminal,
    flex: 1,
  },
  cursorRow: {
    marginTop: 8,
  },
  cursor: {
    width: 6,
    height: 12,
    backgroundColor: colors.terminal,
  },
});
