import { combineReducers } from '@reduxjs/toolkit';
import conversationsReducer from '../features/conversations/redux/conversationsSlice';
import settingsReducer from '../features/settings/redux/settingsSlice';
import { conversationsApi } from '../features/conversations/services/conversationsApi';

export const rootReducer = combineReducers({
  conversations: conversationsReducer,
  settings: settingsReducer,
  [conversationsApi.reducerPath]: conversationsApi.reducer,
});