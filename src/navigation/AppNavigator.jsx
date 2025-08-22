import React, { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { language, t } = useLanguage();

  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={MainTabs} />
      
      {/* Booking Flow Screens */}
      <MainStack.Screen 
        name="AmenityBooking" 
        component={AmenityBookingScreen}
        options={{ 
          headerShown: true,
          title: language === 'es' ? 'Reservar Amenidad' : 'Book Amenity',
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
          title: language === 'es' ? 'Reserva Confirmada' : 'Booking Confirmed',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.text.inverse,
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: null,
        }}
      />

      {/* Admin Screens */}
      <MainStack.Screen 
        name="AmenityReservations" 
        component={AmenityReservationsScreen}
        options={({ route }) => ({
          headerShown: true,
          title: `${route.params?.amenityName || (language === 'es' ? 'Amenidad' : 'Amenity')} ${language === 'es' ? 'Reservas' : 'Reservations'}`,
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
  const { language } = useLanguage();

  const getNavigationState = useCallback(() => {
    if (loading || !initialized) {
      return 'loading';
    }
    return user ? 'authenticated' : 'unauthenticated';
  }, [user, loading, initialized]);

  const navigationState = getNavigationState();

  if (navigationState === 'loading') {
    return <LoadingSpinner message={language === 'es' ? 'Cargando aplicación...' : 'Loading application...'} />;
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

// 🚨 FIX: Change this line - use default export instead of named export
const AppNavigator = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

// 🚨 FIX: Use default export
export default AppNavigator;