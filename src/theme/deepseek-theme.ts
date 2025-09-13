import { createTheme } from '@mui/material/styles';

// DeepSeek theme based on the screenshots
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5080F2', // DeepSeek blue color
      light: '#7098F5',
      dark: '#3E68C2',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6E7081', // Gray for secondary elements
      light: '#9093A0',
      dark: '#565764',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F8FA', // Light gray background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1C21',
      secondary: '#6E7081',
    },
    error: {
      main: '#F44336',
    },
    warning: {
      main: '#FF9800',
    },
    info: {
      main: '#5080F2',
    },
    success: {
      main: '#4CAF50',
    },
    grey: {
      50: '#F8F8FA',
      100: '#F1F1F3',
      200: '#E5E5E8',
      300: '#D4D6DD',
      400: '#BEC1CC',
      500: '#9093A0',
      600: '#6E7081',
      700: '#565764',
      800: '#32333A',
      900: '#1A1C21',
    },
    divider: '#E5E5E8',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.75rem',
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
      fontWeight: 500,
      fontSize: '0.75rem',
      lineHeight: 1.66,
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 18, // Rounded buttons
          padding: '6px 12px',
          textTransform: 'none',
        },
        outlined: {
          borderColor: '#E5E5E8',
        },
        containedPrimary: {
          backgroundColor: '#5080F2',
          '&:hover': {
            backgroundColor: '#3E68C2',
          },
        },
        outlinedPrimary: {
          borderColor: '#5080F2',
          color: '#5080F2',
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 18, // Rounded input fields
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 18, // Rounded input fields
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#5080F2',
          },
        },
        notchedOutline: {
          borderColor: '#E5E5E8',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#6E7081',
          '&:hover': {
            backgroundColor: 'rgba(80, 128, 242, 0.04)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: 'rgba(80, 128, 242, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(80, 128, 242, 0.12)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(80, 128, 242, 0.04)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E5E5E8',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;