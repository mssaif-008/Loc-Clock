import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography } from '../../constants/theme';
import { AlarmCard } from '../../components/AlarmCard';
import { NoiseOverlay } from '../../components/NoiseOverlay';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AlarmsScreen() {
  const [alarms, setAlarms] = useState<any[]>([]);

  useEffect(() => {
    loadAlarms();
  }, []);

  const loadAlarms = async () => {
    const stored = await AsyncStorage.getItem('waypoint_alarms');
    if (stored) {
      setAlarms(JSON.parse(stored).reverse()); // Newest first
    }
  };

  const deleteAlarm = async (id: string) => {
    const updated = alarms.filter(a => a.id !== id);
    setAlarms(updated);
    await AsyncStorage.setItem('waypoint_alarms', JSON.stringify(updated.reverse()));
  };

  const toggleAlarm = async (id: string) => {
    const updated = alarms.map(a => {
      if (a.id === id) {
        return { ...a, status: a.status === 'ARMED' ? 'DISMISSED' : 'ARMED' };
      }
      return a;
    });
    setAlarms(updated);
    await AsyncStorage.setItem('waypoint_alarms', JSON.stringify(updated.reverse()));
  };

  return (
    <View style={styles.container}>
      <NoiseOverlay />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>DEPLOYMENT_LOGS</Text>
          <Text style={styles.subtitle}>ACTIVE_GEOFENCE_REGISTRY</Text>
        </View>

        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <AlarmCard 
              alarm={item} 
              onDelete={deleteAlarm} 
              onToggle={toggleAlarm} 
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="scan-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>NO_ACTIVE_WAYPOINTS_DETECTED</Text>
            </View>
          }
        />
      </SafeAreaView>
      
      <LinearGradient
        colors={['transparent', colors.bg]}
        style={styles.bottomFade}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 32,
    color: colors.accent,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    pointerEvents: 'none',
  },
});
