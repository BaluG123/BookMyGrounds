import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyGroundsScreen from '../screens/admin/MyGroundsScreen';
import AddGroundScreen from '../screens/admin/AddGroundScreen';
import GroundDetailScreen from '../screens/admin/GroundDetailScreen';
import EditGroundScreen from '../screens/admin/EditGroundScreen';
import ManageSlotsScreen from '../screens/admin/ManageSlotsScreen';
import { theme } from '../utils/theme';

const Stack = createNativeStackNavigator();

export default function AdminGroundsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.colors.primaryDark,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: {
          ...theme.typography.h3,
          color: theme.colors.textMain,
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
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
        options={{ title: 'Create Turf' }}
      />
      <Stack.Screen
        name="GroundDetail"
        component={GroundDetailScreen}
        options={{ title: 'Turf Overview' }}
      />
      <Stack.Screen
        name="EditGround"
        component={EditGroundScreen}
        options={{ title: 'Edit Turf' }}
      />
      <Stack.Screen
        name="ManageSlots"
        component={ManageSlotsScreen}
        options={{ title: 'Manage Slots' }}
      />
    </Stack.Navigator>
  );
}
