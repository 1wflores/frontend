import React, { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { COLORS } from '../utils/constants';

import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

// Booking screens
import AmenityBookingScreen from '../screens/booking/AmenityBookingScreen';
import BookingConfirmationScreen from '../screens/booking/BookingConfirmationScreen';

// Admin screens for navigation
import AmenityReservationsScreen from '../screens/admin/AmenityReservationsScreen';

const RootStack = createStackNavigator();
const MainStack = createStackNavigator();

const MainStackNavigator = React.memo(() => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={MainTabs} />
      
      {/* Booking Flow Screens */}
      <MainStack.Screen 
        name="AmenityBooking" 
        component={AmenityBookingScreen}
        options={{ 
          headerShown: true,
          title: 'Book Amenity',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.text.inverse,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <MainStack.Screen 
        name="BookingConfirmation" 
        component={BookingConfirmationScreen}
        options={{ 
          headerShown: true,
          title: 'Booking Confirmed',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.text.inverse,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      {/* Admin Screens */}
      <MainStack.Screen 
        name="AmenityReservations" 
        component={AmenityReservationsScreen}
        options={({ route }) => ({
          headerShown: true,
          title: `${route.params?.amenityName || 'Amenity'} Reservations`,
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.text.inverse,
          headerTitleStyle: { fontWeight: 'bold' },
        })}
      />
    </MainStack.Navigator>
  );
});

const RootNavigator = React.memo(() => {
  const { user, loading, initialized } = useAuth();

  // Memoize the navigation state logic
  const getNavigationState = useCallback(() => {
    if (loading || !initialized) {
      return 'loading';
    }
    return user ? 'authenticated' : 'unauthenticated';
  }, [user, loading, initialized]);

  const navigationState = getNavigationState();

  if (navigationState === 'loading') {
    return <LoadingSpinner message="Loading application..." />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {navigationState === 'authenticated' ? (
        <RootStack.Screen name="MainStack" component={MainStackNavigator} />
      ) : (
        <RootStack.Screen name="AuthStack" component={AuthStack} />
      )}
    </RootStack.Navigator>
  );
});

const AppNavigator = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default AppNavigator;