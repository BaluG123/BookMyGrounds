import { Alert, Platform, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { authAPI } from '../api/auth';
import { openFromNotification } from '../navigation/navigationService';
import { emitNotificationEvent } from './notificationEvents';

const PUSH_TOKEN_STORAGE_KEY = 'push_token';

async function setupAndroidNotificationChannel() {
  if (Platform.OS !== 'android') return;

  try {
    // Create a high-importance channel with vibration and default sound
    // The android property exists at runtime but isn't in all TS definitions
    const msg = messaging() as any;
    if (msg.android?.createChannel) {
      await msg.android.createChannel({
        id: 'bookmygrounds_default',
        name: 'BookMyGrounds Notifications',
        importance: 4, // HIGH
        vibration: true,
        vibrationPattern: [0, 300, 100, 300],
        sound: 'default',
      });
    }
  } catch (error) {
    console.log('Notification channel setup skipped or failed', error);
  }
}

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

  // Set up Android notification channel with vibration & sound
  await setupAndroidNotificationChannel();

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
    emitNotificationEvent();

    // Vibrate with a double-pulse pattern: [wait, vibrate, pause, vibrate]
    Vibration.vibrate([0, 300, 100, 300]);

    const title = remoteMessage?.notification?.title || 'New update';
    const body = remoteMessage?.notification?.body || 'Open notifications to view the latest activity.';

    Alert.alert(title, body, [
      {
        text: 'Later',
        style: 'cancel',
      },
      {
        text: 'View',
        onPress: () => openFromNotification(remoteMessage?.data),
      },
    ]);
  });

  const unsubscribeOpened = messaging().onNotificationOpenedApp(remoteMessage => {
    emitNotificationEvent();
    openFromNotification(remoteMessage?.data);
  });

  const initialNotification = await messaging().getInitialNotification();
  if (initialNotification?.data) {
    emitNotificationEvent();
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
