import React, { useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';

// ChatGPT-style icons
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { formatTime } from '../../../common/utils/dateUtils';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

import './ChatMessage.css';


function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isAI = message.author === 'Assistant';
  const isUser = message.author === 'User';

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  // Loading skeleton for AI responses - no avatar, pure minimal
  const renderLoadingSkeleton = () => (
    <Box className="chat-message ai-message">
      <Box className="message-container">
        <Box className="loading-content">
          <Typography
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '15px',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            Thinking
            <Box className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  if (isLoading) {
    return renderLoadingSkeleton();
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`chat-message ${isUser ? 'user-message' : 'ai-message'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Box className="message-container">
        {/* Message Content */}
        <Box className={`message-content ${isUser ? 'user-bubble' : 'ai-content'}`}>
          <Typography
            className="message-text"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: 1.6,
              fontSize: '15px',
              color: isUser ? '#fff' : theme.palette.text.primary,
              fontFamily: '-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Roboto\", sans-serif',
            }}
          >
            {message.content}
          </Typography>

          {/* Action buttons for AI messages */}
          {isAI && (
            <Box
              className="message-actions"
              sx={{
                opacity: showActions ? 1 : 0,
                transition: 'opacity 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 1,
                pt: 1,
              }}
            >
              <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                <IconButton
                  size="small"
                  onClick={handleCopyToClipboard}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.action.hover, 0.1),
                    },
                  }}
                >
                  {copied ? (
                    <CheckIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title={liked ? 'Good response' : 'Like'}>
                <IconButton
                  size="small"
                  onClick={handleLike}
                  sx={{
                    color: liked ? '#10a37f' : theme.palette.text.secondary,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.action.hover, 0.1),
                    },
                  }}
                >
                  <ThumbUpIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title={disliked ? 'Poor response' : 'Dislike'}>
                <IconButton
                  size="small"
                  onClick={handleDislike}
                  sx={{
                    color: disliked ? theme.palette.error.main : theme.palette.text.secondary,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.action.hover, 0.1),
                    },
                  }}
                >
                  <ThumbDownIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>

      {/* Timestamp - positioned absolutely for user messages */}
      {isUser && (
        <Typography
          variant="caption"
          className="message-timestamp"
          sx={{
            color: alpha(theme.palette.text.secondary, 0.7),
            fontSize: '11px',
            mt: 0.5,
            textAlign: 'right',
          }}
        >
          {formatTime(new Date(message.createdAt))}
        </Typography>
      )}
    </Box>
  );
};

export default React.memo(ChatMessage);