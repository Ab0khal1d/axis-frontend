import { useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import ChatMessage from './ChatMessage';
import type { Message } from '../types';
import './ChatMessageList.css';

interface ChatMessageListProps {
  messages: Message[];
  loading?: boolean;
  errorMessage?: string | null;
}

function ChatMessageList({
  messages,
  loading = false,
  errorMessage = null,
}: ChatMessageListProps) {
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
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: { xs: '100%', sm: 720, md: 800 },
        mx: 'auto',
        px: { xs: 0, sm: 2 },
        py: 2,
      }}
      className="message-list-container"
    >
      {messages.length === 0 && !loading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
            py: 8,
            opacity: 0.6,
          }}
        >
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No messages yet. Start the conversation!
          </Typography>
        </Box>
      ) : (
        messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
          />
        ))
      )}

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