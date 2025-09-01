// MainTabs.jsx - Fixed with dynamic translations
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@react-native-vector-icons/material-icons';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext'; // ✅ ADDED: Language support
import { COLORS } from '../utils/constants';

// Import screens
import DashboardScreen from '../screens/main/DashboardScreen';
import ReservationsScreen from '../screens/main/ReservationsScreen';
import AmenitiesScreen from '../screens/main/AmenitiesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { AdminTabs } from './AdminTabs';

const Tab = createBottomTabNavigator();

export const MainTabs = () => {
  const { user } = useAuth();
  const { t } = useLanguage(); // ✅ ADDED: Language hook

  // ✅ FIXED: Simple boolean check without useMemo to prevent infinite loops
  if (user?.role === 'admin') {
    return <AdminTabs />;
  }

  // Regular user interface
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Reservations':
              iconName = 'event';
              break;
            case 'Amenities':
              iconName = 'pool';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.background,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.text.inverse,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: t('home') }} // ✅ FIXED: Dynamic translation
      />
      <Tab.Screen 
        name="Reservations" 
        component={ReservationsScreen}
        options={{ title: t('reservations') }} // ✅ FIXED: Dynamic translation
      />
      <Tab.Screen 
        name="Amenities" 
        component={AmenitiesScreen}
        options={{ title: t('amenities') }} // ✅ FIXED: Dynamic translation
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: t('profile') }} // ✅ FIXED: Dynamic translation
      />
    </Tab.Navigator>
  );
};