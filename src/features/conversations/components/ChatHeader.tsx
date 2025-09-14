import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
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
        justifyContent: 'center',
        px: 3,
        py: 2,
        backgroundColor: theme.palette.background.default,
        borderBottom: 'none',
        zIndex: 100,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {isEditing ? (
          <TextField
            autoFocus
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            variant="standard"
            placeholder="Conversation title"
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
                fontWeight: 400,
                fontSize: '0.9rem',
                color: theme.palette.text.secondary,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.5,
              }}
            >
              {title}
              {onTitleEdit && (
                <Tooltip title="Edit title">
                  <IconButton
                    size="small"
                    onClick={handleEditClick}
                    sx={{
                      opacity: 0.5,
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
                sx={{
                  color: theme.palette.text.disabled,
                  fontSize: '0.75rem',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ChatHeader;