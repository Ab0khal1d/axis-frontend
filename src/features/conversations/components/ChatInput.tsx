import { useState, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  Typography,
  Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BusinessIcon from '@mui/icons-material/Business';
import type { ChatInputProps } from './types';
import { useAppSelector } from '../../../redux/hook';
import { selectActiveConversationId } from '../redux/conversationsSelectors';

/**
 * Chat input component with animations and attachment support
 */
function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...'
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const activeConversationId = useAppSelector(selectActiveConversationId);

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

  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: theme.palette.background.default,
        borderTop: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(8px)',
        zIndex: 10,
      }}
    >
      <Box
        sx={{
          maxWidth: '768px',
          mx: 'auto',
          p: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 2.5 },
        }}
      >
        {/* Modern Question Buttons */}
        {!activeConversationId && <Box sx={{
          display: 'flex',
          mb: 2,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1.5,
          px: 1,
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none'
        }}>
          <Button
            variant="text"
            size="small"
            startIcon={
              <HelpOutlineIcon
                sx={{
                  fontSize: '16px !important',
                  color: theme.palette.primary.main
                }}
              />
            }
            onClick={() => setMessage('Allowed automatic logouts number?')}
            sx={{
              borderRadius: 20,
              backgroundColor: theme.palette.grey[50],
              color: theme.palette.text.primary,
              px: 2,
              py: 1,
              minWidth: 'auto',
              whiteSpace: 'nowrap',
              textTransform: 'none',
              fontSize: '13px',
              fontWeight: 500,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                borderColor: theme.palette.primary.main,
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
                '& .MuiSvgIcon-root': {
                  color: 'white !important'
                }
              }
            }}
          >
            Logout Rules?
          </Button>

          <Button
            variant="text"
            size="small"
            startIcon={
              <ListAltIcon
                sx={{
                  fontSize: '16px !important',
                  color: theme.palette.primary.main
                }}
              />
            }
            onClick={() => setMessage('Explain Point Based Promotions')}
            sx={{
              borderRadius: 20,
              backgroundColor: theme.palette.grey[50],
              color: theme.palette.text.primary,
              px: 2,
              py: 1,
              minWidth: 'auto',
              whiteSpace: 'nowrap',
              textTransform: 'none',
              fontSize: '13px',
              fontWeight: 500,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                borderColor: theme.palette.primary.main,
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
                '& .MuiSvgIcon-root': {
                  color: 'white !important'
                }
              }
            }}
          >
            Point Promotions?
          </Button>

          <Button
            variant="text"
            size="small"
            startIcon={
              <BusinessIcon
                sx={{
                  fontSize: '16px !important',
                  color: theme.palette.primary.main
                }}
              />
            }
            onClick={() => setMessage('business trip perdiem?')}
            sx={{
              borderRadius: 20,
              backgroundColor: theme.palette.grey[50],
              color: theme.palette.text.primary,
              px: 2,
              py: 1,
              minWidth: 'auto',
              whiteSpace: 'nowrap',
              textTransform: 'none',
              fontSize: '13px',
              fontWeight: 500,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                borderColor: theme.palette.primary.main,
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
                '& .MuiSvgIcon-root': {
                  color: 'white !important'
                }
              }
            }}
          >
            Travel Perdiem?
          </Button>
        </Box>}

        {/* Main Input Container */}
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <Box
            sx={{
              flex: 1,
              position: 'relative',
              borderRadius: '24px',
              background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
              border: `1.5px solid ${theme.palette.divider}`,
              boxShadow: disabled
                ? 'none'
                : `0 2px 12px ${theme.palette.action.hover}, 0 0 0 0px ${theme.palette.primary.main}00`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': disabled ? {} : {
                borderColor: theme.palette.primary.light,
                boxShadow: `0 4px 20px ${theme.palette.action.selected}, 0 0 0 1px ${theme.palette.primary.main}15`,
                transform: 'translateY(-1px)',
              },
              '&:focus-within': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 4px 24px ${theme.palette.primary.main}20, 0 0 0 3px ${theme.palette.primary.main}15`,
                transform: 'translateY(-2px)',
                background: theme.palette.background.paper,
              },
            }}
          >
            <TextField
              inputRef={inputRef}
              fullWidth
              multiline
              maxRows={4}
              minRows={1}
              variant="standard"
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder={disabled ? 'Please wait...' : placeholder}
              disabled={disabled ?? false}
              autoComplete="off"
              InputProps={{
                disableUnderline: true,
                sx: {
                  px: 3,
                  py: 2,
                  fontSize: '16px',
                  lineHeight: 1.5,
                  color: theme.palette.text.primary,
                  '&::placeholder': {
                    color: theme.palette.text.secondary,
                    opacity: 0.7,
                  },
                  '& textarea': {
                    resize: 'none',
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: theme.palette.action.hover,
                      borderRadius: '3px',
                    },
                  },
                },
              }}
            />

            {/* Send Button Container */}
            <Box
              sx={{
                position: 'absolute',
                right: 8,
                bottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {disabled ? (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '20px',
                    backgroundColor: theme.palette.action.hover,
                  }}
                >
                  <CircularProgress
                    size={20}
                    thickness={4}
                    sx={{
                      color: theme.palette.primary.main,
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
                    }}
                  />
                </Box>
              ) : (
                <Tooltip
                  title={message.trim() ? "Send message (Enter)" : "Type a message to send"}
                  placement="top"
                  arrow
                >
                  <span>
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '20px',
                        backgroundColor: message.trim()
                          ? theme.palette.primary.main
                          : theme.palette.action.hover,
                        color: message.trim()
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.disabled,
                        boxShadow: message.trim()
                          ? `0 2px 8px ${theme.palette.primary.main}40, 0 0 0 0px ${theme.palette.primary.main}20`
                          : 'none',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: 'scale(1)',
                        '&:hover': {
                          backgroundColor: message.trim()
                            ? theme.palette.primary.dark
                            : theme.palette.action.selected,
                          transform: message.trim() ? 'scale(1.05)' : 'scale(1.02)',
                          boxShadow: message.trim()
                            ? `0 4px 16px ${theme.palette.primary.main}50, 0 0 0 2px ${theme.palette.primary.main}25`
                            : `0 2px 8px ${theme.palette.action.hover}`,
                        },
                        '&:active': {
                          transform: 'scale(0.98)',
                        },
                        '&:disabled': {
                          backgroundColor: theme.palette.action.hover,
                          color: theme.palette.text.disabled,
                          transform: 'scale(1)',
                          boxShadow: 'none',
                        },
                      }}
                    >
                      <SendIcon
                        sx={{
                          fontSize: '18px',
                          transform: 'translateX(1px)', // Perfect visual alignment
                        }}
                      />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>

        {/* Enhanced Footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 2,
            px: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              opacity: 0.8,
              fontSize: '12px',
              fontWeight: 400,
              letterSpacing: '0.25px',
              textAlign: 'center',
              background: `linear-gradient(45deg, ${theme.palette.text.secondary} 30%, ${theme.palette.primary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ✨ AxIS Chat can make mistakes. Verify important information.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatInput;