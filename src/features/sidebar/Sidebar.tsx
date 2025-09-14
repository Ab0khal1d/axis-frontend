import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  IconButton,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FolderIcon from '@mui/icons-material/Folder';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useConversations } from '../conversations/hooks/useConversations';
import { formatRelativeTime } from '../../common/utils/dateUtils';
import './Sidebar.css';
import type { Conversation } from '../conversations/types';


interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: 'temporary' | 'persistent';
}

/**
 * Sidebar component for navigating conversations
 */
function Sidebar() {
  const theme = useTheme();
  const {
    conversations,
    activeConversationId,
    selectConversation,
    deleteConversation,
    refetchConversations
  } = useConversations();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [collapsed, setCollapsed] = useState(false);
  const [categorizedConversations, setCategorizedConversations] = useState<{
    today: Conversation[];
    yesterday: Conversation[];
    last7Days: Conversation[];
    last30Days: Conversation[];
    older: Conversation[];
  }>({
    today: [],
    yesterday: [],
    last7Days: [],
    last30Days: [],
    older: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const variant = isMobile ? 'temporary' : 'persistent'
  // Fetch conversations on mount
  useEffect(() => {
    refetchConversations();
  }, [refetchConversations]);
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const last7DaysStart = new Date(today);
    last7DaysStart.setDate(last7DaysStart.getDate() - 7);

    const last30DaysStart = new Date(today);
    last30DaysStart.setDate(last30DaysStart.getDate() - 30);

    const filtered = searchTerm
      ? conversations.filter(conv =>
        conv.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : conversations;

    const categorized = {
      today: filtered.filter(conv => {
        const date = new Date(conv.updatedAt || conv.createdAt);
        return date >= today;
      }),
      yesterday: filtered.filter(conv => {
        const date = new Date(conv.updatedAt || conv.createdAt);
        return date >= yesterday && date < today;
      }),
      last7Days: filtered.filter(conv => {
        const date = new Date(conv.updatedAt || conv.createdAt);
        return date >= last7DaysStart && date < yesterday;
      }),
      last30Days: filtered.filter(conv => {
        const date = new Date(conv.updatedAt || conv.createdAt);
        return date >= last30DaysStart && date < last7DaysStart;
      }),
      older: filtered.filter(conv => {
        const date = new Date(conv.updatedAt || conv.createdAt);
        return date < last30DaysStart;
      })
    };

    setCategorizedConversations(categorized);
  }, [conversations, searchTerm]);

  function onClose() {
    setCollapsed(true);
  }

  function handleSelectConversation(id: string) {
    selectConversation(id);
    if (variant === 'temporary') {
      onClose();
    }
  };

  // TODO: Implement pin functionality when backend supports it
  function handleTogglePin(id: string, event: React.MouseEvent) {
    event.stopPropagation();
    console.log('Toggle pin for conversation', id);
  };

  function handleDeleteConversation(id: string, event: React.MouseEvent) {
    event.stopPropagation();
    deleteConversation(id);
  };

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          border: 'none',
          backgroundColor: theme.palette.mode === 'light'
            ? alpha(theme.palette.primary.main, 0.04)
            : alpha(theme.palette.background.paper, 0.9),
        },
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2
      }}>
        <Typography variant="h6" fontWeight={600}>
          Conversations
        </Typography>

        {variant === 'temporary' && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Divider />

      <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 1 }}>
        <AnimatePresence>
          {conversations.length === 0 ? (
            <Box
              sx={{
                p: 2,
                textAlign: 'center',
                color: theme.palette.text.secondary
              }}
            >
              <Typography variant="body2">
                No conversations yet
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {conversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListItem
                    disablePadding
                    sx={{ mb: 0.5 }}
                  >
                    <ListItemButton
                      selected={conversation.id === activeConversationId}
                      onClick={() => handleSelectConversation(conversation.id)}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        '&.Mui-selected': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.15),
                          }
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <ChatBubbleOutlineIcon
                          fontSize="small"
                          color={conversation.id === activeConversationId ? "primary" : "inherit"}
                        />
                      </ListItemIcon>

                      <ListItemText
                        primary={conversation.title || 'New chat'}
                        secondary={formatRelativeTime(new Date(conversation.lastMessageAt || conversation.createdAt))}
                        primaryTypographyProps={{
                          noWrap: true,
                          sx: {
                            fontWeight: conversation.id === activeConversationId ? 500 : 400
                          }
                        }}
                      />

                      <Box
                        sx={{
                          display: 'flex',
                          visibility: 'hidden',
                          '.MuiListItemButton-root:hover &': {
                            visibility: 'visible',
                          },
                          '.MuiListItemButton-root.Mui-selected &': {
                            visibility: 'visible',
                          }
                        }}
                        className="conversation-actions"
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => handleTogglePin(conversation.id, e)}
                        >
                          {false ? (
                            <PushPinIcon fontSize="small" />
                          ) : (
                            <PushPinOutlinedIcon fontSize="small" />
                          )}
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={(e) => handleDeleteConversation(conversation.id, e)}
                          color="error"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                </motion.div>
              ))}
            </List>
          )}
        </AnimatePresence>
      </Box>

      <Divider />

      <List sx={{ p: 1 }}>
        <ListItem disablePadding>
          <ListItemButton sx={{ borderRadius: 2 }}>
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText primary="Saved Conversations" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;