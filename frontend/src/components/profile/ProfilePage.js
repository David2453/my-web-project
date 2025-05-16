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
  CircularProgress,
  Fade,
  Chip,
  Badge,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  ShoppingCart as CartIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

function ProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { authState, setAuthState } = useContext(AuthContext);
  const { user } = authState;
  
  // Debugging output for user data
  useEffect(() => {
    console.log('User data:', user);
    console.log('Profile data:', user?.profile);
  }, [user]);
  
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
  
  // Get user's full name or username
  const getUserDisplayName = () => {
    if (user?.profile?.firstName && user?.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    return user?.username || 'User';
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Calculate how long the user has been a member
  const getMembershipDuration = () => {
    if (!user?.createdAt) return 'New member';
    
    const createdDate = new Date(user.createdAt);
    const now = new Date();
    const diffInMonths = (now.getFullYear() - createdDate.getFullYear()) * 12 + 
                         (now.getMonth() - createdDate.getMonth());
                         
    if (diffInMonths < 1) return 'New member';
    if (diffInMonths === 1) return '1 month';
    if (diffInMonths < 12) return `${diffInMonths} months`;
    
    const years = Math.floor(diffInMonths / 12);
    const remainingMonths = diffInMonths % 12;
    
    if (remainingMonths === 0) {
      return years === 1 ? '1 year' : `${years} years`;
    }
    
    return years === 1 
      ? `1 year, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`
      : `${years} years, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with breadcrumbs and back button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Breadcrumbs>
          <Link to="/" style={{ 
            color: theme.palette.text.secondary, 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center' 
          }}>
            <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Home
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Profile
          </Typography>
        </Breadcrumbs>
        
        <Button 
          component={Link} 
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ borderRadius: 2 }}
        >
          Back
        </Button>
      </Box>
      
      <Grid container spacing={4}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={4} lg={3}>
            <Card 
              elevation={4} 
              sx={{ 
                mb: 3, 
                borderRadius: 3,
                overflow: 'visible',
                position: 'relative',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                boxShadow: theme.shadows[8]
              }}
            >
              <Box 
                sx={{ 
                  height: 100, 
                  bgcolor: theme.palette.primary.main,
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12
                }}
              />
              
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center',
                pt: 0,
                mt: -6
              }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                  <Avatar 
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      bgcolor: theme.palette.primary.main,
                      fontSize: 48,
                      mb: 2,
                      border: `4px solid ${theme.palette.background.paper}`,
                      boxShadow: theme.shadows[4]
                    }}
                  >
                    {getAvatarLetter()}
                  </Avatar>
                </Badge>
                
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {getUserDisplayName()}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center', 
                    gap: 0.5 
                  }}
                >
                  <EmailIcon fontSize="small" />
                  {user?.email}
                </Typography>
                
                <Chip
                  icon={<CalendarIcon fontSize="small" />}
                  label={`Member for ${getMembershipDuration()}`}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                />
                
                <Button 
                  variant="contained" 
                  startIcon={<EditIcon />}
                  sx={{ mt: 3, borderRadius: 2, px: 3 }}
                  onClick={toggleEditing}
                  disabled={editing}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
            
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <List component="nav">
                {[
                  { icon: <PersonIcon />, label: "Personal Info", value: 0 },
                  { icon: <FavoriteIcon />, label: "Favorites", value: 1 },
                  { icon: <CartIcon />, label: "Cart", value: 2, link: "/cart" },
                  { icon: <HistoryIcon />, label: "Order History", value: 3 }
                ].map((item, index) => (
                  <ListItem
                    key={index}
                    component={item.link ? Link : 'div'}
                    to={item.link}
                    sx={{
                      borderLeft: tabValue === item.value 
                        ? `4px solid ${theme.palette.primary.main}` 
                        : '4px solid transparent',
                      py: 1.5,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: theme.palette.action.hover,
                        transform: 'translateX(4px)'
                      },
                      cursor: 'pointer'
                    }}
                    onClick={(e) => handleTabChange(e, item.value)}
                  >
                    <ListItemIcon>
                      {React.cloneElement(item.icon, { 
                        color: tabValue === item.value ? 'primary' : 'inherit',
                        sx: { transition: 'all 0.2s' }
                      })}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography 
                          variant="body1" 
                          fontWeight={tabValue === item.value ? 'bold' : 'regular'}
                        >
                          {item.label}
                        </Typography>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12} md={8} lg={9}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                minHeight: 500,
                position: 'relative',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                boxShadow: theme.shadows[8]
              }}
            >
              {/* Personal Info Tab */}
              {tabValue === 0 && (
                  <Box>
                    <Typography 
                      variant="h5" 
                      component="h2" 
                      fontWeight="bold" 
                      gutterBottom
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        color: theme.palette.primary.main
                      }}
                    >
                      <PersonIcon sx={{ mr: 1 }} />
                      Personal Information
                    </Typography>
                    
                    <Divider sx={{ mb: 4, borderColor: theme.palette.divider }} />
                    
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
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Last Name"
                              name="lastName"
                              value={profileData.lastName}
                              onChange={handleInputChange}
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
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
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <EmailIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Phone Number"
                              name="phone"
                              value={profileData.phone}
                              onChange={handleInputChange}
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PhoneIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
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
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                    <HomeIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                          <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={toggleEditing}
                            disabled={loading}
                            sx={{ borderRadius: 2 }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            disabled={loading}
                            sx={{ borderRadius: 2 }}
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <Grid container spacing={4}>
                          <Grid item xs={12} sm={6}>
                            <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                                  <Typography variant="subtitle1" fontWeight="medium">
                                    First Name
                                  </Typography>
                                </Box>
                                <Typography variant="h6">
                                  {user?.profile?.firstName || 'Not provided'}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                                  <Typography variant="subtitle1" fontWeight="medium">
                                    Last Name
                                  </Typography>
                                </Box>
                                <Typography variant="h6">
                                  {user?.profile?.lastName || 'Not provided'}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Card elevation={2} sx={{ borderRadius: 2 }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                  <EmailIcon color="primary" sx={{ mr: 1 }} />
                                  <Typography variant="subtitle1" fontWeight="medium">
                                    Email Address
                                  </Typography>
                                </Box>
                                <Typography variant="h6">
                                  {user?.email}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Card elevation={2} sx={{ borderRadius: 2 }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                  <PhoneIcon color="primary" sx={{ mr: 1 }} />
                                  <Typography variant="subtitle1" fontWeight="medium">
                                    Phone Number
                                  </Typography>
                                </Box>
                                <Typography variant="h6">
                                  {user?.profile?.phone || 'Not provided'}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Card elevation={2} sx={{ borderRadius: 2 }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                  <HomeIcon color="primary" sx={{ mr: 1 }} />
                                  <Typography variant="subtitle1" fontWeight="medium">
                                    Address
                                  </Typography>
                                </Box>
                                <Typography variant="h6" sx={{ whiteSpace: 'pre-line' }}>
                                  {user?.profile?.address || 'Not provided'}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={toggleEditing}
                            size="large"
                            sx={{ borderRadius: 2, px: 4 }}
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
                  <Box>
                    <FavoritesTab />
                  </Box>
              )}
              
              {/* Order History Tab */}
              {tabValue === 3 && (
                  <Box>
                    <OrdersTab />
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
        TransitionProps={{ timeout: 600 }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: theme.shadows[6]
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ProfilePage;