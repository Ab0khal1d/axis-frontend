import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  InputAdornment,
  Tooltip,
  Button,
  useTheme,
  Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import type { ChatInputProps } from './types';

/**
 * ChatInput provides the message input area with DeepSeek-style UI
 */
const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Send a message...'
}) => {
  const [message, setMessage] = useState('');
  const theme = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        p: 2,
        pt: 1,
        pb: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        backgroundColor: theme.palette.background.default,
        maxWidth: '900px',
        mx: 'auto',
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Feature buttons above the input */}
      <Box sx={{ display: 'flex', mb: 1.5, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<SearchOutlinedIcon />}
          sx={{
            borderRadius: 4,
            mr: 1.5,
            color: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
            px: 1.5,
            py: 0.5,
            textTransform: 'none',
            fontSize: '0.875rem',
            '&:hover': {
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.grey[300]
            }
          }}
        >
          Allowed automatic logouts number?
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PsychologyOutlinedIcon />}
          sx={{
            borderRadius: 4,
            color: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
            px: 1.5,
            py: 0.5,
            textTransform: 'none',
            fontSize: '0.875rem',
            '&:hover': {
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.grey[300]
            }
          }}
        >
          Explain Point Based Promotions
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PsychologyOutlinedIcon />}
          sx={{
            borderRadius: 4,
            color: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
            px: 1.5,
            py: 0.5,
            textTransform: 'none',
            fontSize: '0.875rem',
            '&:hover': {
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.grey[300]
            }
          }}
        >
          business trip perdiem?
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          autoComplete="off"
          multiline
          maxRows={5}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Tooltip title="Attach file">
                  <IconButton
                    color="default"
                    edge="start"
                    sx={{ color: theme.palette.text.secondary, ml: 0.5 }}
                  >
                    <AttachFileOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Voice input">
                  <IconButton
                    color="default"
                    edge="end"
                    sx={{ color: theme.palette.text.secondary, mr: 0.5 }}
                  >
                    <MicNoneOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
            sx: {
              borderRadius: 4,
              backgroundColor: theme.palette.background.paper,
              '&.Mui-focused': {
                boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
              },
              padding: '10px 5px',
              alignItems: 'center'
            }
          }}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.divider,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.grey[300],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
            },
          }}
        />
        <IconButton
          color="primary"
          type="submit"
          disabled={!message.trim() || disabled}
          sx={{
            ml: 1,
            bgcolor: theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
            '&.Mui-disabled': {
              bgcolor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
            },
            width: 38,
            height: 38,
            borderRadius: '50%',
            transition: 'all 0.2s',
            '& .MuiSvgIcon-root': {
              fontSize: '1.2rem',
            }
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        mt: 1.5,
        color: theme.palette.text.secondary,
      }}>
        <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.75rem' }}>
          DeepSeek Chat can make mistakes. Check important information.
        </Typography>
      </Box>
    </Paper>
  );
};

export default ChatInput;