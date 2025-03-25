// frontend/src/components/bikes/BikeDetailMUI.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FavoritesContext } from '../context/FavoritesContext';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  Divider,
  Chip,
  Button,
  Paper,
  TextField,
  Rating,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  useTheme,
  useMediaQuery,
  Snackbar
} from '@mui/material';
import {
  DirectionsBike as BikeIcon,
  ShoppingCart as CartIcon,
  EventAvailable as CalendarIcon,
  Check as CheckIcon,
  ArrowBack as BackIcon,
  CompareArrows as CompareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  RoomService as ServiceIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';

function BikeDetailMUI() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'purchase';
  const locationId = searchParams.get('location');
  
  // Context hooks
  const { authState } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { addFavorite, removeFavorite, checkIsFavorite } = useContext(FavoritesContext);
  
  // State
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load bike details from API
  useEffect(() => {
    const fetchBikeDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/bikes/${id}`);
        setBike(res.data);
        setError(null);
        
        // Check if bike is in favorites
        if (authState.isAuthenticated) {
          try {
            const isFav = await checkIsFavorite(id);
            setFavorite(isFav);
          } catch (err) {
            console.error('Error checking if bike is favorite:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching bike details:', err);
        setError('Failed to load bike details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBikeDetails();
  }, [id, authState.isAuthenticated, checkIsFavorite]);

  // Handle Tab Change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Toggle Favorite
  const toggleFavorite = async () => {
    if (!authState.isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please login to add items to favorites',
        severity: 'warning'
      });
      return;
    }
    
    setActionLoading(true);
    try {
      if (favorite) {
        await removeFavorite(id);
        setFavorite(false);
        setSnackbar({
          open: true,
          message: `${bike.name} removed from favorites`,
          severity: 'success'
        });
      } else {
        await addFavorite(id);
        setFavorite(true);
        setSnackbar({
          open: true,
          message: `${bike.name} added to favorites`,
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error updating favorites:', err);
      setSnackbar({
        open: true,
        message: 'Error updating favorites. Please try again.',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (!authState.isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please login to add items to cart',
        severity: 'warning'
      });
      return;
    }
    
    setActionLoading(true);
    try {
      if (mode === 'rental' && (!startDate || !endDate)) {
        setSnackbar({
          open: true,
          message: 'Please select start and end dates',
          severity: 'warning'
        });
        setActionLoading(false);
        return;
      }
      
      const success = await addToCart(
        id,
        mode,
        quantity,
        mode === 'rental' ? startDate : null,
        mode === 'rental' ? endDate : null,
        mode === 'rental' ? locationId : null
      );
      
      if (success) {
        setSnackbar({
          open: true,
          message: `${bike.name} added to cart`,
          severity: 'success'
        });
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setSnackbar({
        open: true,
        message: 'Error adding to cart. Please try again.',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Buy Now / Book Now
  const handleBuyNow = async () => {
    await handleAddToCart();
    // Only navigate if the add to cart was successful
    if (!actionLoading) {
      navigate('/cart');
    }
  };

  // Calculate rental price
  const calculateRentalPrice = () => {
    if (!startDate || !endDate || !bike) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    
    return (bike.rentalPrice * days).toFixed(2);
  };

  // Handle close snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Format today's date for min date in calendar
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="500px">
        <CircularProgress size={60} thickness={4} color="primary" />
      </Box>
    );
  }

  if (error || !bike) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" variant="filled" sx={{ mb: 2 }}>
          {error || "Bike not found"}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<BackIcon />} 
          component={Link} 
          to="/bikes"
          sx={{ mt: 2 }}
        >
          Back to Bikes
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link to="/" style={{ color: theme.palette.text.secondary, textDecoration: 'none' }}>
          Home
        </Link>
        <Link to="/bikes" style={{ color: theme.palette.text.secondary, textDecoration: 'none' }}>
          Bikes
        </Link>
        <Typography color="text.primary">{bike.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Bike Image */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={4} 
            sx={{ 
              borderRadius: 2, 
              overflow: 'hidden',
              mb: 2,
              position: 'relative'
            }}
          >
            <CardMedia
              component="img"
              alt={bike.name}
              image={bike.image}
              sx={{ height: 400, objectFit: 'cover' }}
            />
            <IconButton 
              color={favorite ? "error" : "default"}
              onClick={toggleFavorite}
              disabled={actionLoading}
              sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }
              }}
            >
              {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Card>

          {/* Thumbnails - This would be used if you had multiple images */}
          <Grid container spacing={1} sx={{ display: 'none' }}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={3} key={item}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    height: 70, 
                    borderRadius: 1, 
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    '&:hover': {
                      border: `2px solid ${theme.palette.primary.main}`
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={bike.image}
                    alt={`Thumbnail ${item}`}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Bike Details */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box display="flex" alignItems="center" mb={1}>
              <Chip 
                label={bike.type} 
                color="primary" 
                variant="outlined" 
                size="small" 
                icon={<BikeIcon />}
                sx={{ mr: 1 }}
              />
              <Rating value={bike.averageRating || 0} precision={0.5} size="small" readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({bike.reviewCount || 0} reviews)
              </Typography>
            </Box>
            
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {bike.name}
            </Typography>
            
            <Typography variant="body1" paragraph color="text.secondary">
              {bike.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Price section */}
            <Box mb={3}>
              {mode === 'purchase' ? (
                <>
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    ${bike.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Free delivery for orders over $1000
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    ${bike.rentalPrice}<Typography component="span" variant="body2" fontWeight="normal">/day</Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Refundable security deposit required
                  </Typography>
                </>
              )}
            </Box>
            
            {/* Action section - depends on mode */}
            <Box>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="fullWidth" 
                sx={{ mb: 2 }}
              >
                <Tab 
                  label={mode === 'purchase' ? "Purchase" : "Rent"} 
                  icon={mode === 'purchase' ? <CartIcon /> : <CalendarIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label={mode === 'purchase' ? "Rent Instead" : "Purchase Instead"} 
                  icon={<CompareIcon />} 
                  iconPosition="start"
                  component={Link}
                  to={mode === 'purchase' ? `/bikes/${id}?mode=rental` : `/bikes/${id}?mode=purchase`}
                />
              </Tabs>
              
              {/* Purchase Form */}
              {mode === 'purchase' && tabValue === 0 && (
                <Box>
                  <Box display="flex" alignItems="center" mb={3}>
                    <TextField
                      label="Quantity"
                      type="number"
                      InputProps={{ inputProps: { min: 1, max: bike.purchaseStock } }}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      size="small"
                      sx={{ width: 100, mr: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {bike.purchaseStock} available
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <CartIcon />}
                    fullWidth
                    sx={{ mb: 2 }}
                    onClick={handleAddToCart}
                    disabled={actionLoading || bike.purchaseStock < 1}
                  >
                    {actionLoading ? 'Adding...' : 'Add to Cart'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={handleBuyNow}
                    disabled={actionLoading || bike.purchaseStock < 1}
                  >
                    Buy Now
                  </Button>
                </Box>
              )}
              
              {/* Rental Form */}
              {mode === 'rental' && tabValue === 0 && (
                <Box>
                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: today }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: startDate || today }}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={!startDate}
                      />
                    </Grid>
                  </Grid>
                  
                  {startDate && endDate && (
                    <Box mb={3} p={2} bgcolor="background.default" borderRadius={1}>
                      <Typography variant="body2" gutterBottom>
                        Estimated Price:
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        ${calculateRentalPrice()}
                      </Typography>
                    </Box>
                  )}
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <CalendarIcon />}
                    fullWidth
                    onClick={handleBuyNow}
                    disabled={!startDate || !endDate || actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Book Now'}
                  </Button>
                </Box>
              )}
            </Box>
            
            <Box flexGrow={1} />
            
            {/* Features Accordion */}
            <Box mt={3}>
              <Accordion elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, overflow: 'hidden' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center">
                    <SettingsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography fontWeight="medium">Features & Specifications</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense disablePadding>
                    {bike.features && bike.features.map((feature, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
              
              <Accordion elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, overflow: 'hidden', mt: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center">
                    <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography fontWeight="medium">Details</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Brand</Typography>
                      <Typography variant="body1">Premium Bikes</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Weight</Typography>
                      <Typography variant="body1">12.5 kg</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Frame Material</Typography>
                      <Typography variant="body1">Aluminum</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Wheel Size</Typography>
                      <Typography variant="body1">27.5"</Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
              
              <Accordion elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, overflow: 'hidden', mt: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center">
                    <ServiceIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography fontWeight="medium">Service & Warranty</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    All our bikes come with a 2-year warranty that covers manufacturing defects.
                    Regular maintenance is included for the first 6 months.
                  </Typography>
                  <Typography variant="body2">
                    Visit any of our stores for free safety checks throughout the lifetime of your bike.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Related Bikes Section - Would be implemented with actual data */}
      <Box mt={6}>
        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
          You Might Also Like
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 8
                  },
                  borderRadius: 2
                }}
              >
                <CardMedia
                  component="img"
                  height={160}
                  image={bike.image}
                  alt={`Similar bike ${item}`}
                />
                <Box p={2}>
                  <Typography variant="body1" fontWeight="medium" gutterBottom noWrap>
                    {["Road Runner", "Mountain Explorer", "City Cruiser", "Hybrid Deluxe"][item-1]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {bike.type}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="body1" fontWeight="bold" color="primary.main">
                      ${[699, 899, 599, 749][item-1]}
                    </Typography>
                    <Chip size="small" label="View" component={Link} to="#" clickable />
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default BikeDetailMUI;