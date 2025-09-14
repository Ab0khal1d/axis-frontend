import {
  Box,
  List,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Button,
  InputAdornment,
  TextField
} from '@mui/material';
import { useEffect, useState } from 'react';
import './Sidebar.css';
import { ChevronRight, ChevronLeft, SearchOutlined } from '@mui/icons-material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import AddCommentRoundedIcon from '@mui/icons-material/AddCommentRounded';
import { useAppDispatch, useAppSelector } from '../../redux/hook';
import {
  fetchUserConversations,
  setActiveConversation
} from '../conversations/redux/conversationsSlice';
import {
  selectFilteredCategorizedConversations,
  selectActiveConversationId
} from '../conversations/redux/conversationsSelectors';



/**
 * Sidebar component for navigating conversations
 */
function Sidebar() {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // Redux state selectors
  const activeConversationId = useAppSelector(selectActiveConversationId);

  // Local UI state
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const variant = isMobile ? 'temporary' : 'persistent';

  // Get categorized conversations based on search term
  const categorizedConversations = useAppSelector(selectFilteredCategorizedConversations(searchTerm));

  // Fetch conversations on mount
  useEffect(() => {
    dispatch(fetchUserConversations({
      userId: "96b7d3ed-8e30-431c-bb61-dd6a114daa44",
      pageNumber: 1,
      pageSize: 50
    }));
  }, [dispatch]);

  function onClose() {
    setCollapsed(true);
  }

  function handleSelectConversation(id: string) {
    dispatch(setActiveConversation(id));
    if (variant === 'temporary') {
      onClose();
    }
  };




  return (
    <Box
      className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}
      sx={{
        position: 'relative',
        width: collapsed ? '60px' : '270px',
        minWidth: collapsed ? '60px' : '270px',
        transition: 'width 0.2s, min-width 0.2s',
      }}
    >
      {/* Collapsed sidebar content */}
      {collapsed && (
        <Box className="collapsed-sidebar-content">
          {/* Logo */}
          <Avatar
            className="collapsed-sidebar-logo"
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'transparent',
              '& .MuiSvgIcon-root': { fontSize: 18, color: 'white' }
            }}
          >
            <Box
              component="img"
              sx={{
                width: 30,
                height: 30
              }}
              src="/deepseek-logo.svg"
              alt="DeepSeek Logo"
            />
          </Avatar>

          {/* New Chat Button */}
          <IconButton
            className="collapsed-new-chat-button"
            onClick={() => dispatch(setActiveConversation(null))}
            sx={{
              backgroundColor: 'rgba(77, 111, 229, 0.1)',
              color: '#4D6FE5',
              '&:hover': {
                backgroundColor: 'rgba(77, 111, 229, 0.2)',
              },
              margin: '12px 0',
            }}
          >
            <AddCommentRoundedIcon fontSize="small" />
          </IconButton>

          {/* Collapse/Expand button */}
          <IconButton
            className="collapsed-toggle-button"
            onClick={() => setCollapsed(false)}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Expand/Collapse button for expanded mode */}
      {!collapsed && (
        <IconButton
          size="small"
          className="collapse-button"
          onClick={() => setCollapsed(true)}
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <ChevronLeft fontSize="small" />
        </IconButton>
      )}

      {/* Only render full content when not collapsed */}
      {!collapsed && (
        <>
          {/* DeepSeek Logo & Header */}
          <Box className="sidebar-logo">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'transparent',
                mr: 1.5
              }}
            >
              <Box
                component="img"
                sx={{
                  width: 30,
                  height: 30
                }}
                src="/deepseek-logo.svg"
                alt="DeepSeek Logo"
              />
            </Avatar>
            <Typography className="sidebar-header">
              A x I S
            </Typography>
          </Box>

          {/* New Chat button */}
          <Box sx={{ px: 2, py: 1 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              className="new-chat-button"
              startIcon={<AddCommentRoundedIcon />}
              onClick={() => dispatch(setActiveConversation(null))}
            >
              New chat
            </Button>
          </Box>

          {/* Search box */}
          <Box sx={{ px: 2, pb: 1, pt: 0.5 }}>
            <TextField
              fullWidth
              placeholder="Search messages"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              className="search-input"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined fontSize="small" sx={{ color: 'text.secondary', opacity: 0.7 }} />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Conversation list */}
          <Box
            className="hide-scrollbar"
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              px: 1,
              py: 1,
              overflowX: 'hidden'
            }}
          >
            {/* Today's conversations */}
            {categorizedConversations.today.length > 0 && (
              <>
                <Typography className="conversation-category">
                  Today
                </Typography>
                <List disablePadding>
                  {categorizedConversations.today.map((conversation) => (
                    <Box
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`conversation-item ${activeConversationId === conversation.id ? 'active' : ''}`}
                      sx={{
                        px: 2,
                        py: 1.5,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Typography
                          className="conversation-title"
                          sx={{
                            color: activeConversationId === conversation.id
                              ? theme.palette.primary.main
                              : theme.palette.text.primary,
                            maxWidth: '85%'
                          }}
                        >
                          {conversation.title}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{
                            padding: 0.5,
                            opacity: 0,
                            '&:hover': { opacity: 1 },
                            '& .MuiSvgIcon-root': { fontSize: '1.1rem' }
                          }}
                        >
                          <MoreHorizIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </List>
              </>
            )}

            {/* Yesterday's conversations */}
            {categorizedConversations.yesterday.length > 0 && (
              <>
                <Typography className="conversation-category">
                  Yesterday
                </Typography>
                <List disablePadding>
                  {categorizedConversations.yesterday.map((conversation) => (
                    <Box
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`conversation-item ${activeConversationId === conversation.id ? 'active' : ''}`}
                      sx={{
                        px: 2,
                        py: 1.5,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Typography
                          className="conversation-title"
                          sx={{
                            color: activeConversationId === conversation.id
                              ? theme.palette.primary.main
                              : theme.palette.text.primary,
                            maxWidth: '85%'
                          }}
                        >
                          {conversation.title}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{
                            padding: 0.5,
                            opacity: 0,
                            '&:hover': { opacity: 1 },
                            '& .MuiSvgIcon-root': { fontSize: '1.1rem' }
                          }}
                        >
                          <MoreHorizIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </List>
              </>
            )}

            {/* 7 Days conversations */}
            {categorizedConversations.last7Days.length > 0 && (
              <>
                <Typography className="conversation-category">
                  7 Days
                </Typography>
                <List disablePadding>
                  {categorizedConversations.last7Days.map((conversation) => (
                    <Box
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`conversation-item ${activeConversationId === conversation.id ? 'active' : ''}`}
                      sx={{
                        px: 2,
                        py: 1.5,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Typography
                          className="conversation-title"
                          sx={{
                            color: activeConversationId === conversation.id
                              ? theme.palette.primary.main
                              : theme.palette.text.primary,
                            maxWidth: '85%'
                          }}
                        >
                          {conversation.title}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{
                            padding: 0.5,
                            opacity: 0,
                            '&:hover': { opacity: 1 },
                            '& .MuiSvgIcon-root': { fontSize: '1.1rem' }
                          }}
                        >
                          <MoreHorizIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </List>
              </>
            )}

            {/* 30 Days conversations */}
            {categorizedConversations.last30Days.length > 0 && (
              <>
                <Typography className="conversation-category">
                  30 Days
                </Typography>
                <List disablePadding>
                  {categorizedConversations.last30Days.map((conversation) => (
                    <Box
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`conversation-item ${activeConversationId === conversation.id ? 'active' : ''}`}
                      sx={{
                        px: 2,
                        py: 1.5,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Typography
                          className="conversation-title"
                          sx={{
                            color: activeConversationId === conversation.id
                              ? theme.palette.primary.main
                              : theme.palette.text.primary,
                            maxWidth: '85%'
                          }}
                        >
                          {conversation.title}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{
                            padding: 0.5,
                            opacity: 0,
                            '&:hover': { opacity: 1 },
                            '& .MuiSvgIcon-root': { fontSize: '1.1rem' }
                          }}
                        >
                          <MoreHorizIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </List>
              </>
            )}

            {/* No results message */}
            {Object.values(categorizedConversations).every(arr => arr.length === 0) && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No conversations found
                </Typography>
              </Box>
            )}
          </Box>

          {/* User profile section at bottom */}
          <Box className="user-profile">
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: 'rgba(77, 111, 229, 0.15)',
                color: '#4D6FE5',
                mr: 1.5,
                fontSize: '0.8rem',
              }}
            >
              M
            </Avatar>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: 'text.primary', flexGrow: 1 }}>
              USER NAME PLACEHOLDER TO BE SET
            </Typography>
            <IconButton
              size="small"
              sx={{
                padding: 0.5,
                '& .MuiSvgIcon-root': { fontSize: '1.1rem' },
                '&:hover': { color: theme.palette.error.main }
              }}
              title="Logout"
            >
              <LogoutOutlined fontSize="small" sx={{ color: theme.palette.text.secondary }} />
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Sidebar;