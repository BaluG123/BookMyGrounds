import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../utils/theme';
import DashboardScreen from '../screens/admin/DashboardScreen';
import AdminGroundsNavigator from './AdminGroundsNavigator';
import ProfileScreen from '../screens/shared/ProfileScreen';
import AdminBookingsScreen from '../screens/admin/AdminBookingsScreen';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'Dashboard') iconName = 'pie-chart';
          else if (route.name === 'MyGrounds') iconName = 'football';
          else if (route.name === 'Bookings') iconName = 'calendar';
          else if (route.name === 'Profile') iconName = 'person';
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="MyGrounds" component={AdminGroundsNavigator} />
      <Tab.Screen name="Bookings" component={AdminBookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
