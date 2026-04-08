import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import groundsReducer from './slices/groundsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    grounds: groundsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
