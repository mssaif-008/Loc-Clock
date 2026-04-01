import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, Dimensions, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { colors, typography } from '../../constants/theme';
import { TerminalLog, LogEntry } from '../../components/TerminalLog';
import { AlarmModal } from '../../components/AlarmModal';
import { NoiseOverlay } from '../../components/NoiseOverlay';
import { RadarMapView } from '../../components/RadarMapView';
import { haversineDistance, formatDistance } from '../../utils/distance';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const WAYPOINT_CURSOR = "█";

export default function RadarScreen() {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [targetLocation, setTargetLocation] = useState<{ latitude: number, longitude: number, name: string } | null>(null);
  const [radius, setRadius] = useState(500); // 500m default
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const mapRef = useRef<any>(null);
  const { startTracking, stopTracking, isTracking } = useLocationTracking();
  
  // Animation for pulsing radius
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1500 }), -1, true);
    
    (async () => {
      addLog("SYSTEM_BOOT_SEQUENCE_COMPLETE", "SUCCESS");
      addLog("INITIALIZING_RADAR_ARRAY...");
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        addLog("ERROR: LOCATION_ACCESS_DENIED", "ERROR");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      addLog("SIGNAL_LOCK_ACQUIRED", "SUCCESS");
    })();
  }, []);

  const addLog = (message: string, level: LogEntry['level'] = 'INFO') => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs(prev => [...prev, { timestamp, message, level }]);
  };

  const handleLongPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    try {
      const reverse = await Location.reverseGeocodeAsync(coords);
      const name = reverse[0]?.name || reverse[0]?.street || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
      
      setTargetLocation({ ...coords, name });
      setIsModalVisible(true);
      addLog(`TARGET_ACQUIRED: ${name.toUpperCase()}`);
    } catch (err) {
      addLog("ERROR: SEO_COORD_LOOKUP_FAILED", "ERROR");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    addLog(`SCANNING_FOR_DESTINATION: ${searchQuery.toUpperCase()}...`);
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        const coords = results[0];
        const reverse = await Location.reverseGeocodeAsync(coords);
        const name = reverse[0]?.name || reverse[0]?.street || searchQuery;
        
        setTargetLocation({ ...coords, name });
        mapRef.current?.animateToRegion?.({
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setIsModalVisible(true);
        addLog(`SIGNAL_LOCATION_MATCHED: ${name.toUpperCase()}`, "SUCCESS");
      } else {
        addLog("ERROR: NO_RESULTS_FOUND", "ERROR");
      }
    } catch (err) {
      addLog("ERROR: GEOCODE_SERVICE_TIMEOUT", "ERROR");
    }
  };

  const armAlarm = async () => {
    if (!targetLocation) return;
    
    addLog("INITIATING_DEPLOYMENT_SEQUENCE...");
    
    const newAlarm = {
      id: Date.now().toString(),
      destination: targetLocation,
      radius: radius,
      status: 'ARMED',
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = await AsyncStorage.getItem('waypoint_alarms');
      const alarms = existing ? JSON.parse(existing) : [];
      await AsyncStorage.setItem('waypoint_alarms', JSON.stringify([...alarms, newAlarm]));
      
      await startTracking();
      
      setIsModalVisible(false);
      addLog("WAYPOINT_SECURED_AND_TRACKING", "SUCCESS");
    } catch (err) {
      addLog("ERROR: SYSTEM_MEMORY_WRITE_FAILURE", "ERROR");
    }
  };

  const currentDistance = userLocation && targetLocation 
    ? haversineDistance(
        userLocation.coords.latitude, 
        userLocation.coords.longitude, 
        targetLocation.latitude, 
        targetLocation.longitude
      )
    : null;

  return (
    <View style={styles.container}>
      <NoiseOverlay />
      
      <RadarMapView
        mapRef={mapRef}
        targetLocation={targetLocation}
        radius={radius}
        onLongPress={handleLongPress}
        userLocation={userLocation}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>WAYPOINT{WAYPOINT_CURSOR}</Text>
            <Text style={styles.appSubtitle}>OPERATIONAL_STATUS: {isTracking ? 'ACTIVE' : 'IDLE'}</Text>
          </View>
          <TouchableOpacity style={styles.pingButton} onPress={() => mapRef.current?.animateToRegion?.({
            latitude: userLocation?.coords.latitude || 0,
            longitude: userLocation?.coords.longitude || 0,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          })}>
            <Ionicons name="navigate-circle-outline" size={32} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="SEARCH_COORDINATES..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchIcon} onPress={handleSearch}>
            <Ionicons name="search" size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <AlarmModal
        isVisible={isModalVisible}
        destination={targetLocation ? {
          name: targetLocation.name,
          distance: formatDistance(currentDistance || 0)
        } : null}
        radius={radius}
        onRadiusChange={setRadius}
        onConfirm={armAlarm}
        onCancel={() => setIsModalVisible(false)}
      />

      <TerminalLog 
        logs={logs} 
        isOpen={isLogOpen} 
        onToggle={() => setIsLogOpen(!isLogOpen)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Platform.OS === 'android' ? 40 : 0,
  },
  appTitle: {
    fontFamily: typography.display,
    fontSize: 48,
    color: colors.accent,
    letterSpacing: -1,
  },
  appSubtitle: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    marginTop: -4,
  },
  pingButton: {
    padding: 8,
  },
  searchContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.mono,
    fontSize: 12,
    color: colors.text,
  },
  searchIcon: {
    paddingLeft: 12,
  },
});

