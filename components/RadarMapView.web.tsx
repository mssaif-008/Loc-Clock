import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, typography } from '../constants/theme';

export const RadarMapView: React.FC<any> = () => {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.errorTitle}>[ERROR] NATIVE_INTERNALS_UNAVAILABLE</Text>
        <Text style={styles.errorSub}>GEOGRAPHIC_VISUALIZER_REQUIRES_NATIVE_HARDWARE</Text>
        <Text style={styles.instruction}>PLEASE_DEPLOY_TO_IOS_OR_ANDROID_DEVICE</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    padding: 40,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: 'rgba(255, 59, 59, 0.05)',
    gap: 8,
  },
  errorTitle: {
    fontFamily: typography.monoBold,
    fontSize: 16,
    color: colors.danger,
    letterSpacing: 1,
  },
  errorSub: {
    fontFamily: typography.mono,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 2,
    marginTop: 8,
  },
  instruction: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 3,
    marginTop: 20,
    opacity: 0.8,
  },
});
