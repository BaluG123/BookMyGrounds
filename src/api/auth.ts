import api from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function requestWithFallback(
  method: 'get' | 'patch',
  paths: string[],
  data?: any,
) {
  let lastError: any;

  for (const path of paths) {
    try {
      if (method === 'get') {
        return await api.get(path);
      }
      return await api.patch(path, data);
    } catch (error: any) {
      lastError = error;
      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError;
}

export const authAPI = {
  register: (data: any) => api.post('/auth/register/', data),

  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login/', { email, password });
    if (res.data.token) {
      await AsyncStorage.setItem('auth_token', res.data.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  firebaseLogin: async (firebase_token: string, role = 'customer') => {
    const res = await api.post('/auth/firebase-login/', { firebase_token, role });
    if (res.data.token) {
      await AsyncStorage.setItem('auth_token', res.data.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: async () => {
    try {
      const pushToken = await AsyncStorage.getItem('push_token');
      if (pushToken) {
        try {
          await api.post('/auth/push/unregister/', { token: pushToken });
        } catch {
          console.warn('Push unregister failed during logout');
        }
      }
      await api.post('/auth/logout/');
    } catch {
      console.warn('Backend logout failed, ignoring local wipe');
    }
    await AsyncStorage.multiRemove(['auth_token', 'user_data', 'push_token']);
  },

  getProfile: () => api.get('/auth/profile/'),

  updateProfile: (data: FormData) =>
    api.patch('/auth/profile/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  changePassword: (data: any) =>
    api.post('/auth/change-password/', data),
  registerPushToken: (data: { token: string; platform: 'android' | 'ios' | 'web'; device_name?: string }) =>
    api.post('/auth/push/register/', data),
  unregisterPushToken: (token: string) =>
    api.post('/auth/push/unregister/', { token }),
  listNotifications: (params?: any) => api.get('/auth/notifications/', { params }),
  markNotificationRead: (id: string) => api.patch(`/auth/notifications/${id}/read/`),
  getPayoutProfile: () =>
    requestWithFallback('get', [
      '/auth/payout-profile/',
      '/payout-profile/',
      '/auth/payout-profile',
      '/payout-profile',
    ]),
  updatePayoutProfile: (data: any) =>
    requestWithFallback('patch', [
      '/auth/payout-profile/',
      '/payout-profile/',
      '/auth/payout-profile',
      '/payout-profile',
    ], data),
};
