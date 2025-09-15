import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import type { UserProfile } from '../services/authService';

// Async thunks for authentication actions
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      await authService.initialize();
      const isAuthenticated = authService.isAuthenticated();

      if (isAuthenticated) {
        const userProfile = await authService.getUserProfile();
        return { isAuthenticated: true, user: userProfile };
      }

      return { isAuthenticated: false, user: null };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to initialize authentication');
    }
  }
);

export const signInPopup = createAsyncThunk(
  'auth/signInPopup',
  async (_, { rejectWithValue }) => {
    try {
      await authService.signInPopup();
      const userProfile = await authService.getUserProfile();
      return userProfile;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Sign in failed');
    }
  }
);

export const signInRedirect = createAsyncThunk(
  'auth/signInRedirect',
  async (_, { rejectWithValue }) => {
    try {
      await authService.signInRedirect();
      // Redirect flow doesn't return immediately
      return null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Sign in redirect failed');
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await authService.signOut();
      return null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Sign out failed');
    }
  }
);

export const refreshUserProfile = createAsyncThunk(
  'auth/refreshUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const userProfile = await authService.getUserProfile();
      return userProfile;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to refresh user profile');
    }
  }
);

// Auth state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

// Auth slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })

      // Sign in popup
      .addCase(signInPopup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInPopup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signInPopup.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })

      // Sign in redirect
      .addCase(signInRedirect.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInRedirect.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        // Redirect flow will handle the actual authentication state update
      })
      .addCase(signInRedirect.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Sign out
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Refresh user profile
      .addCase(refreshUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(refreshUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearError, setLoading, resetAuth } = authSlice.actions;

// Export reducer
export default authSlice.reducer;