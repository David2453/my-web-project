// frontend/src/components/cart/CartPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Divider,
  Card,
  CardMedia,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
  Breadcrumbs,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingBag as ShoppingBagIcon
} from '@mui/icons-material';

// Mock data for cart items - in a real app, this would come from your state management or context
const mockCartItems = [
  {
    id: '1',
    name: 'Mountain Explorer',
    type: 'Mountain Bike',
    price: 899.99,
    image: 'https://www.paulscycles.co.uk/images/altitude-c70-red-carbon.jpg?width=1998&height=1998&quality=85&mode=pad&format=webp&bgcolor=ffffff',
    quantity: 1
  },
  {
    id: '3',
    name: 'Road Master',
    type: 'Road Bike',
    price: 1199.99,
    image: 'https://www.certini.co.uk/images/products/s/sp/specialized-allez-e5-disc-road-b-2.jpg?width=1998&height=1998&quality=85&mode=pad&format=webp&bgcolor=ffffff',
    quantity: 2
  }
];

// For rentals
const mockRentalItems = [
  {
    id: '2',
    name: 'City Cruiser',
    type: 'Urban Bike',
    price: 25.99,
    image: 'https://images.ctfassets.net/ogr4ifihl2yh/3gvlDBzj1UgLVNH2vAhFEF/5a1585c9a1463d431d7cce957ba7c984/Profile_-_Around_the_Block_Women-s_26__Single_Speed_-_Mint_Green_-_630042_NEW.png?w=1000&q=85',
    location: 'New York City Store',
    startDate: '2024-03-28',
    endDate: '2024-03-30',
    days: 3
  }
];

function CartPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  
  // State for cart items
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [rentalItems, setRentalItems] = useState(mockRentalItems);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [removeType, setRemoveType] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Check if cart is empty
  const isCartEmpty = cartItems.length === 0 && rentalItems.length === 0;
  
  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );
  
  const rentalTotal = rentalItems.reduce(
    (total, item) => total + item.price * item.days, 
    0
  );
  
  // Fixed shipping and taxes for demonstration
  const shipping = cartItems.length > 0 ? 15.99 : 0;
  const tax = (subtotal + rentalTotal) * 0.08; // 8% tax
  const total = subtotal + rentalTotal + shipping + tax;
  
  // Checkout steps
  const steps = ['Cart', 'Shipping', 'Payment', 'Confirmation'];
  
  // Handle quantity change
  const handleQuantityChange = (id, change) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + change) } 
          : item
      )
    );
  };
  
  // Handle item removal confirmation dialog
  const handleRemoveItemClick = (item, type) => {
    setItemToRemove(item);
    setRemoveType(type);
    setShowConfirmDialog(true);
  };
  
  // Handle actual item removal
  const confirmRemoveItem = () => {
    if (removeType === 'purchase') {
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemToRemove.id));
    } else {
      setRentalItems(prevItems => prevItems.filter(item => item.id !== itemToRemove.id));
    }
    
    setShowConfirmDialog(false);
    setSnackbarMessage('Item removed from cart');
    setSnackbarOpen(true);
  };
  
  // Handle navigation between checkout steps
  const handleNext = () => {
    // In a real app, validate each step before proceeding
    setLoading(true);
    
    // Simulate API call or processing
    setTimeout(() => {
      setActiveStep(prevStep => prevStep + 1);
      setLoading(false);
      
      // If we've completed the checkout, clear the cart
      if (activeStep === steps.length - 2) {
        setCartItems([]);
        setRentalItems([]);
      }
    }, 1000);
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Handle continue shopping
  const handleContinueShopping = () => {
    navigate('/bikes');
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link to="/" style={{ color: theme.palette.text.secondary, textDecoration: 'none' }}>
          Home
        </Link>
        <Typography color="text.primary">Cart</Typography>
      </Breadcrumbs>
      
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
        Your Cart
      </Typography>
      
      {/* Checkout Stepper */}
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel
        sx={{ 
          mb: 4,
          display: isCartEmpty && activeStep === 0 ? 'none' : 'flex'
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Cart is empty */}
      {isCartEmpty && activeStep === 0 ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <ShoppingBagIcon 
            sx={{ 
              fontSize: 80, 
              color: 'primary.light',
              mb: 2
            }} 
          />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph align="center">
            Looks like you haven't added anything to your cart yet.
            Browse our collection of bikes and find your perfect ride!
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleContinueShopping}
            startIcon={<ShoppingCartIcon />}
            sx={{ mt: 2 }}
          >
            Shop Now
          </Button>
        </Paper>
      ) : (
        <>
          {/* Cart content step */}
          {activeStep === 0 && (
            <Grid container spacing={4}>
              {/* Cart Items */}
              <Grid item xs={12} md={8}>
                {/* Purchase Items */}
                {cartItems.length > 0 && (
                  <Paper elevation={3} sx={{ mb: 3, p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Items for Purchase
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <List disablePadding>
                      {cartItems.map((item) => (
                        <React.Fragment key={item.id}>
                          <ListItem 
                            alignItems="flex-start" 
                            sx={{ 
                              py: 2,
                              flexDirection: isMobile ? 'column' : 'row'
                            }}
                          >
                            <ListItemAvatar sx={{ minWidth: isMobile ? '100%' : 100, mr: 2, mb: isMobile ? 2 : 0 }}>
                              <Avatar 
                                variant="rounded" 
                                src={item.image} 
                                alt={item.name}
                                sx={{ 
                                  width: isMobile ? '100%' : 100, 
                                  height: isMobile ? 150 : 100,
                                  borderRadius: 1
                                }}
                              />
                            </ListItemAvatar>
                            
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {item.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {item.type}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="primary.main">
                                ${item.price.toFixed(2)}
                              </Typography>
                            </Box>
                            
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                mt: isMobile ? 2 : 0
                              }}
                            >
                              <IconButton 
                                size="small" 
                                onClick={() => handleQuantityChange(item.id, -1)}
                                disabled={item.quantity <= 1}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              
                              <TextField
                                value={item.quantity}
                                size="small"
                                variant="outlined"
                                inputProps={{ 
                                  min: 1, 
                                  style: { textAlign: 'center' } 
                                }}
                                sx={{ width: 60, mx: 1 }}
                              />
                              
                              <IconButton 
                                size="small" 
                                onClick={() => handleQuantityChange(item.id, 1)}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                              
                              <IconButton 
                                color="error" 
                                sx={{ ml: 1 }}
                                onClick={() => handleRemoveItemClick(item, 'purchase')}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                )}
                
                {/* Rental Items */}
                {rentalItems.length > 0 && (
                  <Paper elevation={3} sx={{ mb: 3, p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Rental Reservations
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <List disablePadding>
                      {rentalItems.map((item) => (
                        <React.Fragment key={item.id}>
                          <ListItem 
                            alignItems="flex-start" 
                            sx={{ 
                              py: 2,
                              flexDirection: isMobile ? 'column' : 'row'
                            }}
                          >
                            <ListItemAvatar sx={{ minWidth: isMobile ? '100%' : 100, mr: 2, mb: isMobile ? 2 : 0 }}>
                              <Avatar 
                                variant="rounded" 
                                src={item.image} 
                                alt={item.name}
                                sx={{ 
                                  width: isMobile ? '100%' : 100, 
                                  height: isMobile ? 150 : 100,
                                  borderRadius: 1
                                }}
                              />
                            </ListItemAvatar>
                            
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {item.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {item.type}
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                Location: {item.location}
                              </Typography>
                              <Typography variant="body2">
                                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()} ({item.days} days)
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="primary.main" sx={{ mt: 1 }}>
                                ${item.price.toFixed(2)}/day · ${(item.price * item.days).toFixed(2)} total
                              </Typography>
                            </Box>
                            
                            <Box 
                              sx={{ 
                                mt: isMobile ? 2 : 0,
                                ml: isMobile ? 0 : 2,
                                display: 'flex',
                                justifyContent: 'flex-end'
                              }}
                            >
                              <IconButton 
                                color="error" 
                                onClick={() => handleRemoveItemClick(item, 'rental')}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleContinueShopping}
                  sx={{ mt: 2 }}
                >
                  Continue Shopping
                </Button>
              </Grid>
              
              {/* Order Summary */}
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    position: 'sticky',
                    top: 24
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1">Subtotal</Typography>
                      <Typography variant="body1">${subtotal.toFixed(2)}</Typography>
                    </Box>
                    
                    {rentalItems.length > 0 && (
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body1">Rental Total</Typography>
                        <Typography variant="body1">${rentalTotal.toFixed(2)}</Typography>
                      </Box>
                    )}
                    
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1">Shipping</Typography>
                      <Typography variant="body1">${shipping.toFixed(2)}</Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1">Tax</Typography>
                      <Typography variant="body1">${tax.toFixed(2)}</Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box display="flex" justifyContent="space-between" mb={3}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={handleNext}
                    endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Proceed to Checkout'}
                  </Button>
                  
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      We accept credit cards, PayPal, and Apple Pay.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Shipping step (simplified for demo) */}
          {activeStep === 1 && (
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom>
                Shipping Information
              </Typography>
              <Alert severity="info" sx={{ mb: 4 }}>
                This is a simplified checkout demo. In a real application, you would include forms for collecting shipping information.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    label="Full Name"
                    fullWidth
                    variant="outlined"
                    defaultValue={authState.user?.profile?.firstName ? `${authState.user.profile.firstName} ${authState.user.profile.lastName}` : ''}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    label="Email"
                    fullWidth
                    variant="outlined"
                    defaultValue={authState.user?.email || ''}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    label="Address"
                    fullWidth
                    variant="outlined"
                    defaultValue={authState.user?.profile?.address || ''}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    label="City"
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    required
                    label="State"
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    required
                    label="Zip"
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    variant="outlined"
                    defaultValue={authState.user?.profile?.phone || ''}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                >
                  Back to Cart
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </Button>
              </Box>
            </Paper>
          )}
          
          {/* Payment step (simplified for demo) */}
          {activeStep === 2 && (
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom>
                Payment Information
              </Typography>
              <Alert severity="info" sx={{ mb: 4 }}>
                This is a simplified checkout demo. In a real application, you would include forms for collecting payment information.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    label="Name on Card"
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    label="Card Number"
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    label="Expiration Date"
                    fullWidth
                    variant="outlined"
                    placeholder="MM/YY"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    label="CVV"
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                >
                  Back to Shipping
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Complete Order'}
                </Button>
              </Box>
            </Paper>
          )}
          
          {/* Confirmation step */}
          {activeStep === 3 && (
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4,
                textAlign: 'center',
                borderRadius: 2
              }}
            >
              <CheckCircleIcon 
                sx={{ 
                  fontSize: 80, 
                  color: 'success.main',
                  mb: 2
                }} 
              />
              <Typography variant="h4" gutterBottom>
                Order Confirmed!
              </Typography>
              <Typography variant="body1" paragraph sx={{ maxWidth: 600, mx: 'auto' }}>
                Your order has been successfully placed. A confirmation email has been sent to your email address.
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Order Number: <Typography component="span" fontWeight="bold">#ORD-{Math.floor(Math.random() * 100000)}</Typography>
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary" 
                component={Link} 
                to="/dashboard"
                sx={{ mt: 3 }}
              >
                View Your Orders
              </Button>
            </Paper>
          )}
        </>
      )}
      
      {/* Item removal confirmation dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <DialogTitle>Remove Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this item from your cart?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button onClick={confirmRemoveItem} color="error" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Container>
  );
}

export default CartPage;