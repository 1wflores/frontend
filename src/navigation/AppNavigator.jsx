import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import AmenityBookingScreen from '../screens/booking/AmenityBookingScreen';
import BookingConfirmationScreen from '../screens/booking/BookingConfirmationScreen';

const RootStack = createStackNavigator();
const MainStack = createStackNavigator();

const MainStackNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={MainTabs} />
      <MainStack.Screen 
        name="AmenityBooking" 
        component={AmenityBookingScreen}
        options={{ 
          headerShown: true,
          title: 'Book Amenity',
          headerStyle: { backgroundColor: '#6264A7' },
          headerTintColor: '#FFFFFF',
        }}
      />
      <MainStack.Screen 
        name="BookingConfirmation" 
        component={BookingConfirmationScreen}
        options={{ 
          headerShown: true,
          title: 'Booking Confirmed',
          headerStyle: { backgroundColor: '#6264A7' },
          headerTintColor: '#FFFFFF',
        }}
      />
    </MainStack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <RootStack.Screen name="MainStack" component={MainStackNavigator} />
      ) : (
        <RootStack.Screen name="AuthStack" component={AuthStack} />
      )}
    </RootStack.Navigator>
  );
};

export default AppNavigator;