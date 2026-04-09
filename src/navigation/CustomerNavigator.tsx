import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../utils/theme';
import HomeScreen from '../screens/customer/HomeScreen';
import SearchScreen from '../screens/customer/SearchScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import CustomerBookingsScreen from '../screens/customer/CustomerBookingsScreen';
import FavoritesScreen from '../screens/customer/FavoritesScreen';

const Tab = createBottomTabNavigator();

export default function CustomerNavigator() {
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
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Favorites') iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Icon name={iconName} size={24} color={color} />;
        },
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Bookings" component={CustomerBookingsScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
