import React from 'react';
import { Tabs } from 'expo-router';
import { colors, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        },
        tabBarLabelStyle: {
          fontFamily: typography.mono,
          fontSize: 10,
          letterSpacing: 1,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'RADAR',
          tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alarms"
        options={{
          title: 'WAYPOINTS',
          tabBarIcon: ({ color }) => <Ionicons name="alarm-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}


