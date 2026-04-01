import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, typography } from '../constants/theme';
import { formatDistance } from '../utils/distance';

interface RadiusSliderProps {
  value: number; // in meters
  onValueChange: (value: number) => void;
}

export const RadiusSlider: React.FC<RadiusSliderProps> = ({ value, onValueChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>PROXIMITY_RADIUS</Text>
        <Text style={styles.value}>{formatDistance(value)}</Text>
      </View>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={50}
          maximumValue={50000} // 50km
          step={50}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent}
        />
        <View style={styles.ticksLabels}>
          <Text style={styles.tickText}>0.05KM</Text>
          <Text style={styles.tickText}>25KM</Text>
          <Text style={styles.tickText}>50KM</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  label: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textMuted,
  },
  value: {
    fontFamily: typography.mono,
    fontSize: 16,
    color: colors.terminal,
  },
  sliderContainer: {
    height: 48,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  ticksLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  tickText: {
    fontFamily: typography.mono,
    fontSize: 8,
    color: colors.textMuted,
  },
});
