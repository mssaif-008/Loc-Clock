import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const NoiseOverlay: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['rgba(18, 18, 18, 0.05)', 'rgba(10, 10, 10, 0.05)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.scanlines} />
    </View>
  );
};

const styles = StyleSheet.create({
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.03,
    // We can't do repeating patterns easily without SVGs or Images, 
    // so we'll just use a subtle gradient to simulate depth
  }
});
