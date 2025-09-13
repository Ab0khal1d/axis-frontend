import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import type { ChatHeaderProps } from './types';
import './ChatHeader.css';

/**
 * ChatHeader component styled to match DeepSeek's UI
 * This is a minimalist header with centered title
 */
const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  subtitle,
}) => {
  return (
    <Box className="deepseek-header-container">
      {/* Centered Title and Subtitle - now with fixed height to prevent layout shift */}
      <div className="deepseek-title-container">
        <Typography
          variant="h6"
          className="deepseek-chat-title"
        >
          {title}
        </Typography>

        <Typography
          variant="caption"
          className="deepseek-chat-subtitle"
        >
          {subtitle || "\u00A0"}  {/* Use non-breaking space if no subtitle */}
        </Typography>
      </div>

      {/* Action buttons - positioned at the right */}
      <div className="deepseek-actions-container">
        <Tooltip title="Share conversation">
          <IconButton size="small" className="deepseek-action-button">
            <ShareOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton size="small" className="deepseek-action-button">
            <SettingsOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </Box>
  );
};

export default ChatHeader;