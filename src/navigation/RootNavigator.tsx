import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppDispatch, useAppSelector, RootState } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCredentials, setLoading } from '../store/slices/authSlice';
import AuthNavigator from './AuthNavigator';
import AdminNavigator from './AdminNavigator';
import CustomerNavigator from './CustomerNavigator';
import GroundDetailScreen from '../screens/customer/GroundDetailScreen';
import SelectSlotScreen from '../screens/customer/SelectSlotScreen';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '../utils/theme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const RootStack = createNativeStackNavigator();

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const { token, user, isLoading } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        const storedUser = await AsyncStorage.getItem('user_data');
        if (storedToken && storedUser) {
          dispatch(
            setCredentials({
              token: storedToken,
              user: JSON.parse(storedUser),
            })
          );
        }
      } catch (e) {
        // Restore failed
      } finally {
        dispatch(setLoading(false));
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token && user ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen 
            name="MainTabs" 
            component={user.role === 'admin' ? AdminNavigator : CustomerNavigator} 
          />
          <RootStack.Screen name="GroundDetail" component={GroundDetailScreen} />
          <RootStack.Screen name="SelectSlot" component={SelectSlotScreen} />
        </RootStack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
