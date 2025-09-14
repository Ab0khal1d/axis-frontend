import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import theme from './theme/deepseek-theme';
import MainLayout from './common/components/layout/MainLayout';
import Chat from './features/conversations/components/Chat';
import './App.css';

/**
 * Enterprise-level AI Chatbot UI with modern architecture
 */
function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <MainLayout>
            <Chat
              conversationId={null}
              onToggleSidebar={() => { }}
            />
          </MainLayout>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
