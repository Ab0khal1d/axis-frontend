/**
 * Enterprise-grade loading components with multiple variants
 * and accessibility features
 */

import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Typography,
  Paper,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: number | string;
  color?: 'primary' | 'secondary' | 'inherit';
  message?: string;
  overlay?: boolean;
  fullScreen?: boolean;
}

interface LoadingSkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
  count?: number;
  spacing?: number;
}

interface LoadingProgressProps {
  variant?: 'determinate' | 'indeterminate';
  value?: number;
  message?: string;
  showPercentage?: boolean;
}

interface LoadingDotsProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

/**
 * Animated loading dots component
 */
export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'medium',
  color
}) => {
  const theme = useTheme();

  const dotSize = {
    small: 4,
    medium: 6,
    large: 8,
  }[size];

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    },
  };

  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: [-4, 4, -4],
      transition: {
        duration: 0.6,
        ease: 'easeInOut' as const,
        repeat: Infinity,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      style={{
        display: 'flex',
        gap: dotSize / 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          variants={dotVariants}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: color || theme.palette.primary.main,
          }}
        />
      ))}
    </motion.div>
  );
};

/**
 * Spinner with optional overlay and message
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = 'primary',
  message,
  overlay = false,
  fullScreen = false,
}) => {
  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          ...(fullScreen && {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 9999,
            justifyContent: 'center',
          }),
          ...(overlay && !fullScreen && {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1000,
            justifyContent: 'center',
          }),
        }}
      >
        <CircularProgress
          size={size}
          color={color}
          aria-label="Loading"
        />
        {message && (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
          >
            {message}
          </Typography>
        )}
      </Box>
    </motion.div>
  );

  if (overlay || fullScreen) {
    return content;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
      {content}
    </Box>
  );
};

/**
 * Progress bar with optional percentage display
 */
export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  variant = 'indeterminate',
  value = 0,
  message,
  showPercentage = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ width: '100%', p: 2 }}>
        {message && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
            {showPercentage && variant === 'determinate' && (
              <Typography variant="body2" color="text.secondary">
                {Math.round(value)}%
              </Typography>
            )}
          </Box>
        )}
        <LinearProgress
          variant={variant}
          value={value}
          sx={{
            height: 6,
            borderRadius: 3,
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
            },
          }}
        />
      </Box>
    </motion.div>
  );
};

/**
 * Skeleton loader for content placeholders
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'rectangular',
  width = '100%',
  height = 20,
  count = 1,
  spacing = 8,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing / 8 }}>
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton
            key={index}
            variant={variant}
            width={width}
            height={height}
            animation="wave"
          />
        ))}
      </Box>
    </motion.div>
  );
};

/**
 * Chat message skeleton for loading messages
 */
export const ChatMessageSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={80} height={16} />
            <Box sx={{ mt: 1 }}>
              <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width="70%" height={16} sx={{ mt: 1 }} />
            </Box>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

/**
 * Conversation list skeleton
 */
export const ConversationListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ p: 2 }}>
        {Array.from({ length: count }).map((_, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              p: 2,
              mb: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="60%" height={16} sx={{ mt: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Skeleton variant="text" width={100} height={14} />
                  <Skeleton variant="text" width={60} height={14} />
                </Box>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </motion.div>
  );
};

/**
 * Card content skeleton
 */
export const CardSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ ml: 2, flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 1, mb: 2 }} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={60} />
        </Box>
      </Paper>
    </motion.div>
  );
};

/**
 * Page loading component
 */
export const PageLoading: React.FC<{ message?: string }> = ({
  message = 'Loading...'
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: 3,
      }}
    >
      <LoadingSpinner size={60} message={message} />
    </Box>
  );
};

export default LoadingSpinner;