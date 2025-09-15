import { combineReducers } from "@reduxjs/toolkit";
import conversationsReducer from "../features/conversations/redux/conversationsSlice";
import settingsReducer from "../features/settings/redux/settingsSlice";
import authReducer from "../features/auth/redux/authSlice";

export const rootReducer = combineReducers({
  conversations: conversationsReducer,
  settings: settingsReducer,
  auth: authReducer,
});
