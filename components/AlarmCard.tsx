import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDistance } from '../utils/distance';

interface AlarmCardProps {
  alarm: {
    id: string;
    destination: {
      name: string;
      latitude: number;
      longitude: number;
    };
    radius: number;
    status: 'ARMED' | 'TRIGGERED' | 'DISMISSED';
    createdAt: string;
  };
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export const AlarmCard: React.FC<AlarmCardProps> = ({ alarm, onDelete, onToggle }) => {
  const isArmed = alarm.status === 'ARMED';
  const isTriggered = alarm.status === 'TRIGGERED';

  return (
    <View style={[
      styles.container, 
      isArmed && styles.containerArmed,
      isTriggered && styles.containerTriggered
    ]}>
      <View style={styles.leftBorder} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.destName} numberOfLines={1}>{alarm.destination.name}</Text>
          <View style={[styles.statusBadge, isArmed && styles.statusBadgeArmed, isTriggered && styles.statusBadgeTriggered]}>
            <Text style={styles.statusText}>{alarm.status}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>RADIUS</Text>
            <Text style={styles.detailValue}>{formatDistance(alarm.radius)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>COORDS</Text>
            <Text style={styles.detailValue}>{alarm.destination.latitude.toFixed(4)}, {alarm.destination.longitude.toFixed(4)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onToggle(alarm.id)}
          >
            <Ionicons 
              name={isArmed ? "pause-outline" : "play-outline"} 
              size={18} 
              color={isArmed ? colors.textMuted : colors.accent} 
            />
            <Text style={[styles.actionText, !isArmed && { color: colors.accent }]}>
              {isArmed ? 'DEACTIVATE' : 'RE-ARM'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onDelete(alarm.id)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={[styles.actionText, { color: colors.danger }]}>DELETE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  containerArmed: {
    borderColor: colors.accentDim,
  },
  containerTriggered: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(255, 59, 59, 0.05)',
  },
  leftBorder: {
    width: 4,
    backgroundColor: colors.border,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  destName: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  statusBadgeArmed: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(200, 245, 90, 0.1)',
  },
  statusBadgeTriggered: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(255, 59, 59, 0.2)',
  },
  statusText: {
    fontFamily: typography.mono,
    fontSize: 8,
    letterSpacing: 1,
    color: colors.text,
  },
  details: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  detailItem: {},
  detailLabel: {
    fontFamily: typography.mono,
    fontSize: 8,
    color: colors.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.textMuted,
  },
});
