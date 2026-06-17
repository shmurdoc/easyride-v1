import * as Location from 'expo-location';
import { Platform } from 'react-native';

export async function requestLocationPermissions(): Promise<boolean> {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') return false;

  if (Platform.OS === 'android') {
    const background = await Location.requestBackgroundPermissionsAsync();
    return background.status === 'granted';
  }
  return true;
}

export async function getCurrentPosition(): Promise<Location.LocationObject | null> {
  try {
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  } catch {
    return null;
  }
}
