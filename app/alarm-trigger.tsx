import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { colors, typography } from '../constants/theme';
import { useAlarmSound } from '../hooks/useAlarmSound';
import * as Haptics from 'expo-haptics';
import { useNavigation, useLocalSearchParams, useRouter } from 'expo-router';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { NoiseOverlay } from '../components/NoiseOverlay';
import { Ionicons } from '@expo/vector-icons';

export default function AlarmTriggerScreen() {
  const { playSound, stopSound } = useAlarmSound();
  const { stopTracking } = useLocationTracking();
  const router = useRouter();
  const flashAnim = new Animated.Value(0);

  useEffect(() => {
    // Start Alarm Effects
    playSound();
    
    const hapticInterval = setInterval(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }, 1000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 500, useNativeDriver: false }),
      ])
    ).start();

    return () => {
      clearInterval(hapticInterval);
      stopSound();
    };
  }, []);

  const handleDismiss = async () => {
    await stopSound();
    await stopTracking();
    router.replace('/(tabs)');
  };

  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.bg, '#3d0a0a'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <NoiseOverlay />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.alertLabel}>CRITICAL_EVENT_DETECTED</Text>
          <Text style={styles.alertTitle}>DESTINATION_REACHED</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={120} color={colors.danger} />
          </View>
          
          <Text style={styles.message}>
            YOU HAVE ENTERED THE PROXIMITY RADIUS OF YOUR SPECIFIED WAYPOINT. 
            GEOGRAPHIC LOCK SECURED.
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>DISTANCE</Text>
              <Text style={styles.statValue}>~0.0M</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>STATUS</Text>
              <Text style={styles.statValue}>ARRIVED</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.dismissButton} 
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissText}>DISMISS_ALARM</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.snoozeButton} 
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.snoozeText}>SNOOZE_+200M</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 30,
  },
  header: {
    paddingTop: 40,
    alignItems: 'center',
  },
  alertLabel: {
    fontFamily: typography.mono,
    fontSize: 12,
    color: colors.danger,
    letterSpacing: 4,
    marginBottom: 8,
  },
  alertTitle: {
    fontFamily: typography.display,
    fontSize: 42,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  iconContainer: {
    padding: 20,
  },
  message: {
    fontFamily: typography.mono,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 40,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: typography.monoBold,
    fontSize: 18,
    color: colors.accent,
  },
  footer: {
    gap: 16,
    paddingBottom: 40,
  },
  dismissButton: {
    backgroundColor: colors.danger,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    fontFamily: typography.monoBold,
    fontSize: 18,
    color: colors.text,
    letterSpacing: 4,
  },
  snoozeButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  snoozeText: {
    fontFamily: typography.mono,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 2,
  },
});
