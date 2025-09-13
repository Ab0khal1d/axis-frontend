import { createTheme } from '@mui/material/styles';

// Create a theme instance for our chatbot UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB', // Modern blue color
      light: '#3B82F6',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#10B981', // Green for AI responses
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#3B82F6',
    },
    success: {
      main: '#10B981',
    },
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.875rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.2,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.57,
      textTransform: 'none',
    },
    caption: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    overline: {
      fontWeight: 600,
      fontSize: '0.75rem',
      lineHeight: 1.66,
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)',
    '0px 1px 5px rgba(0, 0, 0, 0.06), 0px 2px 5px rgba(0, 0, 0, 0.1)',
    '0px 1px 8px rgba(0, 0, 0, 0.06), 0px 3px 8px rgba(0, 0, 0, 0.1)',
    '0px 2px 10px rgba(0, 0, 0, 0.06), 0px 4px 10px rgba(0, 0, 0, 0.1)',
    '0px 2px 15px rgba(0, 0, 0, 0.06), 0px 5px 15px rgba(0, 0, 0, 0.1)',
    '0px 3px 20px rgba(0, 0, 0, 0.06), 0px 8px 20px rgba(0, 0, 0, 0.1)',
    '0px 4px 25px rgba(0, 0, 0, 0.06), 0px 10px 25px rgba(0, 0, 0, 0.1)',
    '0px 5px 30px rgba(0, 0, 0, 0.06), 0px 15px 30px rgba(0, 0, 0, 0.1)',
    '0px 6px 35px rgba(0, 0, 0, 0.06), 0px 18px 35px rgba(0, 0, 0, 0.1)',
    '0px 7px 40px rgba(0, 0, 0, 0.06), 0px 20px 40px rgba(0, 0, 0, 0.1)',
    '0px 7px 45px rgba(0, 0, 0, 0.06), 0px 22px 45px rgba(0, 0, 0, 0.1)',
    '0px 8px 50px rgba(0, 0, 0, 0.06), 0px 25px 50px rgba(0, 0, 0, 0.1)',
    '0px 9px 55px rgba(0, 0, 0, 0.06), 0px 27px 55px rgba(0, 0, 0, 0.1)',
    '0px 10px 60px rgba(0, 0, 0, 0.06), 0px 30px 60px rgba(0, 0, 0, 0.1)',
    '0px 12px 65px rgba(0, 0, 0, 0.06), 0px 32px 65px rgba(0, 0, 0, 0.1)',
    '0px 14px 70px rgba(0, 0, 0, 0.06), 0px 35px 70px rgba(0, 0, 0, 0.1)',
    '0px 16px 75px rgba(0, 0, 0, 0.06), 0px 38px 75px rgba(0, 0, 0, 0.1)',
    '0px 18px 80px rgba(0, 0, 0, 0.06), 0px 40px 80px rgba(0, 0, 0, 0.1)',
    '0px 20px 85px rgba(0, 0, 0, 0.06), 0px 42px 85px rgba(0, 0, 0, 0.1)',
    '0px 22px 90px rgba(0, 0, 0, 0.06), 0px 45px 90px rgba(0, 0, 0, 0.1)',
    '0px 24px 95px rgba(0, 0, 0, 0.06), 0px 48px 95px rgba(0, 0, 0, 0.1)',
    '0px 26px 100px rgba(0, 0, 0, 0.06), 0px 50px 100px rgba(0, 0, 0, 0.1)',
    '0px 28px 105px rgba(0, 0, 0, 0.06), 0px 52px 105px rgba(0, 0, 0, 0.1)',
    '0px 30px 110px rgba(0, 0, 0, 0.06), 0px 55px 110px rgba(0, 0, 0, 0.1)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.06), 0px 2px 5px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '16px',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06), 0px 1px 2px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;