import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors } from '../constants/theme';
import { mapStyle } from '../constants/mapStyle';

interface RadarMapViewProps {
  mapRef: React.RefObject<MapView>;
  targetLocation: { latitude: number; longitude: number; name: string } | null;
  radius: number;
  onLongPress: (e: any) => void;
  userLocation: any;
}

export const RadarMapView: React.FC<RadarMapViewProps> = ({
  mapRef,
  targetLocation,
  radius,
  onLongPress,
}) => {
  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      customMapStyle={mapStyle}
      provider={PROVIDER_GOOGLE}
      showsUserLocation
      showsMyLocationButton={false}
      onLongPress={onLongPress}
    >
      {targetLocation && (
        <>
          <Marker coordinate={targetLocation}>
            <View style={styles.customMarker}>
              <View style={styles.markerTarget} />
              <View style={styles.markerDot} />
            </View>
          </Marker>
          <Circle
            center={targetLocation}
            radius={radius}
            fillColor={colors.accent + "33"}
            strokeColor={colors.accent}
            strokeWidth={1}
          />
        </>
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerTarget: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    opacity: 0.5,
  },
  markerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});
