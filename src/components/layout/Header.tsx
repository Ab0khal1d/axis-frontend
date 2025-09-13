import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Divider,
  ListItemIcon,
  useTheme
} from '@mui/material';
import {
  Settings as SettingsIcon,
  AccountCircleOutlined,
  Brightness4Outlined,
  Brightness7Outlined,
  LogoutOutlined,
  HelpOutlineOutlined
} from '@mui/icons-material';

interface HeaderProps {
  userName: string;
  userAvatar?: string;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  onOpenSettings: () => void;
}

const Header = ({
  userName,
  userAvatar,
  onToggleTheme,
  isDarkMode,
  onOpenSettings
}: HeaderProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSettingsClick = () => {
    handleMenuClose();
    onOpenSettings();
  };

  const menuOpen = Boolean(anchorEl);

  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
          Enterprise AI
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton color="inherit" onClick={onToggleTheme} sx={{ mr: 1 }}>
            {isDarkMode ? <Brightness7Outlined /> : <Brightness4Outlined />}
          </IconButton>

          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-controls="profile-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            {userAvatar ? (
              <Avatar
                src={userAvatar}
                alt={userName}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: theme.palette.primary.main
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </IconButton>
        </Box>
      </Toolbar>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        keepMounted
        open={menuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            boxShadow: theme.shadows[3],
            borderRadius: 1,
            '& .MuiMenuItem-root': {
              py: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.primary">
            {userName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            enterprise.user@example.com
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountCircleOutlined fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">My Account</Typography>
        </MenuItem>

        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Settings</Typography>
        </MenuItem>

        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <HelpOutlineOutlined fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Help & Support</Typography>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <LogoutOutlined fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;