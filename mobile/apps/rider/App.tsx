import React, { useState, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useNotifications, SplashScreen, ErrorBoundary } from '@easyryde/shared';
import { COLORS } from '@easyryde/shared';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import BookRideScreen from './screens/BookRideScreen';
import RideTrackingScreen from './screens/RideTrackingScreen';
import RideHistoryScreen from './screens/RideHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen';
import PaymentScreen from './screens/PaymentScreen';
import RestaurantListScreen from './screens/RestaurantListScreen';
import RestaurantMenuScreen from './screens/RestaurantMenuScreen';
import FoodCheckoutScreen from './screens/FoodCheckoutScreen';
import FoodOrderTrackingScreen from './screens/FoodOrderTrackingScreen';
import WalletScreen from './screens/WalletScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Activity') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activity" component={RideHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const [isSplash, setIsSplash] = useState(true);

  useNotifications(navigationRef);

  if (isLoading) return null;

  if (isSplash) {
    return <SplashScreen onFinish={() => setIsSplash(false)} duration={2000} />;
  }

  return (
    <ErrorBoundary>
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={HomeTabs} />
            <Stack.Screen name="BookRide" component={BookRideScreen} />
            <Stack.Screen name="RideTracking" component={RideTrackingScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="RestaurantList" component={RestaurantListScreen} />
            <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} />
            <Stack.Screen name="FoodCheckout" component={FoodCheckoutScreen} />
            <Stack.Screen name="FoodOrderTracking" component={FoodOrderTrackingScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} options={{ animation: 'slide_from_bottom' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </ErrorBoundary>
  );
}
