import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../utils/constants';

// Import admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ReservationManagementScreen from '../screens/admin/ReservationManagementScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AmenityManagementScreen from '../screens/admin/AmenityManagementScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

// 🔥 SIMPLIFIED: Admin-only navigation without nested stacks
export const AdminTabs = () => {
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
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Reservations" 
        component={ReservationManagementScreen}
        options={{ title: 'Reservations' }}
      />
      <Tab.Screen 
        name="Users" 
        component={UserManagementScreen}
        options={{ title: 'Users' }}
      />
      <Tab.Screen 
        name="Amenities" 
        component={AmenityManagementScreen}
        options={{ title: 'Amenities' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};