import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { colors } from '../constants/theme';
import { Audio } from 'expo-av';
import { 
  PlayfairDisplay_700Bold 
} from '@expo-google-fonts/playfair-display';
import { 
  IBMPlexMono_400Regular, 
  IBMPlexMono_700Bold 
} from '@expo-google-fonts/ibm-plex-mono';

// Crucial: Import the tracking hook/task so it registers with TaskManager
import '../hooks/useLocationTracking';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export {
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlayfairDisplay_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_700Bold,
  });

  const router = useRouter();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;

    // 1. Configure Audio category
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    // 2. Notification Listeners
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      if (data?.type === 'TRIGGER') {
        router.push('/alarm-trigger');
      }
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.type === 'TRIGGER') {
        router.push('/alarm-trigger');
      }
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg }
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="alarm-trigger" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      </Stack>
    </ThemeProvider>
  );
}


