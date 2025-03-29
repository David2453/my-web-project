// frontend/src/components/layout/Navbar.js
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

// Material UI imports
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Badge,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';

function Navbar() {
  const { authState, logout } = useContext(AuthContext);
  const { isAuthenticated, user } = authState;
  const navigate = useNavigate();
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  // Close toast after 3 seconds
  useEffect(() => {
    let timer;
    if (showToast) {
      timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showToast]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setUserMenuAnchor(null);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setShowToast(true);
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Navigation handler
  const handleNavigation = (path) => {
    setMobileDrawerOpen(false);
    setUserMenuAnchor(null);
    navigate(path);
  };

  // User menu handlers
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Bikes', path: '/bikes' },
    { title: 'Shop', path: '/shop' },
    { title: 'Rentals', path: '/rentals' }
  ];

  // Drawer content for mobile view
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <DirectionsBikeIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div">
          Bike Rent & Shop
        </Typography>
      </Box>
      <Divider />
      <List>
        {navLinks.map((link) => (
          <ListItem key={link.path} disablePadding>
            <ListItemButton onClick={() => handleNavigation(link.path)}>
              <ListItemText primary={link.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {!isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/login')}>
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/register')}>
                <ListItemText primary="Register" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            {user && user.role === 'admin' && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigation('/admin')}>
                  <AdminPanelSettingsIcon sx={{ mr: 1 }} />
                  <ListItemText primary="Admin Panel" />
                </ListItemButton>
              </ListItem>
            )}
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/dashboard')}>
                <DashboardIcon sx={{ mr: 1 }} />
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/profile')}>
                <PersonIcon sx={{ mr: 1 }} />
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/cart')}>
                <ShoppingCartIcon sx={{ mr: 1 }} />
                <ListItemText primary="Cart" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogoutClick}>
                <LogoutIcon sx={{ mr: 1 }} color="error" />
                <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" className="navbar" sx={{ backgroundColor: '#212529 !important' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Mobile menu icon */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Logo */}
            <Typography
              variant="h6"
              component={Link}
              to="/"
              onClick={() => handleNavigation('/')}
              sx={{
                mr: 2,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
              className="navbar-brand"
            >
              <DirectionsBikeIcon sx={{ mr: 1, display: { xs: 'none', sm: 'flex' } }} />
              Bike Rent & Shop
            </Typography>

            {/* Desktop navigation links */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 2 }} className="main-nav">
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  component={Link}
                  to={link.path}
                  onClick={() => handleNavigation(link.path)}
                  sx={{ 
                    color: 'white', 
                    mx: 0.5,
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  className="nav-link"
                >
                  {link.title}
                </Button>
              ))}
            </Box>

            {/* Desktop auth links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }} className="auth-nav">
              {!isAuthenticated ? (
                // Guest links
                <>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/login" 
                    onClick={() => handleNavigation('/login')}
                    sx={{ ml: 1 }}
                    className="nav-link"
                  >
                    Login
                  </Button>
                  <Button 
                    color="primary" 
                    variant="contained" 
                    component={Link} 
                    to="/register" 
                    onClick={() => handleNavigation('/register')}
                    sx={{ ml: 1 }}
                    className="nav-link"
                  >
                    Register
                  </Button>
                </>
              ) : (
                // Auth links
                <>
                  {user && user.role === 'admin' && (
                    <Button
                      color="inherit"
                      startIcon={<AdminPanelSettingsIcon />}
                      component={Link}
                      to="/admin"
                      onClick={() => handleNavigation('/admin')}
                      sx={{ ml: 1 }}
                      className="nav-link"
                    >
                      Admin
                    </Button>
                  )}
                  <Button
                    color="inherit"
                    startIcon={<DashboardIcon />}
                    component={Link}
                    to="/dashboard"
                    onClick={() => handleNavigation('/dashboard')}
                    sx={{ ml: 1 }}
                    className="nav-link"
                  >
                    Dashboard
                  </Button>
                  <IconButton
                    color="inherit"
                    component={Link}
                    to="/cart"
                    onClick={() => handleNavigation('/cart')}
                    sx={{ ml: 1 }}
                    className="nav-link"
                  >
                    <Badge badgeContent={0} color="error">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>
                  
                  <Box sx={{ ml: 1 }}>
                    <Tooltip title="Account settings">
                      <IconButton
                        onClick={handleUserMenuOpen}
                        sx={{ p: 0, ml: 1 }}
                        aria-controls={Boolean(userMenuAnchor) ? 'user-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={Boolean(userMenuAnchor) ? 'true' : undefined}
                      >
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
                          {user && user.username ? user.username.charAt(0).toUpperCase() : ''}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                    <Menu
                      id="user-menu"
                      anchorEl={userMenuAnchor}
                      open={Boolean(userMenuAnchor)}
                      onClose={handleUserMenuClose}
                      PaperProps={{
                        elevation: 3,
                        sx: {
                          overflow: 'visible',
                          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.2))',
                          mt: 1.5,
                          '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                          }
                        },
                      }}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      <MenuItem onClick={() => handleNavigation('/profile')}>
                        <PersonIcon sx={{ mr: 1.5 }} /> Profile
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main' }}>
                        <LogoutIcon sx={{ mr: 1.5 }} /> Logout
                      </MenuItem>
                    </Menu>
                  </Box>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      >
        {drawerContent}
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={showLogoutConfirm}
        onClose={cancelLogout}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle id="logout-dialog-title">
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cancelLogout} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmLogout} variant="contained" color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={showToast}
        autoHideDuration={3000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowToast(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          You have been successfully logged out.
        </Alert>
      </Snackbar>
    </>
  );
}

export default Navbar;