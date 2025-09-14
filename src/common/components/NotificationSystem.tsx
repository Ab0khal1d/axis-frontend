/**
 * Enterprise notification system with toast messages, alerts, and confirmations
 */

import React, { createContext, useContext, useCallback, useState } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Grow,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { AnimatePresence } from 'framer-motion';

// Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  id?: string;
  title?: string;
  message: string;
  type?: NotificationType;
  duration?: number | null; // null for persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  showCloseButton?: boolean;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'info' | 'warning' | 'error';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface NotificationItem extends Required<Omit<NotificationOptions, 'action'>> {
  action?: NotificationOptions['action'];
  timestamp: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  showNotification: (options: NotificationOptions) => void;
  hideNotification: (id: string) => void;
  clearAll: () => void;
  showConfirmation: (options: ConfirmationOptions) => void;
}

// Context
const NotificationContext = createContext<NotificationContextType | null>(null);

// Hook
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Utility functions for common notifications
export const useNotify = () => {
  const { showNotification, showConfirmation } = useNotifications();

  return {
    success: (message: string, options?: Partial<NotificationOptions>) =>
      showNotification({ ...options, message, type: 'success' }),

    error: (message: string, options?: Partial<NotificationOptions>) =>
      showNotification({ ...options, message, type: 'error', duration: null }),

    warning: (message: string, options?: Partial<NotificationOptions>) =>
      showNotification({ ...options, message, type: 'warning' }),

    info: (message: string, options?: Partial<NotificationOptions>) =>
      showNotification({ ...options, message, type: 'info' }),

    confirm: showConfirmation,

    loading: (message: string = 'Loading...') =>
      showNotification({
        message,
        type: 'info',
        duration: null,
        showCloseButton: false,
        id: 'loading'
      }),

    hideLoading: () => {
      const { hideNotification } = useNotifications();
      hideNotification('loading');
    }
  };
};

// Notification Component
const NotificationItem: React.FC<{
  notification: NotificationItem;
  onClose: (id: string) => void;
}> = ({ notification, onClose }) => {
  const handleClose = useCallback(() => {
    onClose(notification.id);
  }, [notification.id, onClose]);

  const getAnchorOrigin = () => {
    const [vertical, horizontal] = notification.position.split('-') as ['top' | 'bottom', 'left' | 'center' | 'right'];
    return { vertical, horizontal };
  };

  return (
    <Snackbar
      open={true}
      autoHideDuration={notification.duration}
      onClose={handleClose}
      anchorOrigin={getAnchorOrigin()}
      TransitionComponent={notification.position.includes('top') ? Slide : Grow}
    >
      <Alert
        severity={notification.type}
        variant="filled"
        onClose={notification.showCloseButton ? handleClose : undefined}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {notification.action && (
              <Button
                color="inherit"
                size="small"
                onClick={notification.action.onClick}
              >
                {notification.action.label}
              </Button>
            )}
            {notification.showCloseButton && (
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
      >
        {notification.title && <AlertTitle>{notification.title}</AlertTitle>}
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

// Confirmation Dialog Component
const ConfirmationDialog: React.FC<{
  open: boolean;
  options: ConfirmationOptions;
  onClose: () => void;
}> = ({ open, options, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await options.onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    options.onCancel?.();
    onClose();
  };

  const getSeverityColor = () => {
    switch (options.type) {
      case 'warning': return 'warning.main';
      case 'error': return 'error.main';
      default: return 'primary.main';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ borderLeft: 4, borderColor: getSeverityColor() }}>
        {options.title || 'Confirm Action'}
      </DialogTitle>
      <DialogContent>
        <Typography>{options.message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={isProcessing}>
          {options.cancelLabel || 'Cancel'}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={options.type === 'error' ? 'error' : 'primary'}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : (options.confirmLabel || 'Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Provider Component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [confirmationOptions, setConfirmationOptions] = useState<ConfirmationOptions | null>(null);

  const showNotification = useCallback((options: NotificationOptions) => {
    const id = options.id || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification: NotificationItem = {
      id,
      title: options.title || '',
      message: options.message,
      type: options.type || 'info',
      duration: options.duration !== undefined ? options.duration : 5000,
      action: options.action,
      showCloseButton: options.showCloseButton !== undefined ? options.showCloseButton : true,
      position: options.position || 'bottom-right',
      timestamp: Date.now(),
    };

    setNotifications(prev => {
      // Replace if same ID exists
      const filtered = prev.filter(n => n.id !== id);
      return [...filtered, notification];
    });
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const showConfirmation = useCallback((options: ConfirmationOptions) => {
    setConfirmationOptions(options);
  }, []);

  const handleCloseConfirmation = useCallback(() => {
    setConfirmationOptions(null);
  }, []);

  const contextValue: NotificationContextType = {
    notifications,
    showNotification,
    hideNotification,
    clearAll,
    showConfirmation,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      {/* Render notifications */}
      <AnimatePresence>
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={hideNotification}
          />
        ))}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      {confirmationOptions && (
        <ConfirmationDialog
          open={true}
          options={confirmationOptions}
          onClose={handleCloseConfirmation}
        />
      )}
    </NotificationContext.Provider>
  );
};

// HOC for wrapping components with notification provider
export const withNotificationProvider = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  const WrappedComponent = (props: P) => (
    <NotificationProvider>
      <Component {...props} />
    </NotificationProvider>
  );

  WrappedComponent.displayName = `withNotificationProvider(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default NotificationProvider;