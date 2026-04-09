import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

// Use PythonAnywhere server
export const API_BASE_URL = 'https://bookmyground.pythonanywhere.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased for image uploads
});

// Auto-attach auth token
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
      console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url} - Token: ${token.substring(0, 10)}...`);
    } else {
      console.warn('[API REQUEST] No auth token found!');
    }
  } catch (error) {
    console.error('Error fetching token:', error);
  }
  return config;
});

// Handle 401 ? clear storage and dispatch logout (we will configure this via store listener later)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // DIAGNOSTIC LOG
    console.log(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['auth_token', 'user_data', 'push_token']);
      // Additional Redux dispatch for logout can be tied later via an event emitter or store export
      console.warn('Unauthorized! Token wiped.');
    }
    return Promise.reject(error);
  }
);

export default api;
