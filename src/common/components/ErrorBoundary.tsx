/**
 * Enterprise-grade error boundary with comprehensive error handling,
 * logging, and recovery options
 */

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showReportButton?: boolean;
  level?: 'page' | 'component' | 'widget';
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo;
  resetError: () => void;
  errorId: string;
  level: 'page' | 'component' | 'widget';
}

/**
 * Default error fallback component with comprehensive error display
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  errorId,
  level
}) => {
  const handleCopyError = async () => {
    const errorText = `
Error ID: ${errorId}
Error: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo.componentStack}
Time: ${new Date().toISOString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      // Could show a toast notification here
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  const handleReportBug = () => {
    // Integrate with your bug reporting service (e.g., Sentry, Bugsnag)
    console.error('Bug report:', {
      errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });

    // Could open a modal or redirect to bug report form
  };

  const getErrorSeverity = () => {
    switch (level) {
      case 'page': return 'error';
      case 'component': return 'warning';
      case 'widget': return 'info';
      default: return 'error';
    }
  };

  const getErrorTitle = () => {
    switch (level) {
      case 'page': return 'Page Error';
      case 'component': return 'Component Error';
      case 'widget': return 'Widget Error';
      default: return 'Application Error';
    }
  };

  const getErrorDescription = () => {
    switch (level) {
      case 'page': return 'The page encountered an error and cannot be displayed.';
      case 'component': return 'A component on this page has encountered an error.';
      case 'widget': return 'A widget has encountered an error but the rest of the page should work normally.';
      default: return 'The application has encountered an unexpected error.';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          p: level === 'widget' ? 2 : 4,
          textAlign: 'center',
          minHeight: level === 'page' ? '50vh' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3
        }}
      >
        <ErrorIcon
          color={getErrorSeverity() as any}
          sx={{
            fontSize: level === 'widget' ? 40 : 60,
            mb: 2
          }}
        />

        <Typography variant={level === 'widget' ? 'h6' : 'h5'} gutterBottom>
          {getErrorTitle()}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 600 }}
        >
          {getErrorDescription()}
        </Typography>

        {import.meta.env.DEV && (
          <Alert severity="error" sx={{ textAlign: 'left', maxWidth: '100%', mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {error.message}
            </Typography>

            <Accordion sx={{ mt: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2">Error Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Tooltip title="Copy error details">
                    <IconButton size="small" onClick={handleCopyError}>
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Report bug">
                    <IconButton size="small" onClick={handleReportBug}>
                      <BugReportIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '0.75rem',
                    bgcolor: 'grey.100',
                    p: 1,
                    borderRadius: 1,
                    maxHeight: 200,
                    overflow: 'auto'
                  }}
                >
                  {error.stack}
                </Typography>

                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '0.75rem',
                    bgcolor: 'grey.50',
                    p: 1,
                    borderRadius: 1,
                    mt: 1,
                    maxHeight: 200,
                    overflow: 'auto'
                  }}
                >
                  {errorInfo.componentStack}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={resetError}
            size={level === 'widget' ? 'small' : 'medium'}
          >
            Try Again
          </Button>

          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            size={level === 'widget' ? 'small' : 'medium'}
          >
            Reload Page
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Error ID: {errorId}
        </Typography>
      </Box>
    </motion.div>
  );
};

/**
 * Enterprise error boundary class component
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.group(`🚨 Error Boundary Caught Error`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Props:', this.props);
      console.groupEnd();
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log to external service in production
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // Integrate with error logging service like Sentry, LogRocket, etc.
    const errorPayload = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      level: this.props.level || 'page',
    };

    // Example: Send to your logging service
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorPayload),
    }).catch(logError => {
      console.error('Failed to log error to service:', logError);
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error!}
          errorInfo={this.state.errorInfo!}
          resetError={this.resetError}
          errorId={this.state.errorId}
          level={this.props.level || 'page'}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for programmatic error boundary usage
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};

/**
 * Higher-order component for adding error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ErrorBoundaryProps, 'children'> = {}
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ErrorBoundary;