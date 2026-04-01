import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { colors, typography } from '../constants/theme';
import { RadiusSlider } from './RadiusSlider';
import { Ionicons } from '@expo/vector-icons';

interface AlarmModalProps {
  isVisible: boolean;
  destination: {
    name: string;
    distance: string;
  } | null;
  radius: number;
  onRadiusChange: (v: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isVisible,
  destination,
  radius,
  onRadiusChange,
  onConfirm,
  onCancel,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isVisible ? 0 : SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [isVisible]);

  if (!destination && !isVisible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.handle} />
      
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.waypointLabel}>WAYPOINT_DESTINATION</Text>
          <TouchableOpacity onPress={onCancel}>
            <Ionicons name="close-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <Text style={styles.destName}>{destination?.name || 'Unknown Location'}</Text>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>{destination?.distance || '--'} FROM CURRENT POS</Text>
        </View>
      </View>

      <View style={styles.body}>
        <RadiusSlider value={radius} onValueChange={onRadiusChange} />
        
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={14} color={colors.accentDim} />
          <Text style={styles.infoText}>
            DEVICE WILL INITIATE ALARM SEQUENCE UPON ENTERING THE SPECIFIED GEOGRAPHIC ZONE. 
            CONTINUOUS BACKGROUND TRACKING WILL BE ENGAGED.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.confirmButton} 
          activeOpacity={0.8}
          onPress={onConfirm}
        >
          <Text style={styles.confirmButtonText}>ARM_ALARM_SYSTEM</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.accent,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    zIndex: 1000,
  },
  handle: {
    width: 32,
    height: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 2,
  },
  header: {
    marginBottom: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  waypointLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.textMuted,
  },
  destName: {
    fontFamily: typography.display,
    fontSize: 32,
    color: colors.text,
    marginBottom: 4,
  },
  distanceBadge: {
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  distanceText: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.terminal,
    letterSpacing: 1,
  },
  body: {
    gap: 20,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(200, 245, 90, 0.05)',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textMuted,
    lineHeight: 14,
    flex: 1,
  },
  confirmButton: {
    backgroundColor: colors.accent,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonText: {
    fontFamily: typography.monoBold,
    fontSize: 14,
    color: colors.bg,
    letterSpacing: 3,
  },
});
