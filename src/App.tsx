import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store, persistor } from './redux/store';
import theme from './theme/deepseek-theme';
import MainLayout from './common/components/layout/MainLayout';
import Chat from './features/conversations/components/Chat';
import Login from './features/auth/pages/Login';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
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
          <BrowserRouter>
            <Routes>
              {/* Login Page - Public route */}
              <Route
                path="/login"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                }
              />

              {/* Protected Main App Pages */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Chat onToggleSidebar={() => { }} />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
