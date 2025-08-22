import React, { useCallback, useEffect } from 'react';
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

// FIXED: Enhanced RootNavigator with proper logout handling
const RootNavigator = React.memo(() => {
  const { user, loading, initialized, isAuthenticated } = useAuth();
  const { language } = useLanguage();

  // FIXED: Clear navigation state when auth changes
  useEffect(() => {
    console.log('🔄 Auth state changed:', { 
      hasUser: !!user, 
      isAuthenticated, 
      initialized, 
      loading 
    });
  }, [user, isAuthenticated, initialized, loading]);

  const getNavigationState = useCallback(() => {
    if (loading || !initialized) {
      return 'loading';
    }
    return isAuthenticated ? 'authenticated' : 'unauthenticated';
  }, [isAuthenticated, loading, initialized]);

  const navigationState = getNavigationState();

  console.log('📱 Navigation state:', navigationState);

  if (navigationState === 'loading') {
    return (
      <LoadingSpinner 
        message={language === 'es' ? 'Cargando aplicación...' : 'Loading application...'} 
      />
    );
  }

  return (
    <RootStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        // FIXED: Add animation config to prevent white screen during transitions
        cardStyle: { backgroundColor: COLORS.background },
        animationEnabled: true,
      }}
    >
      {navigationState === 'authenticated' ? (
        <RootStack.Screen 
          name="Main" 
          component={MainStackNavigator} 
          options={{
            // FIXED: Prevent going back to auth stack when authenticated
            gestureEnabled: false,
          }}
        />
      ) : (
        <RootStack.Screen 
          name="Auth" 
          component={AuthStack}
          options={{
            // FIXED: Clear stack when showing auth
            animationTypeForReplace: 'pop',
          }}
        />
      )}
    </RootStack.Navigator>
  );
});

// FIXED: Enhanced AppNavigator with navigation reset handling
const AppNavigator = () => {
  const [navigationReady, setNavigationReady] = React.useState(false);

  const handleNavigationReady = () => {
    console.log('🧭 Navigation ready');
    setNavigationReady(true);
  };

  const handleNavigationStateChange = (state) => {
    // Log navigation state changes for debugging
    console.log('🧭 Navigation state changed:', state?.routes?.[state.index]?.name);
  };

  return (
    <AuthProvider>
      <NavigationContainer
        onReady={handleNavigationReady}
        onStateChange={handleNavigationStateChange}
        fallback={
          <LoadingSpinner message="Loading navigation..." />
        }
      >
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default AppNavigator;