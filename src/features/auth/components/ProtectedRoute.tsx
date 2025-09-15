import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import { initializeAuth } from '../redux/authSlice';
import { selectIsAuthenticated, selectAuthLoading, selectIsInitialized, selectAuthError } from '../redux/authSelectors';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true
}) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const isInitialized = useAppSelector(selectIsInitialized);
  const error = useAppSelector(selectAuthError);

  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  // Show loading screen while initializing authentication
  if (!isInitialized || isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d42 100%)',
        }}
      >
        <CircularProgress
          size={60}
          sx={{
            color: '#4D6FE5',
            mb: 3,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 400,
          }}
        >
          {isLoading ? 'Signing you in...' : 'Loading...'}
        </Typography>
      </Box>
    );
  }

  // If there was an error during authentication initialization
  if (error && !isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, error }}
        replace
      />
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // If user is authenticated but trying to access login page
  if (!requireAuth && isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;