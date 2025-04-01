// frontend/src/components/bikes/BikeDetailMUI.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FavoritesContext } from '../context/FavoritesContext';
import { ReviewsContext } from '../context/ReviewsContext';
import ReviewForm from '../reviews/ReviewForm';
import ReviewList from '../reviews/ReviewList';
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
const initialMode = searchParams.get('mode') || 'purchase';
const initialLocationId = searchParams.get('location');
const [mode, setMode] = useState(initialMode);
const [locationId, setLocationId] = useState(initialLocationId);
  
  // Context hooks
  const { authState } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { addFavorite, removeFavorite, checkIsFavorite } = useContext(FavoritesContext);
  // Add this with your other context hooks
const { reviews, loading: reviewsLoading, fetchReviews, addReview } = useContext(ReviewsContext);
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

  const [locations, setLocations] = useState([]);
  
  // Adăugăm un nou state pentru imaginea activă
  const [activeImage, setActiveImage] = useState(0);
  const [images, setImages] = useState([]);

  // Încărcăm imaginile la montarea componentei
  useEffect(() => {
    if (bike) {
      // Presupunem că bike.images există, altfel folosim imaginea principală
      setImages(bike.images || [bike.image]);
    }
  }, [bike]);
  
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
        fetchReviews(id);

      } catch (err) {
        console.error('Error fetching bike details:', err);
        setError('Failed to load bike details. Please try again.');
      } finally {
        setLoading(false);
      }

      
    };

    fetchBikeDetails();
  }, [id, authState.isAuthenticated, checkIsFavorite, mode, fetchReviews]); // Add fetchReviews to dependencies
  // This useEffect watches for changes in the mode from URL parameters
// This useEffect watches for changes in the mode from URL parameters
useEffect(() => {
  // Get mode from URL parameters
  const currentMode = searchParams.get('mode') || 'purchase';
  
  // If the tab is on position 1 (the second tab), but we're in a mode that should
  // have the first tab selected, reset the tab selection
  if (tabValue === 1 && mode === currentMode) {
    setTabValue(0);
  }
  
  // Reset form fields
  setStartDate('');
  setEndDate('');
  setQuantity(1);
}, [searchParams, mode, tabValue]);
  
// This useEffect watches for changes in the URL parameters without causing refreshes
useEffect(() => {
  // Get current mode from URL parameters
  const currentMode = searchParams.get('mode') || 'purchase';
  
  // If the mode has changed, reset the tab to the first position
  if (currentMode !== mode) {
    setTabValue(0);
    
    // Reset form fields when mode changes
    setStartDate('');
    setEndDate('');
    setQuantity(1);
  }
}, [searchParams, mode]);
  
  // This useEffect watches for changes in the URL parameters without causing refreshes
// useEffect(() => {
//   // Get current mode from URL parameters
//   const currentMode = searchParams.get('mode') || 'purchase';
  
//   // If the mode has changed, reset the tab to the first position
//   if (currentMode !== mode) {
//     setTabValue(0);
    
//     // Reset form fields when mode changes
//     setStartDate('');
//     setEndDate('');
//     setQuantity(1);
//   }
// }, [searchParams, mode]);
  
  // Handle Tab Change
  // Handle Tab Change
// Handle Tab Change
const handleTabChange = (event, newValue) => {
  setTabValue(newValue);
  
  if (newValue === 1) {
    // Instead of changing URL params, just update the state directly
    const newMode = mode === 'purchase' ? 'rental' : 'purchase';
    setMode(newMode);
    
    // Reset form fields
    setStartDate('');
    setEndDate('');
    setQuantity(1);
    
    // Set tab back to 0 (first tab)
    setTabValue(0);
  }
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
        message: 'Te rugăm să te autentifici pentru a adăuga articole în coș',
        severity: 'warning'
      });
      return false;
    }
    
    setActionLoading(true);
    try {
      if (mode === 'rental') {
        if (!startDate || !endDate) {
          setSnackbar({
            open: true,
            message: 'Te rugăm să selectezi data de început și de sfârșit',
            severity: 'warning'
          });
          setActionLoading(false);
          return false;
        }
        
        if (!locationId) {
          setSnackbar({
            open: true,
            message: 'Te rugăm să selectezi o locație pentru închiriere',
            severity: 'warning'
          });
          setActionLoading(false);
          return false;
        }
      }
      
      // Create properly formatted dates
      const formattedStartDate = mode === 'rental' ? new Date(startDate).toISOString() : null;
      const formattedEndDate = mode === 'rental' ? new Date(endDate).toISOString() : null;
      
      console.log("Adăugare în coș:", {
        id, 
        mode, 
        quantity, 
        startDate: formattedStartDate, 
        endDate: formattedEndDate, 
        locationId
      });
      
      const success = await addToCart(
        id,
        mode,
        quantity,
        formattedStartDate,
        formattedEndDate,
        locationId
      );
      
      if (success) {
        setSnackbar({
          open: true,
          message: `${bike.name} a fost adăugat în coș`,
          severity: 'success'
        });
        return true;
      } else {
        throw new Error('Adăugarea în coș a eșuat');
      }
    } catch (err) {
      console.error('Eroare la adăugarea în coș:', err);
      setSnackbar({
        open: true,
        message: `Eroare la adăugarea în coș: ${err.response?.data?.message || err.message || 'Verificați datele introduse'}`,
        severity: 'error'
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Buy Now / Book Now
  const handleBuyNow = async () => {
    const success = await handleAddToCart();
    // Only navigate if the add to cart was successful
    if (success) {
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

  // Load locations for rental
  useEffect(() => {
    const fetchLocations = async () => {
      if (mode === 'rental') {
        try {
          const res = await axios.get('/api/locations');
          console.log('Locații primite de la server:', res.data);
          setLocations(res.data);
          
          // If we don't have a locationId yet but locations are available, set the first one
          if (!locationId && res.data.length > 0) {
            const firstLocationId = res.data[0]._id || res.data[0].id || res.data[0].code;
            console.log(`Setare locație implicită: ${firstLocationId}`);
            setLocationId(firstLocationId);
          }
        } catch (err) {
          console.error('Eroare la încărcarea locațiilor:', err);
          setSnackbar({
            open: true,
            message: 'Nu s-au putut încărca locațiile. Te rugăm să încerci din nou.',
            severity: 'error'
          });
        }
      }
    };
    
    fetchLocations();
  }, [mode, locationId]);

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
              position: 'relative',
              '&:hover': {
                '& .MuiCardMedia-root': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.3s ease-in-out'
                }
              }
            }}
          >
            <CardMedia
              component="img"
              alt={bike.name}
              image={images[activeImage]}
              sx={{ 
                height: 400, 
                objectFit: 'cover',
                transition: 'transform 0.3s ease-in-out'
              }}
            />
            {images.length > 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 1,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  p: 1,
                  borderRadius: 2
                }}
              >
                {images.map((_, index) => (
                  <IconButton
                    key={index}
                    size="small"
                    onClick={() => setActiveImage(index)}
                    sx={{
                      p: 0.5,
                      bgcolor: activeImage === index ? 'primary.main' : 'rgba(255, 255, 255, 0.3)',
                      '&:hover': {
                        bgcolor: activeImage === index ? 'primary.dark' : 'rgba(255, 255, 255, 0.5)'
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={images[index]}
                      alt={`Thumbnail ${index + 1}`}
                      sx={{
                        width: 40,
                        height: 40,
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                  </IconButton>
                ))}
              </Box>
            )}
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
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  transform: 'scale(1.1)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Card>
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
  <Rating 
    value={bike.averageRating || 0} 
    precision={0.5} 
    size="small" 
    readOnly 
  />
  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
    ({reviews ? reviews.length : bike.reviewCount || 0} reviews)
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
            <Box mb={3} sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: 1
            }}>
              {mode === 'purchase' ? (
                <>
                  <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
                    ${bike.price}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="success" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Livrare gratuită pentru comenzi peste $1000
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
                    ${bike.rentalPrice}
                    <Typography component="span" variant="body1" fontWeight="normal" sx={{ ml: 1 }}>
                      /zi
                    </Typography>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon color="info" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Depozit de garanție rambursabil
                    </Typography>
                  </Box>
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
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 1
                }}>
                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        label="Locație"
                        value={locationId || ''}
                        onChange={(e) => {
                          console.log('Locație selectată:', e.target.value);
                          setLocationId(e.target.value);
                        }}
                        SelectProps={{
                          native: true,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: 'primary.main'
                            }
                          }
                        }}
                      >
                        <option value="">Selectează o locație</option>
                        {locations.map((location) => {
                          const locationId = location._id || location.id || location.code;
                          return (
                            <option key={locationId} value={locationId}>
                              {location.name}
                            </option>
                          );
                        })}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Data început"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: today }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: 'primary.main'
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Data sfârșit"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: startDate || today }}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={!startDate}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: 'primary.main'
                            }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  {startDate && endDate && (
                    <Box 
                      mb={3} 
                      p={2} 
                      bgcolor="primary.light" 
                      borderRadius={2}
                      sx={{
                        color: 'white',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3
                        }
                      }}
                    >
                      <Typography variant="body1" gutterBottom>
                        Preț estimat pentru perioada selectată:
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
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
                    disabled={!locationId || !startDate || !endDate || actionLoading}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    {actionLoading ? 'Se procesează...' : 'Rezervă acum'}
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
      
      {/* Reviews Section */}
<Box mt={6}>
  <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
    Customer Reviews
  </Typography>
  <Divider sx={{ mb: 3 }} />
  
  {/* Review Form */}
  <ReviewForm 
    bikeId={id} 
    onReviewSubmitted={(newReview) => addReview(newReview)}
  />
  
  {/* Review List */}
  <ReviewList 
    reviews={reviews} 
    loading={reviewsLoading}
  />
</Box>

{/* Your existing "You Might Also Like" section */}
      
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