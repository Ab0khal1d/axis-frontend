import React, { useEffect } from 'react';
import { Box, Button, Container, Typography, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import { initializeAuth, signInPopup, clearError } from '../redux/authSlice';
import { selectIsAuthenticated, selectAuthLoading, selectAuthError, selectIsInitialized } from '../redux/authSelectors';

interface LoginProps { }

const Login: React.FC<LoginProps> = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isInitialized = useAppSelector(selectIsInitialized);

  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleMicrosoftLogin = async () => {
    try {
      dispatch(clearError());
      await dispatch(signInPopup()).unwrap();
      // Navigation will happen in useEffect
    } catch (error) {
      console.error('Login failed:', error);
      // Error is handled by Redux slice
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d42 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/assets/login-overlay.svg)',
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 400px',
          opacity: 0.08,
          zIndex: 1,
        }}
      />

      {/* Main Content Container */}
      <Container
        maxWidth="sm"
        sx={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo Container */}
          <Box
            sx={{
              mb: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                type: "spring",
                stiffness: 100
              }}
            >
              <Box
                component="img"
                src="/assets/deepseek-logo.svg"
                alt="DeepSeek Logo"
                sx={{
                  width: { xs: 80, sm: 100, md: 120 },
                  height: { xs: 80, sm: 100, md: 120 },
                  filter: 'drop-shadow(0 8px 32px rgba(77, 111, 229, 0.3))',
                }}
              />
            </motion.div>
          </Box>

          {/* Welcome Text */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                letterSpacing: '-0.02em',
              }}
            >
              Welcome
            </Typography>
            <Typography
              variant="h6"
              component="p"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 400,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                lineHeight: 1.5,
              }}
            >
              Sign in to continue to your account
            </Typography>
          </Box>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                severity="error"
                sx={{
                  mb: 4,
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  border: '1px solid rgba(211, 47, 47, 0.3)',
                  color: '#ffffff',
                  '& .MuiAlert-icon': {
                    color: '#f44336',
                  },
                }}
                onClose={() => dispatch(clearError())}
              >
                {error}
              </Alert>
            </motion.div>
          )}

          {/* Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleMicrosoftLogin}
              disabled={isLoading || !isInitialized}
              variant="contained"
              size="large"
              sx={{
                backgroundColor: '#0078d4',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '1.1rem',
                px: 6,
                py: 2,
                borderRadius: 3,
                textTransform: 'none',
                minWidth: 280,
                boxShadow: '0 8px 32px rgba(0, 120, 212, 0.3)',
                border: 'none',
                '&:hover': {
                  backgroundColor: '#106ebe',
                  boxShadow: '0 12px 40px rgba(0, 120, 212, 0.4)',
                  transform: 'translateY(-2px)',
                },
                '&:focus': {
                  outline: '2px solid rgba(0, 120, 212, 0.5)',
                  outlineOffset: '4px',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(0, 120, 212, 0.5)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'not-allowed',
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              startIcon={
                isLoading ? (
                  <CircularProgress
                    size={20}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Microsoft Logo SVG */}
                    <svg width="20" height="20" viewBox="0 0 23 23" fill="none">
                      <path d="M1 1h10v10H1z" fill="#f25022" />
                      <path d="M12 1h10v10H12z" fill="#00a4ef" />
                      <path d="M1 12h10v10H1z" fill="#ffb900" />
                      <path d="M12 12h10v10H12z" fill="#7fba00" />
                    </svg>
                  </Box>
                )
              }
            >
              {isLoading ? 'Signing in...' : 'Login with Microsoft'}
            </Button>
          </motion.div>

          {/* Footer Text */}
          <Box sx={{ mt: 6 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.875rem',
              }}
            >
              Secure authentication powered by Microsoft
            </Typography>
          </Box>
        </motion.div>
      </Container>

      {/* Subtle Gradient Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(77, 111, 229, 0.1) 0%, transparent 70%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};

export default Login;