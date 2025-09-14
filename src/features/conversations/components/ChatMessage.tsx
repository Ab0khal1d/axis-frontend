import { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  useTheme,
  Skeleton,
  IconButton,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { formatTime } from '../../../common/utils/dateUtils';
import type { Message } from '../types';
import type { RootState } from '../../../redux/store';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}
import './ChatMessage.css';
import { useState } from 'react';

/**
 * ChatMessage component with markdown and code highlighting support
 */
const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading }) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  // Get settings from Redux store
  const settings = useSelector((state: RootState) => state.settings);

  const isAI = message.author === 'assistant';
  const isUser = message.author === 'user';

  const avatarIcon = useMemo(() => {
    if (isAI) return <SmartToyIcon />;
    if (isUser) return <PersonIcon />;
    return <WarningAmberIcon />;
  }, [isAI, isUser]);

  const avatarColor = useMemo(() => {
    if (isAI) return theme.palette.primary.main;
    if (isUser) return theme.palette.grey[700];
    return theme.palette.warning.main;
  }, [isAI, isUser, theme]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        display: 'flex',
        mb: settings.messageSpacing / 16, // Convert px to rem
        px: { xs: 2, sm: 3 },
        pt: 2,
        pb: 1,
        backgroundColor: isAI
          ? theme.palette.action.hover
          : 'transparent',
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          bgcolor: avatarColor,
          width: 38,
          height: 38,
          mr: 2,
          mt: 0.5,
        }}
      >
        {avatarIcon}
      </Avatar>

      {/* Message Content */}
      <Box sx={{ flexGrow: 1, maxWidth: '85%' }}>
        {/* Message Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.5,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: isAI
                ? theme.palette.primary.main
                : theme.palette.text.primary,
            }}
          >
            {isAI ? 'DeepSeek AI' : isUser ? 'You' : 'System'}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {formatTime(new Date(message.createdAt))}
          </Typography>
        </Box>

        {/* Message Body */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: 'transparent',
            borderRadius: 2,
            position: 'relative',
            '&:hover .copy-button': {
              opacity: 1,
            }
          }}
        >
          {isLoading ? (
            <>
              <Skeleton animation="wave" height={20} width="90%" />
              <Skeleton animation="wave" height={20} width="75%" />
              <Skeleton animation="wave" height={20} width="60%" />
            </>
          ) : (
            <>
              {/* Copy message button - visible on hover */}
              <Tooltip title={copied ? "Copied!" : "Copy message"}>
                <IconButton
                  size="small"
                  onClick={handleCopyToClipboard}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    opacity: 0,
                    bgcolor: theme.palette.action.hover,
                    transition: 'opacity 0.2s',
                  }}
                  className="copy-button"
                >
                  {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatMessage;