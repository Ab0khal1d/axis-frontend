import { combineReducers } from "@reduxjs/toolkit";
import conversationsReducer from "../features/conversations/redux/conversationsSlice";
import settingsReducer from "../features/settings/redux/settingsSlice";

export const rootReducer = combineReducers({
  conversations: conversationsReducer,
  settings: settingsReducer,
});
