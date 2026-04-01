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
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => onToggle(alarm.id)}
      style={[
        styles.container, 
        isTriggered && styles.containerTriggered
      ]}
    >
      <View style={styles.mainInfo}>
        <Text style={styles.radiusText}>{formatDistance(alarm.radius)}</Text>
        <Text style={styles.destName} numberOfLines={1}>{alarm.destination.name}</Text>
      </View>
      
      <View style={styles.rightSection}>
        <TouchableOpacity 
          style={styles.toggleArea} 
          onPress={() => onToggle(alarm.id)}
        >
          <Ionicons 
            name={isArmed ? "radio-button-on" : "radio-button-off"} 
            size={28} 
            color={isArmed ? colors.accent : colors.textMuted} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => onDelete(alarm.id)}
        >
          <Ionicons name="close-circle-outline" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  containerTriggered: {
    backgroundColor: 'rgba(255, 59, 59, 0.05)',
  },
  mainInfo: {
    flex: 1,
  },
  radiusText: {
    fontFamily: typography.display,
    fontSize: 42,
    color: colors.accent,
    marginBottom: -4,
  },
  destName: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.text,
    opacity: 0.8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toggleArea: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
});

