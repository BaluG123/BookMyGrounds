import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyGroundsScreen from '../screens/admin/MyGroundsScreen';
import AddGroundScreen from '../screens/admin/AddGroundScreen';
import GroundDetailScreen from '../screens/admin/GroundDetailScreen';
import EditGroundScreen from '../screens/admin/EditGroundScreen';
import { theme } from '../utils/theme';

const Stack = createNativeStackNavigator();

export default function AdminGroundsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          ...theme.typography.h3,
          color: theme.colors.textMain,
        },
      }}>
      <Stack.Screen 
        name="MyGroundsList" 
        component={MyGroundsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddGround" 
        component={AddGroundScreen} 
        options={{ title: 'Add New Turf' }}
      />
      <Stack.Screen 
        name="GroundDetail" 
        component={GroundDetailScreen} 
        options={{ title: 'Ground Details' }}
      />
      <Stack.Screen 
        name="EditGround" 
        component={EditGroundScreen} 
        options={{ title: 'Edit Ground' }}
      />
    </Stack.Navigator>
  );
}
