import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { authAPI } from '../api/auth';
import { openFromNotification } from '../navigation/navigationService';

const PUSH_TOKEN_STORAGE_KEY = 'push_token';

async function syncPushToken(token: string) {
  const previousToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);

  if (previousToken && previousToken !== token) {
    try {
      await authAPI.unregisterPushToken(previousToken);
    } catch (error) {
      console.log('Failed to unregister previous push token', error);
    }
  }

  await authAPI.registerPushToken({
    token,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
    device_name: Platform.OS === 'ios' ? 'iPhone' : 'Android Device',
  });

  await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
}

export async function initializePushNotifications() {
  try {
    await messaging().registerDeviceForRemoteMessages();
  } catch (error) {
    console.log('registerDeviceForRemoteMessages failed', error);
  }

  const authStatus = await messaging().requestPermission();
  const permissionGranted =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!permissionGranted && Platform.OS === 'ios') {
    return () => {};
  }

  const token = await messaging().getToken();
  if (token) {
    await syncPushToken(token);
  }

  const unsubscribeTokenRefresh = messaging().onTokenRefresh(async nextToken => {
    try {
      await syncPushToken(nextToken);
    } catch (error) {
      console.log('Push token refresh sync failed', error);
    }
  });

  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('Foreground push received', remoteMessage?.messageId || remoteMessage?.notification?.title);
  });

  const unsubscribeOpened = messaging().onNotificationOpenedApp(remoteMessage => {
    openFromNotification(remoteMessage?.data);
  });

  const initialNotification = await messaging().getInitialNotification();
  if (initialNotification?.data) {
    setTimeout(() => {
      openFromNotification(initialNotification.data);
    }, 300);
  }

  return () => {
    unsubscribeTokenRefresh();
    unsubscribeForeground();
    unsubscribeOpened();
  };
}

export async function unregisterCurrentPushToken() {
  const token = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
  if (!token) {
    return;
  }

  try {
    await authAPI.unregisterPushToken(token);
  } catch (error) {
    console.log('Push unregister failed', error);
  } finally {
    await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
  }
}
