import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import ChatMessage from './ChatMessage';
import type { ChatMessageListProps } from './types';
import './ChatMessageList.css';

/**
 * ChatMessageList displays a scrollable list of chat messages
 * with automatic scroll to the newest message
 * Styled to match DeepSeek UI
 */
const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  loading = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [greeting, setGreeting] = useState('');

  // Get time-based greeting (Good morning, Good afternoon, Good evening)
  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
    };

    setGreeting(getGreeting());
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        overflow: 'auto',
        bgcolor: (theme) => theme.palette.background.default,
      }}
    >
      {/* Welcome message if no messages yet */}
      {messages.length === 0 && !loading && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            p: 3,
            textAlign: 'center'
          }}
        >
          <Box
            className="deepseek-welcome"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: 600,
              mt: -8 // Move up a bit to match the DeepSeek UI
            }}
          >
            <Box
              component="img"
              sx={{
                width: 60,
                height: 60,
                mb: 4
              }}
              src="/deepseek-logo.svg"
              alt="DeepSeek Logo"
            />
            <Typography variant="h3" fontWeight={600} sx={{ mb: 2 }}>
              How can I help you?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 5, fontWeight: 400 }}>
              {greeting}, Mohamed
            </Typography>
          </Box>
        </Box>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </>
      )}

      {/* Loading indicator */}
      {loading && (
        <Box
          className="deepseek-loading-message"
          sx={{
            width: '100%',
            maxWidth: '900px',
            mx: 'auto',
            px: 2,
            py: 4,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? '#FFFFFF' : theme.palette.background.default,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
          }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: '#5080F2',
              }}
            >
              <SmartToyOutlinedIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ color: 'primary.main' }}
                >
                  Linkawy
                </Typography>
              </Box>
              <Box className="deepseek-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default ChatMessageList;