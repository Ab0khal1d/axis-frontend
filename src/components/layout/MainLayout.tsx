import React, { useState } from 'react';
import { Box, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, Button, useMediaQuery } from '@mui/material';
import Sidebar from '../sidebar/Sidebar';
import { mockConversations, defaultConversation, type Conversation } from '../../data/mockData';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const theme = useTheme();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(defaultConversation);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  // Handle selecting a conversation from the sidebar
  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    // On mobile, close the sidebar after selection
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Handle creating a new conversation
  const handleNewConversation = () => {
    // Set active conversation to null to show welcome screen
    setActiveConversation(null);
    // On mobile, close the sidebar after creating new conversation
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Toggle sidebar visibility (primarily for mobile)
  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Make children accessible as props
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onToggleSidebar: handleToggleSidebar
      } as any);
    }
    return child;
  });

  return (
    <>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#F8F8FA', position: 'relative' }}>
        {/* Sidebar - conditionally rendered based on state for mobile responsiveness */}
        {(isSidebarOpen || !isMobile) && (
          <Sidebar
            conversations={mockConversations}
            activeConversationId={activeConversation?.id}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
          />
        )}

        {/* Main content area */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            height: '100%'
          }}
        >
          {/* Render children with additional props */}
          {childrenWithProps}
        </Box>
      </Box>

      {/* Settings Dialog */}
      <Dialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          {/* Settings would go here - for now it's just a placeholder */}
          <Box sx={{ py: 2 }}>
            This would contain application settings like:
            <ul>
              <li>Appearance preferences</li>
              <li>Notification settings</li>
              <li>Language preferences</li>
              <li>API configuration</li>
              <li>Export/import data options</li>
            </ul>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setIsSettingsOpen(false)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MainLayout;