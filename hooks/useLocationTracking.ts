import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { haversineDistance } from '../utils/distance';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export const LOCATION_TASK_NAME = 'background-location-task';

// Define the background task (Native only)
if (Platform.OS !== 'web') {
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
      console.error('[TASK] Error in background location task:', error);
      return;
    }
    if (data) {
      const { locations } = data as any;
      const location = locations[0];
      if (location) {
        const { latitude, longitude } = location.coords;
        
        // Load stored alarms
        const storedAlarms = await AsyncStorage.getItem('waypoint_alarms');
        if (storedAlarms) {
          const alarms = JSON.parse(storedAlarms);
          const activeAlarms = alarms.filter((a: any) => a.status === 'ARMED');
          
          for (const alarm of activeAlarms) {
            const distance = haversineDistance(
              latitude,
              longitude,
              alarm.destination.latitude,
              alarm.destination.longitude
            );
            
            if (distance <= alarm.radius) {
              await triggerAlarm(alarm);
            }
          }
        }
      }
    }
  });
}

async function triggerAlarm(alarm: any) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'DESTINATION REACHED',
      body: `You have entered the radius of ${alarm.destination.name}.`,
      sound: 'alarm.wav',
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: { alarmId: alarm.id, type: 'TRIGGER' },
    },
    trigger: null,
  });
  
  const storedAlarms = await AsyncStorage.getItem('waypoint_alarms');
  if (storedAlarms) {
    const alarms = JSON.parse(storedAlarms);
    const updatedAlarms = alarms.map((a: any) => 
      a.id === alarm.id ? { ...a, status: 'TRIGGERED', triggeredAt: new Date().toISOString() } : a
    );
    await AsyncStorage.setItem('waypoint_alarms', JSON.stringify(updatedAlarms));
  }
}

export function useLocationTracking() {
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    checkTrackingStatus();
  }, []);

  const checkTrackingStatus = async () => {
    if (Platform.OS === 'web') return;
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      setIsTracking(hasStarted);
    } catch (err) {
      console.warn('[TRACKING] Failed to check status:', err);
    }
  };

  const startTracking = async () => {
    if (Platform.OS === 'web') {
      console.warn('Background tracking is not supported on web.');
      return;
    }

    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        throw new Error('LOCATION_ACCESS_DENIED: Foreground permission is required.');
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        throw new Error('BACKGROUND_ACCESS_DENIED: Please set location to "Allow all the time" in system settings.');
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
        deferredUpdatesInterval: 5000,
        foregroundService: {
          notificationTitle: 'WAYPOINT ACTIVE',
          notificationBody: 'Monitoring your destination...',
          notificationColor: '#C8F55A',
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });
      
      setIsTracking(true);
    } catch (err: any) {
      console.error('[TRACKING] Start error:', err);
      throw err;
    }
  };


  const stopTracking = async () => {
    if (Platform.OS === 'web') return;
    try {
      const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (isRunning) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
      setIsTracking(false);
    } catch (err) {
      console.error('[TRACKING] Stop error:', err);
    }
  };


  return { isTracking, startTracking, stopTracking };
}

