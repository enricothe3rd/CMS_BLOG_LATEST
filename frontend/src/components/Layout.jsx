import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Article as ArticleIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                color: 'primary.main',
                textDecoration: 'none',
              }}
            >
              Blog CMS
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                <MenuItem 
                  component={RouterLink} 
                  to="/" 
                  onClick={handleCloseNavMenu}
                  selected={location.pathname === '/'}
                >
                  <Typography textAlign="center">Home</Typography>
                </MenuItem>
                <MenuItem 
                  component={RouterLink} 
                  to="/blog" 
                  onClick={handleCloseNavMenu}
                  selected={location.pathname === '/blog'}
                >
                  <Typography textAlign="center">Blog</Typography>
                </MenuItem>
                {user && (
                  <MenuItem 
                    component={RouterLink} 
                    to="/my-posts" 
                    onClick={handleCloseNavMenu}
                    selected={location.pathname === '/my-posts'}
                  >
                    <Typography textAlign="center">My Posts</Typography>
                  </MenuItem>
                )}
                {user && (
                  <MenuItem 
                    component={RouterLink} 
                    to="/categories" 
                    onClick={handleCloseNavMenu}
                    selected={location.pathname === '/categories'}
                  >
                    <Typography textAlign="center">Categories</Typography>
                  </MenuItem>
                )}
              </Menu>
            </Box>

            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 700,
                color: 'primary.main',
                textDecoration: 'none',
              }}
            >
              Blog CMS
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              <Button
                component={RouterLink}
                to="/"
                onClick={handleCloseNavMenu}
                sx={{ 
                  my: 2, 
                  color: 'text.primary', 
                  display: 'block',
                  fontWeight: location.pathname === '/' ? 700 : 400,
                  borderBottom: location.pathname === '/' ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                  borderRadius: 0
                }}
              >
                Home
              </Button>
              <Button
                component={RouterLink}
                to="/blog"
                onClick={handleCloseNavMenu}
                sx={{ 
                  my: 2, 
                  color: 'text.primary', 
                  display: 'block',
                  fontWeight: location.pathname === '/blog' ? 700 : 400,
                  borderBottom: location.pathname === '/blog' ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                  borderRadius: 0
                }}
              >
                Blog
              </Button>
              {user && (
                <Button
                  component={RouterLink}
                  to="/my-posts"
                  onClick={handleCloseNavMenu}
                  sx={{ 
                    my: 2, 
                    color: 'text.primary', 
                    display: 'block',
                    fontWeight: location.pathname === '/my-posts' ? 700 : 400,
                    borderBottom: location.pathname === '/my-posts' ? '2px solid' : 'none',
                    borderColor: 'primary.main',
                    borderRadius: 0
                  }}
                >
                  My Posts
                </Button>
              )}
              {user && (
                <Button
                  component={RouterLink}
                  to="/categories"
                  onClick={handleCloseNavMenu}
                  sx={{ 
                    my: 2, 
                    color: 'text.primary', 
                    display: 'block',
                    fontWeight: location.pathname === '/categories' ? 700 : 400,
                    borderBottom: location.pathname === '/categories' ? '2px solid' : 'none',
                    borderColor: 'primary.main',
                    borderRadius: 0
                  }}
                >
                  Categories
                </Button>
              )}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              {user ? (
                <>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar 
                        alt={user.username} 
                        src={user.avatar} 
                        sx={{ width: 40, height: 40 }}
                      >
                        {user.username ? user.username.charAt(0).toUpperCase() : <PersonIcon />}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem 
                      component={RouterLink} 
                      to="/profile" 
                      onClick={handleCloseUserMenu}
                    >
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography textAlign="center">Profile</Typography>
                    </MenuItem>
                    <MenuItem 
                      component={RouterLink} 
                      to="/my-posts" 
                      onClick={handleCloseUserMenu}
                    >
                      <ArticleIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography textAlign="center">My Posts</Typography>
                    </MenuItem>
                    <MenuItem 
                      component={RouterLink} 
                      to="/blog/create" 
                      onClick={handleCloseUserMenu}
                    >
                      <AddIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography textAlign="center">Create Post</Typography>
                    </MenuItem>
                    <MenuItem 
                      component={RouterLink} 
                      to="/categories" 
                      onClick={handleCloseUserMenu}
                    >
                      <CategoryIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography textAlign="center">Manage Categories</Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    component={RouterLink} 
                    to="/login" 
                    variant="outlined"
                    color="primary"
                  >
                    Login
                  </Button>
                  <Button 
                    component={RouterLink} 
                    to="/register" 
                    variant="contained"
                    color="primary"
                  >
                    Register
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Blog CMS. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 