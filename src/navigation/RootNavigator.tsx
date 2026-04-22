import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, Animated, Image, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector, RootState } from '../store';
import { setCredentials, setLoading } from '../store/slices/authSlice';
import AuthNavigator from './AuthNavigator';
import AdminNavigator from './AdminNavigator';
import CustomerNavigator from './CustomerNavigator';
import GroundDetailScreen from '../screens/customer/GroundDetailScreen';
import SelectSlotScreen from '../screens/customer/SelectSlotScreen';
import PaymentScreen from '../screens/customer/PaymentScreen';
import WriteReviewScreen from '../screens/customer/WriteReviewScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import PayoutProfileScreen from '../screens/shared/PayoutProfileScreen';
import CustomerBookingDetailScreen from '../screens/customer/CustomerBookingDetailScreen';
import AdminBookingDetailScreen from '../screens/admin/AdminBookingDetailScreen';
import { initializePushNotifications } from '../utils/pushNotifications';
import { navigationRef } from './navigationService';
import { navigationTheme, theme } from '../utils/theme';

const RootStack = createNativeStackNavigator();
const APP_LOGO = require('../assets/branding/bookmygrounds-logo-1024.png');

function SplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo scale & fade in
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing activity indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacityAnim, pulseAnim, scaleAnim]);

  return (
    <View style={styles.loadingScreen}>
      <Animated.View
        style={[
          styles.loadingCard,
          { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.loadingBadge}>
          <Image source={APP_LOGO} style={styles.loadingLogo} resizeMode="contain" />
        </View>
        <Text style={styles.loadingEyebrow}>BOOKMYGROUNDS</Text>
        <Text style={styles.loadingTitle}>Book better grounds, faster</Text>
        <Text style={styles.loadingSubtitle}>
          Live slots, secure checkout, and venue-ready operations in one app.
        </Text>
        <Animated.View style={{ opacity: pulseAnim, marginTop: theme.spacing.xl }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </Animated.View>
        <Text style={styles.versionText}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

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

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    let cleanup: undefined | (() => void);

    initializePushNotifications()
      .then(unsubscribe => {
        cleanup = unsubscribe;
      })
      .catch(error => {
        console.log('Push notification setup failed', error);
      });

    return () => {
      cleanup?.();
    };
  }, [token, user]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme} ref={navigationRef}>
      {token && user ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen
            name="MainTabs"
            component={user.role === 'admin' ? AdminNavigator : CustomerNavigator}
          />
          <RootStack.Screen name="GroundDetail" component={GroundDetailScreen} />
          <RootStack.Screen name="SelectSlot" component={SelectSlotScreen} />
          <RootStack.Screen name="Payment" component={PaymentScreen} />
          <RootStack.Screen name="WriteReview" component={WriteReviewScreen} />
          <RootStack.Screen name="CustomerBookingDetail" component={CustomerBookingDetailScreen} />
          <RootStack.Screen name="AdminBookingDetail" component={AdminBookingDetailScreen} />
          <RootStack.Screen name="Notifications" component={NotificationsScreen} />
          <RootStack.Screen name="PayoutProfile" component={PayoutProfileScreen} />
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
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.strong,
  },
  loadingBadge: {
    width: 110,
    height: 110,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.l,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  loadingLogo: {
    width: 82,
    height: 82,
  },
  loadingEyebrow: {
    ...theme.typography.caption,
    color: '#9CCAFF',
    marginBottom: theme.spacing.s,
  },
  loadingTitle: {
    ...theme.typography.h1,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  loadingSubtitle: {
    ...theme.typography.bodyM,
    color: '#B3C7DC',
    textAlign: 'center',
  },
  versionText: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.3)',
    marginTop: theme.spacing.l,
  },
});
