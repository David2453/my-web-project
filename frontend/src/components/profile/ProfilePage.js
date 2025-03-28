// frontend/src/components/profile/ProfilePage.js
import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import FavoritesTab from './FavoritesTab';
import OrdersTab from './OrdersTab';

import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Button,
  Grid,
  TextField,
  Divider,
  Card,
  CardContent,
  Breadcrumbs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  ShoppingCart as CartIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

function ProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { authState, setAuthState } = useContext(AuthContext);
  const { user } = authState;
  
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    address: user?.profile?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Update profile data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || ''
      });
    }
  }, [user]);

  useEffect(() => {
    // Check if there's a tab value in localStorage
    const savedTabValue = localStorage.getItem('profileTabValue');
    if (savedTabValue) {
      setTabValue(parseInt(savedTabValue));
      // Clear it after use
      localStorage.removeItem('profileTabValue');
    }
  }, []);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle editing profile
  const toggleEditing = () => {
    // Reset form data to current user data when cancelling
    if (editing) {
      setProfileData({
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || ''
      });
    }
    setEditing(!editing);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare data for API call
      const updatedProfile = {
        username: user.username, // Keep existing username
        email: user.email, // Keep existing email
        profile: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          address: profileData.address
        }
      };
      
      // Make API call to update profile
      const res = await axios.put('/api/users/me', updatedProfile);
      
      // Update the auth context with the new user data
      setAuthState(prev => ({
        ...prev,
        user: res.data
      }));
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.msg || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Get the first letter of the user's name or username for the avatar
  const getAvatarLetter = () => {
    if (user?.profile?.firstName) {
      return user.profile.firstName.charAt(0).toUpperCase();
    }
    return user?.username?.charAt(0).toUpperCase() || 'U';
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link to="/" style={{ color: theme.palette.text.secondary, textDecoration: 'none' }}>
          Home
        </Link>
        <Typography color="text.primary">Profile</Typography>
      </Breadcrumbs>
      
      <Grid container spacing={4}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={3}>
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  bgcolor: theme.palette.primary.main,
                  fontSize: 40,
                  mb: 2
                }}
              >
                {getAvatarLetter()}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </Typography>
              
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<EditIcon />}
                sx={{ mt: 2 }}
                onClick={toggleEditing}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
          
          <Paper elevation={2} sx={{ borderRadius: 2 }}>
            <List component="nav" dense>
              <ListItem 
                button 
                selected={tabValue === 0}
                onClick={(e) => handleTabChange(e, 0)}
              >
                <ListItemIcon>
                  <PersonIcon color={tabValue === 0 ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Personal Info" />
              </ListItem>
              
              <ListItem 
                button 
                selected={tabValue === 1}
                onClick={(e) => handleTabChange(e, 1)}
              >
                <ListItemIcon>
                  <FavoriteIcon color={tabValue === 1 ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Favorites" />
              </ListItem>
              
              <ListItem 
                button 
                selected={tabValue === 2}
                onClick={(e) => handleTabChange(e, 2)}
                component={Link}
                to="/cart"
              >
                <ListItemIcon>
                  <CartIcon color={tabValue === 2 ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Cart" />
              </ListItem>
              
              <ListItem 
                button 
                selected={tabValue === 3}
                onClick={(e) => handleTabChange(e, 3)}
              >
                <ListItemIcon>
                  <HistoryIcon color={tabValue === 3 ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Order History" />
              </ListItem>
              
              <ListItem 
                button 
                selected={tabValue === 4}
                onClick={(e) => handleTabChange(e, 4)}
              >
                <ListItemIcon>
                  <SettingsIcon color={tabValue === 4 ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Account Settings" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              minHeight: 500
            }}
          >
            {/* Personal Info Tab */}
            {tabValue === 0 && (
              <Box>
                <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {editing ? (
                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          name="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          disabled
                          helperText="Email cannot be changed"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          name="address"
                          value={profileData.address}
                          onChange={handleInputChange}
                          multiline
                          rows={3}
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={toggleEditing}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          First Name
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {user?.profile?.firstName || 'Not provided'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Last Name
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {user?.profile?.lastName || 'Not provided'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Email Address
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {user?.email}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Phone Number
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {user?.profile?.phone || 'Not provided'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Address
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {user?.profile?.address || 'Not provided'}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={toggleEditing}
                      >
                        Edit Profile
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
            
            {/* Favorites Tab */}
            {tabValue === 1 && (
              <FavoritesTab />
            )}
            
            {/* Other tabs would go here */}
            {tabValue === 3 && (
              <OrdersTab />
            )}
            
            {tabValue === 4 && (
              <Box>
                <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                  <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Account Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="body1" align="center" sx={{ py: 4 }}>
                  Account settings and password change options will be displayed here.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Notification snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ProfilePage;