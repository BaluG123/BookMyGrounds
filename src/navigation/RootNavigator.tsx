import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCredentials, setLoading } from '../store/slices/authSlice';
import AuthNavigator from './AuthNavigator';
import AdminNavigator from './AdminNavigator';
import CustomerNavigator from './CustomerNavigator';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '../utils/theme';

export default function RootNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user, isLoading } = useSelector((state: RootState) => state.auth);

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
        user.role === 'admin' ? (
          <AdminNavigator />
        ) : (
          <CustomerNavigator />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
