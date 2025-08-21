import React, { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext'; // ✅ ADDED: Language support
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
  const { language, t } = useLanguage(); // ✅ ADDED: Language hook

  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={MainTabs} />
      
      {/* Booking Flow Screens */}
      <MainStack.Screen 
        name="AmenityBooking" 
        component={AmenityBookingScreen}
        options={{ 
          headerShown: true,
          title: language === 'es' ? 'Reservar Amenidad' : 'Book Amenity', // ✅ FIXED: Dynamic translation
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
          title: language === 'es' ? 'Reserva Confirmada' : 'Booking Confirmed', // ✅ FIXED: Dynamic translation
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.text.inverse,
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: null, // Prevent going back
        }}
      />

      {/* Admin Screens */}
      <MainStack.Screen 
        name="AmenityReservations" 
        component={AmenityReservationsScreen}
        options={({ route }) => ({
          headerShown: true,
          title: `${route.params?.amenityName || (language === 'es' ? 'Amenidad' : 'Amenity')} ${language === 'es' ? 'Reservas' : 'Reservations'}`, // ✅ FIXED: Dynamic translation
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
  const { language } = useLanguage(); // ✅ ADDED: Language hook

  // Memoize the navigation state logic
  const getNavigationState = useCallback(() => {
    if (loading || !initialized) {
      return 'loading';
    }
    return user ? 'authenticated' : 'unauthenticated';
  }, [user, loading, initialized]);

  const navigationState = getNavigationState();

  if (navigationState === 'loading') {
    return <LoadingSpinner message={language === 'es' ? 'Cargando aplicación...' : 'Loading application...'} />; // ✅ FIXED: Translation
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {navigationState === 'authenticated' ? (
        <RootStack.Screen name="Main" component={MainStackNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthStack} />
      )}
    </RootStack.Navigator>
  );
});

export const AppNavigator = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};