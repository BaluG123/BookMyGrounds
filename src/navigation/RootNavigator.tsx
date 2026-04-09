import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector, RootState } from '../store';
import { setCredentials, setLoading } from '../store/slices/authSlice';
import AuthNavigator from './AuthNavigator';
import AdminNavigator from './AdminNavigator';
import CustomerNavigator from './CustomerNavigator';
import GroundDetailScreen from '../screens/customer/GroundDetailScreen';
import SelectSlotScreen from '../screens/customer/SelectSlotScreen';
import { navigationTheme, theme } from '../utils/theme';

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
            }),
          );
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingEyebrow}>BOOKMYGROUNDS</Text>
          <Text style={styles.loadingTitle}>Setting up your arena</Text>
          <Text style={styles.loadingSubtitle}>Restoring your last session and preparing the new interface.</Text>
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loadingIndicator} />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
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

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.strong,
  },
  loadingEyebrow: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  loadingTitle: {
    ...theme.typography.h1,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.s,
  },
  loadingSubtitle: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
  },
  loadingIndicator: {
    marginTop: theme.spacing.xl,
  },
});
