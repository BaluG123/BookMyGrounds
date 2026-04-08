import api from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      await api.post('/auth/logout/');
    } catch (e) {
      console.warn('Backend logout failed, ignoring local wipe');
    }
    await AsyncStorage.multiRemove(['auth_token', 'user_data']);
  },

  getProfile: () => api.get('/auth/profile/'),
  
  updateProfile: (data: FormData) =>
    api.patch('/auth/profile/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    
  changePassword: (data: any) =>
    api.post('/auth/change-password/', data),
};
