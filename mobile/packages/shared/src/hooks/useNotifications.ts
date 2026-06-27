import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { api } from '../api/client';

type NavigationRef = { current: { navigate: (name: string, params?: any) => void } | null };

export function useNotifications(navigationRef?: NavigationRef) {
  const responseListener = useRef<any>();

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('easyryde_default', {
        name: 'EasyRyde',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFAD7A',
      }).catch(() => {});
    }

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data;
      if (data?.rideId && navigationRef?.current) {
        navigationRef.current.navigate('RideTracking', { rideId: data.rideId });
      }
    });

    registerForPushNotificationsAsync().catch(() => {});

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
}

async function registerForPushNotificationsAsync() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    if (!Device.isDevice) return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    try {
      await api.post('/notifications/register-token', { token: tokenData.data });
    } catch {
      // Silent fail - notification registration is non-critical
    }
  } catch {
    // Silent fail - notification setup is non-critical
  }
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: null,
  });
}
