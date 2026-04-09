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
        tabBarInactiveTintColor: theme.colors.textSoft,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 18,
          height: 72,
          borderTopWidth: 0,
          borderRadius: 28,
          backgroundColor: theme.colors.tabBar,
          paddingTop: 12,
          paddingBottom: 12,
          ...theme.shadows.strong,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName = 'ellipse';
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'MyGrounds') iconName = focused ? 'football' : 'football-outline';
          else if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Icon name={iconName} size={24} color={color} />;
        },
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="MyGrounds" component={AdminGroundsNavigator} />
      <Tab.Screen name="Bookings" component={AdminBookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
