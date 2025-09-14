import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  useTheme,
  Skeleton,
  IconButton,
  Tooltip,
  Chip,
  Fade,
  alpha,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Modern icons for better visual appeal
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
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

  // Enhanced styling based on message type
  const messageStyles = useMemo(() => {
    const baseStyles = {
      borderRadius: '24px',
      position: 'relative' as const,
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    if (isAI) {
      return {
        ...baseStyles,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.08)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, 
            ${theme.palette.primary.main}, 
            ${theme.palette.secondary.main})`,
        },
      };
    }

    if (isUser) {
      return {
        ...baseStyles,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.grey[100], 0.8)} 0%, 
          ${alpha(theme.palette.grey[50], 0.6)} 100%)`,
        border: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
        backdropFilter: 'blur(10px)',
      };
    }

    return {
      ...baseStyles,
      background: alpha(theme.palette.warning.main, 0.1),
      border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
    };
  }, [isAI, isUser, theme]);

  const avatarConfig = useMemo(() => {
    if (isAI) {
      return {
        icon: <AutoAwesomeIcon />,
        gradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        name: 'AxIS AI',
        badge: 'AI',
      };
    }
    if (isUser) {
      return {
        icon: <AccountCircleIcon />,
        gradient: `linear-gradient(135deg, ${theme.palette.grey[600]} 0%, ${theme.palette.grey[800]} 100%)`,
        name: 'You',
        badge: null,
      };
    }
    return {
      icon: <WarningAmberIcon />,
      gradient: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.error.main} 100%)`,
      name: 'System',
      badge: 'SYS',
    };
  }, [isAI, isUser, theme]);

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

  const renderLoadingSkeleton = () => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="30%" height={20} />
          <Skeleton variant="text" width="20%" height={16} />
        </Box>
      </Box>
      <Box sx={{ pl: 7 }}>
        <Skeleton variant="text" width="95%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={24} />
      </Box>
    </Box>
  );

  const renderMessageContent = () => {
    if (isLoading) return renderLoadingSkeleton();

    return (
      <Box sx={{ p: 3, position: 'relative' }}>
        {/* Header with Avatar and Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                background: avatarConfig.gradient,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                mr: 2,
              }}
            >
              {avatarConfig.icon}
            </Avatar>
            {avatarConfig.badge && (
              <Chip
                label={avatarConfig.badge}
                size="small"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: 8,
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  background: avatarConfig.gradient,
                  color: 'white',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                background: isAI ? avatarConfig.gradient : 'inherit',
                backgroundClip: isAI ? 'text' : 'inherit',
                WebkitBackgroundClip: isAI ? 'text' : 'inherit',
                WebkitTextFillColor: isAI ? 'transparent' : 'inherit',
                mb: 0.5,
              }}
            >
              {avatarConfig.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
              }}
            >
              {formatTime(new Date(message.createdAt))}
            </Typography>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ display: 'flex', gap: 0.5, opacity: showActions ? 1 : 0, transition: 'opacity 0.3s' }}>
            <Tooltip title={copied ? 'Copied!' : 'Copy message'}>
              <IconButton
                size="small"
                onClick={handleCopyToClipboard}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                }}
              >
                {copied ? (
                  <CheckIcon fontSize="small" color="success" />
                ) : (
                  <ContentCopyIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Message Content */}
        <Box sx={{ pl: 7, pr: 2 }}>
          <Typography
            variant="body1"
            className="message-content"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: 1.7,
              fontSize: '1rem',
              color: theme.palette.text.primary,
              fontFamily: isAI ? '"Inter", "Segoe UI", system-ui, sans-serif' : 'inherit',
              letterSpacing: isAI ? '0.01em' : 'inherit',
            }}
          >
            {message.content}
          </Typography>

          {/* Interactive Actions for AI messages */}
          {isAI && (
            <AnimatePresence>
              <Fade in={showActions} timeout={300}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 2,
                    pt: 2,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                    Was this helpful?
                  </Typography>

                  <Tooltip title="Good response">
                    <IconButton
                      size="small"
                      onClick={handleLike}
                      sx={{
                        color: liked ? theme.palette.success.main : theme.palette.text.secondary,
                        '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) },
                      }}
                    >
                      <ThumbUpIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Poor response">
                    <IconButton
                      size="small"
                      onClick={handleDislike}
                      sx={{
                        color: disliked ? theme.palette.error.main : theme.palette.text.secondary,
                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) },
                      }}
                    >
                      <ThumbDownIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Box sx={{ flexGrow: 1 }} />

                  <Tooltip title="Share response">
                    <IconButton
                      size="small"
                      sx={{
                        color: theme.palette.text.secondary,
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                      }}
                    >
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit message">
                    <IconButton
                      size="small"
                      sx={{
                        color: theme.palette.text.secondary,
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Fade>
            </AnimatePresence>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: isLoading ? 0 : 0.1
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      sx={{
        mb: 3,
        mx: { xs: 2, sm: 3, md: 4 },
        maxWidth: '100%',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          ...messageStyles,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        }}
      >
        {renderMessageContent()}
      </Paper>
    </Box>
  );
};

export default React.memo(ChatMessage);