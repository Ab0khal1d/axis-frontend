import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  fontSize: number; // in px
  messageSpacing: number; // in px
  notifications: {
    enabled: boolean;
    sound: boolean;
  };
}

const initialState: SettingsState = {
  theme: 'system',
  fontSize: 16,
  messageSpacing: 16,
  notifications: {
    enabled: true,
    sound: true,
  },
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setFontSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload;
    },
    setMessageSpacing: (state, action: PayloadAction<number>) => {
      state.messageSpacing = action.payload;
    },
    setNotificationSettings: (
      state,
      action: PayloadAction<{ enabled?: boolean; sound?: boolean }>
    ) => {
      state.notifications = {
        ...state.notifications,
        ...action.payload,
      };
    },
    resetSettings: () => initialState,
  },
});

export const {
  setTheme,
  setFontSize,
  setMessageSpacing,
  setNotificationSettings,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;