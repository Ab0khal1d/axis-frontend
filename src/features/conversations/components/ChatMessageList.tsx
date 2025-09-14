import { useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import ChatMessage from './ChatMessage';
import type { Message } from '../types';
import './ChatMessageList.css';

interface ChatMessageListProps {
  messages: Message[];
  loading?: boolean;
  errorMessage?: string | null;
}

/**
 * Displays a scrollable list of chat messages with auto-scroll and loading states
 */
const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  loading = false,
  errorMessage = null,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        scrollBehavior: 'smooth',
        px: { xs: 0, sm: 2 },
        py: 2,
      }}
      className="message-list-container"
    >
      {messages.length === 0 && !loading && (
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
            px: 3,
            textAlign: 'center',
          }}
        >
          <img
            src="/deepseek-logo.svg"
            alt="DeepSeek AI Logo"
            style={{
              width: 80,
              marginBottom: 24,
              opacity: 0.8
            }}
          />
          <Typography variant="h5" gutterBottom fontWeight={500}>
            How can I help you today?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
            I'm DeepSeek Chat, an AI assistant that can help you with information,
            writing tasks, creative content, and problem-solving. Ask me anything!
          </Typography>
        </Box>
      )}

      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {/* Loading indicator for new message */}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            my: 2
          }}
        >
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Thinking...
          </Typography>
        </Box>
      )}

      {/* Error message */}
      {errorMessage && (
        <Alert
          severity="error"
          sx={{
            mx: { xs: 2, sm: 4 },
            mb: 2,
            mt: 1
          }}
        >
          {errorMessage}
        </Alert>
      )}

      {/* This element is used for auto-scrolling */}
      <div ref={messagesEndRef} style={{ height: '1px' }} />
    </Box>
  );
};

export default ChatMessageList;