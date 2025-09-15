import type { RootState } from '../../../redux/store';

// Auth selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized;

// Derived selectors
export const selectUserId = (state: RootState) =>
  state.auth.user?.id;

export const selectUserDisplayName = (state: RootState) =>
  state.auth.user?.displayName || 'Unknown User';
export const selectUserFirstName = (state: RootState) =>
  state.auth.user?.givenName || 'Unknown User';

export const selectUserEmail = (state: RootState) =>
  state.auth.user?.email || '';

export const selectAuthStatus = (state: RootState) => ({
  isAuthenticated: state.auth.isAuthenticated,
  isLoading: state.auth.isLoading,
  isInitialized: state.auth.isInitialized,
  error: state.auth.error,
});