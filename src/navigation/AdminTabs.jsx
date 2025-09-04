// AdminTabs.jsx - Fixed with proper localization support
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../contexts/LanguageContext';
import { COLORS } from '../utils/constants';

// Import admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ReservationManagementScreen from '../screens/admin/ReservationManagementScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AmenityManagementScreen from '../screens/admin/AmenityManagementScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

export const AdminTabs = () => {
  const { language, t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'AdminDashboard':
              iconName = 'dashboard';
              break;
            case 'Reservations':
              iconName = 'event';
              break;
            case 'Users':
              iconName = 'people';
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
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        options={{ title: t('dashboard') }}
      />
      <Tab.Screen 
        name="Reservations" 
        component={ReservationManagementScreen}
        options={{ title: t('reservations') }}
      />
      <Tab.Screen 
        name="Users" 
        component={UserManagementScreen}
        options={{ 
          title: language === 'es' ? 'Usuarios' : 'Users'
        }}
      />
      <Tab.Screen 
        name="Amenities" 
        component={AmenityManagementScreen}
        options={{ title: t('amenities') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: t('profile') }}
      />
    </Tab.Navigator>
  );
};