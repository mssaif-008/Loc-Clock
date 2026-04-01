import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography } from '../../constants/theme';
import { AlarmCard } from '../../components/AlarmCard';
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
      setAlarms(JSON.parse(stored).reverse());
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
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Waypoints</Text>
          <Text style={styles.subtitle}>{alarms.length} ACTIVE_SENSORS</Text>
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
              <Ionicons name="radio-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>NO_WAYPOINTS_DEFINED</Text>
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
    padding: 30,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 48,
    color: colors.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 2,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 30,
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

