import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  TextField,
  InputAdornment,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type { ChatHeaderProps } from './types';
import './ChatHeader.css';

/**
 * ChatHeader component with editable title and status
 */
const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  subtitle,
  avatarUrl,
  onlineStatus = false,
  actions,
  onTitleEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const theme = useTheme();

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedTitle(title);
  };

  const handleSaveClick = () => {
    if (onTitleEdit && editedTitle.trim()) {
      onTitleEdit(editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedTitle(title);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveClick();
    } else if (e.key === 'Escape') {
      handleCancelClick();
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 1.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          src={avatarUrl || '/deepseek-logo.svg'}
          alt="DeepSeek AI"
          sx={{
            width: 40,
            height: 40,
            mr: 2,
            bgcolor: theme.palette.primary.main,
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        />

        <Box sx={{ position: 'relative' }}>
          {isEditing ? (
            <TextField
              autoFocus
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              variant="standard"
              placeholder="Conversation title"
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={handleSaveClick}
                      disabled={!editedTitle.trim()}
                      color="primary"
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={handleCancelClick}
                      color="default"
                      sx={{ ml: 0.5 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: '200px' }}
            />
          ) : (
            <>
              <Typography
                variant="h6"
                component="div"
                className="chat-title"
                sx={{
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {title}
                {onTitleEdit && (
                  <Tooltip title="Edit title">
                    <IconButton
                      size="small"
                      onClick={handleEditClick}
                      sx={{
                        opacity: 0.7,
                        '&:hover': { opacity: 1 },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Typography>
              {subtitle && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}
                >
                  {onlineStatus && (
                    <Box
                      component="span"
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        mr: 1,
                      }}
                    />
                  )}
                  {subtitle}
                </Typography>
              )}
            </>
          )}
        </Box>
      </Box>

      <Box>
        {actions || (
          <Tooltip title="More options">
            <IconButton size="small">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default ChatHeader;