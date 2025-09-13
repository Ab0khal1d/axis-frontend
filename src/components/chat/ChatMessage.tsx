import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import './ChatMessage.css';
import type { ChatMessageProps } from './types';

// MessageContent component to handle formatted text with code blocks
const MessageContent = ({ content, isAI = false }: { content: string, isAI?: boolean }) => {
  return (
    <Box
      sx={{
        color: 'text.primary',
        lineHeight: 1.6,
        wordBreak: 'break-word', // Break long words to prevent overflow
        wordWrap: 'break-word', // Legacy support for older browsers
        overflowWrap: 'break-word', // Modern standard
        maxWidth: '100%', // Ensure content doesn't exceed container width
        '& pre, & code': {
          fontFamily: 'monospace',
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          padding: '0.2em 0.4em',
          borderRadius: '3px',
          fontSize: '0.85em',
        },
        '& pre': {
          margin: '16px 0',
          padding: '16px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '400px', // Limit height and enable vertical scrolling
          whiteSpace: 'pre-wrap', // Wrap text within code blocks
        },
        '& a': {
          color: 'primary.main',
        },
        '& ul, & ol': {
          paddingLeft: '24px',
        },
        '& blockquote': {
          borderLeft: '3px solid',
          borderColor: 'divider',
          paddingLeft: '16px',
          margin: '16px 0',
          color: 'text.secondary',
        },
        '& p': {
          marginTop: '0.5em',
          marginBottom: '0.5em',
        }
      }}
      className={`deepseek-message-content ${isAI ? 'deepseek-ai-message-content' : ''}`}
    >
      {content.split('```').map((block, index) => {
        if (index % 2 === 0) {
          // Regular text block
          return <Typography key={index} component="div" variant="body1">{block}</Typography>;
        } else {
          // Code block
          const firstLineBreak = block.indexOf('\n');
          const language = firstLineBreak > 0 ? block.substring(0, firstLineBreak).trim() : '';
          const code = firstLineBreak > 0 ? block.substring(firstLineBreak + 1) : block;

          return <CodeBlock key={index} language={language} code={code} />;
        }
      })}
    </Box>
  );
};

// CodeBlock component for syntax highlighting
const CodeBlock = ({ language, code }: { language: string, code: string }) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    // In a real app, you would show a snackbar or toast notification here
  };

  return (
    <Box
      component="pre"
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: '#f8f8f2',
        position: 'relative',
        borderRadius: '6px',
        py: 2,
        my: 2,
        pl: 2,
        pr: 1,
        overflow: 'auto', // Enable both vertical and horizontal scrolling when needed
        maxHeight: '400px', // Limit height to trigger vertical scrolling
        whiteSpace: 'pre-wrap', // Wrap text where possible
        wordBreak: 'break-word', // Break long words to prevent overflow
        msWordBreak: 'break-all', // For older browsers
      }}
    >
      <Box sx={{ position: 'absolute', top: '8px', right: '12px', display: 'flex', alignItems: 'center', gap: 1 }}>
        {language && (
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            {language}
          </Typography>
        )}
        <Tooltip title="Copy code">
          <IconButton
            size="small"
            sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}
            onClick={handleCopyCode}
          >
            <ContentCopyOutlinedIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box component="code" sx={{ wordBreak: 'break-word' }}>{code}</Box>
    </Box>
  );
};

// DeepSeek styled components for message containers
const UserMessageContainer = styled(Box)(({ theme }) => ({
  padding: '24px 0',
  width: '100%',
  maxWidth: '900px',
  margin: '0 auto',
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.mode === 'light' ? '#F8F8FA' : theme.palette.background.paper,
  overflowWrap: 'break-word', // Ensure text wraps within container
  wordWrap: 'break-word', // Legacy support
}));

const AIMessageContainer = styled(Box)(({ theme }) => ({
  padding: '24px 0',
  width: '100%',
  maxWidth: '900px',
  margin: '0 auto',
  backgroundColor: theme.palette.mode === 'light' ? '#FFFFFF' : theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  overflowWrap: 'break-word', // Ensure text wraps within container
  wordWrap: 'break-word', // Legacy support
  // Animation controlled via CSS classes in ChatMessage.css
}));

/**
 * ChatMessage component displays a single message in the DeepSeek UI style
 */
const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { role, content, timestamp } = message;
  const isUser = role === 'user';

  // Helper function to format time from Date object
  const formatMessageTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(content);
    // In a real app, you would show a snackbar or toast notification here
  };

  const avatarContent = isUser ? (
    <Avatar
      sx={{
        width: 28,
        height: 28,
        bgcolor: 'grey.300',
      }}
    >
      <PersonOutlineOutlinedIcon sx={{ fontSize: 16 }} />
    </Avatar>
  ) : (
    <Avatar
      sx={{
        width: 28,
        height: 28,
        bgcolor: '#5080F2',
      }}
    >
      <SmartToyOutlinedIcon sx={{ fontSize: 16 }} />
    </Avatar>
  );

  // Use useEffect to add animation class with a slight delay for AI messages
  const [animatedClass, setAnimatedClass] = useState('');

  useEffect(() => {
    // Only animate AI messages
    if (!isUser) {
      // Small delay to make animation more natural
      const timer = setTimeout(() => {
        setAnimatedClass('animated');
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isUser]);

  return isUser ? (
    <UserMessageContainer className="deepseek-user-message">
      <Box sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        px: 2,
      }}>
        {avatarContent}
        <Box sx={{
          flex: 1,
          maxWidth: 'calc(100% - 45px)', // Account for avatar and gap
          overflow: 'hidden'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{ color: 'text.primary' }}
            >
              You
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              {formatMessageTime(timestamp)}
            </Typography>
          </Box>
          <Box className="message-content-wrapper">
            <MessageContent content={content} />
          </Box>
        </Box>
      </Box>
    </UserMessageContainer>
  ) : (
    <AIMessageContainer className={`deepseek-ai-message ${animatedClass}`}>
      <Box sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        px: 2,
        maxWidth: '900px',
        mx: 'auto'
      }}>
        {avatarContent}
        <Box sx={{
          flex: 1,
          maxWidth: 'calc(100% - 45px)', // Account for avatar and gap
          overflow: 'hidden'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{ color: 'primary.main' }}
            >
              DeepSeek
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              {formatMessageTime(timestamp)}
            </Typography>
          </Box>
          <Box className="message-content-wrapper">
            <MessageContent content={content} isAI={true} />
          </Box>

          {/* Message action buttons */}
          <Box sx={{
            display: 'flex',
            gap: 0.5,
            mt: 2,
            color: 'text.secondary'
          }}>
            <Tooltip title="Copy">
              <IconButton size="small" onClick={handleCopyMessage} sx={{ color: 'inherit' }}>
                <ContentCopyOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Like">
              <IconButton size="small" sx={{ color: 'inherit' }}>
                <ThumbUpOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Dislike">
              <IconButton size="small" sx={{ color: 'inherit' }}>
                <ThumbDownOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </AIMessageContainer>
  );
};

export default ChatMessage;