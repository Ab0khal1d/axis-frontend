import { useState } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/deepseek-theme';
import { Chat } from './components/chat';
import MainLayout from './components/layout/MainLayout';
import { defaultConversation } from './data/mockData';
import type { Conversation } from './data/mockData';
import './App.css';

/**
 * Enterprise-level AI Chatbot UI with Claude-like interface
 */
function App() {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(defaultConversation);

  const handleToggleSidebar = () => {
    // This would be used in a more complex implementation
    // For now, it's just a placeholder for the mobile toggle functionality
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainLayout>
        <Chat
          conversation={activeConversation}
          onConversationUpdate={setActiveConversation}
          onToggleSidebar={handleToggleSidebar}
        />
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
