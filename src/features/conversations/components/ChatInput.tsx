import { useState, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Tooltip,
  CircularProgress,
  InputAdornment,
  useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachmentIcon from '@mui/icons-material/Attachment';
import MicIcon from '@mui/icons-material/Mic';
import { motion } from 'framer-motion';
import type { ChatInputProps } from './types';

/**
 * Chat input component with animations and attachment support
 */
const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...',
  showSuggestions = false,
  suggestions = []
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (message.trim() && onSendMessage && !disabled) {
      onSendMessage(message);
      setMessage('');

      // Focus back on input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Send message on Enter (without shift key)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    // Focus and place cursor at the end
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(suggestion.length, suggestion.length);
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      sx={{
        px: 2,
        py: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mb: 2,
            justifyContent: 'center'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <Tooltip
              key={index}
              title={suggestion}
              placement="top"
            >
              <Paper
                component={motion.div}
                whileHover={{ y: -2, boxShadow: theme.shadows[3] }}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '200px'
                }}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.length > 25
                  ? `${suggestion.substring(0, 25)}...`
                  : suggestion
                }
              </Paper>
            </Tooltip>
          ))}
        </Box>
      )}

      {/* Input Area */}
      <Paper
        elevation={0}
        sx={{
          p: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '24px',
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          '&:hover': {
            boxShadow: theme.shadows[2],
          },
          boxShadow: theme.shadows[1],
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <TextField
          inputRef={inputRef}
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <IconButton
                  size="small"
                  color="primary"
                  sx={{ mr: 1 }}
                  disabled={disabled}
                >
                  <AttachmentIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          variant="standard"
          sx={{
            mx: 1,
            '& .MuiInputBase-root': {
              px: 1,
              backgroundColor: 'transparent',
            },
          }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Voice input">
            <IconButton
              size="small"
              color="primary"
              disabled={disabled}
            >
              <MicIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {disabled ? (
            <CircularProgress size={24} color="primary" />
          ) : (
            <Tooltip title="Send message">
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!message.trim()}
                sx={{
                  backgroundColor: message.trim() ? theme.palette.primary.main : 'inherit',
                  color: message.trim() ? 'white' : theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: message.trim() ? theme.palette.primary.dark : theme.palette.action.hover,
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatInput;