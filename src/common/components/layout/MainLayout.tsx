import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from '../../../features/sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main layout component with responsive sidebar and header
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleToggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Close sidebar when screen becomes mobile sized
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <Box sx={{
        display: 'flex',
        flexGrow: 1,
        overflow: 'hidden'
      }}>
        <Sidebar />

        <Box sx={{
          flexGrow: 1,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: 0,
          ...(sidebarOpen && !isMobile && {
            marginLeft: '280px',
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;