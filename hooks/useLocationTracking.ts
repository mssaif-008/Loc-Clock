import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { haversineDistance } from '../utils/distance';
import { useEffect, useState } from 'react';

export const LOCATION_TASK_NAME = 'background-location-task';

// Define the background task
// This needs to be defined in the global scope, usually at the top level of the app
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
            // Trigger Alarm!
            await triggerAlarm(alarm);
          }
        }
      }
    }
  }
});

async function triggerAlarm(alarm: any) {
  // 1. Send Notification
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
  
  // 2. Update status in AsyncStorage
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
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    setIsTracking(hasStarted);
  };

  const startTracking = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      throw new Error('Foreground location permission denied');
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      throw new Error('Background location permission denied');
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10, // Update every 10 meters
      deferredUpdatesInterval: 5000, // Or every 5 seconds
      foregroundService: {
        notificationTitle: 'WAYPOINT ACTIVE',
        notificationBody: 'Monitoring your destination...',
        notificationColor: '#C8F55A',
      },
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
    });
    
    setIsTracking(true);
  };

  const stopTracking = async () => {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    setIsTracking(false);
  };

  return { isTracking, startTracking, stopTracking };
}
