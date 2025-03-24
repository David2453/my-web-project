// frontend/src/components/profile/FavoritesTab.js
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FavoritesContext } from '../context/FavoritesContext';
import { CartContext } from '../context/CartContext';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  DirectionsBike as BikeIcon,
  EventAvailable as CalendarIcon,
  SentimentDissatisfied as SadIcon
} from '@mui/icons-material';

// Mock favorites data - in a real app, this would come from your API or context
const mockFavorites = [
  {
    id: '1',
    name: 'Mountain Explorer',
    type: 'Mountain Bike',
    price: 899.99,
    rentalPrice: 35.99,
    image: 'https://www.paulscycles.co.uk/images/altitude-c70-red-carbon.jpg?width=1998&height=1998&quality=85&mode=pad&format=webp&bgcolor=ffffff',
    addedOn: '2024-03-15'
  },
  {
    id: '2',
    name: 'City Cruiser',
    type: 'Urban Bike',
    price: 699.99,
    rentalPrice: 25.99,
    image: 'https://images.ctfassets.net/ogr4ifihl2yh/3gvlDBzj1UgLVNH2vAhFEF/5a1585c9a1463d431d7cce957ba7c984/Profile_-_Around_the_Block_Women-s_26__Single_Speed_-_Mint_Green_-_630042_NEW.png?w=1000&q=85',
    addedOn: '2024-03-18'
  },
  {
    id: '3',
    name: 'Road Master',
    type: 'Road Bike',
    price: 1199.99,
    rentalPrice: 45.99,
    image: 'https://www.certini.co.uk/images/products/s/sp/specialized-allez-e5-disc-road-b-2.jpg?width=1998&height=1998&quality=85&mode=pad&format=webp&bgcolor=ffffff',
    addedOn: '2024-03-20'
  }
];

function FavoritesTab() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { favorites, loading, error, removeFavorite } = useContext(FavoritesContext);
  const { addToCart } = useContext(CartContext);
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Handle removing from favorites
  const handleRemoveFavorite = (favorite) => {
    setItemToRemove(favorite);
    setShowConfirmDialog(true);
  };
  
  // Confirm removal
  const confirmRemoveFavorite = async () => {
    const success = await removeFavorite(itemToRemove.id);
    setShowConfirmDialog(false);
    
    if (success) {
      setSnackbar({
        open: true,
        message: `${itemToRemove.name} removed from favorites`,
        severity: 'success'
      });
    }
  };
  
  // Add to cart
  const handleAddToCart = async (favorite) => {
    const success = await addToCart(favorite.bikeId, 'purchase', 1);
    
    if (success) {
      setSnackbar({
        open: true,
        message: `${favorite.name} added to your cart`,
        severity: 'success'
      });
    }
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          <FavoriteIcon sx={{ mr: 1, color: theme.palette.error.main, verticalAlign: 'middle' }} />
          My Favorites
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
        </Typography>
      </Box>
      
      {favorites.length === 0 ? (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: 'background.default'
          }}
        >
          <SadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No favorites yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            When you add bikes to your favorites, they will appear here.
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/bikes"
            startIcon={<BikeIcon />}
          >
            Browse Bikes
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((favorite) => (
            <Grid item xs={12} sm={6} md={4} key={favorite.id}>
              <Card 
                elevation={3} 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={favorite.image}
                    alt={favorite.name}
                  />
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleRemoveFavorite(favorite)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <Chip
                    label={favorite.type}
                    size="small"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8
                    }}
                  />
                </Box>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom noWrap>
                    {favorite.name}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Added on {new Date(favorite.addedOn).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Buy
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        ${favorite.price}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Rent
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        ${favorite.rentalPrice}/day
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ p: 2 }}>
                  <Button 
                    size="small" 
                    component={Link}
                    to={`/bikes/${favorite.id}`}
                    sx={{ mr: 1 }}
                  >
                    View Details
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CartIcon />}
                    onClick={() => handleAddToCart(favorite)}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Removal confirmation dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <DialogTitle>Remove from Favorites</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {itemToRemove?.name} from your favorites?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button onClick={confirmRemoveFavorite} color="error" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification snackbar */}
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default FavoritesTab;