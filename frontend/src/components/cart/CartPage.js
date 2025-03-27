// frontend/src/components/cart/CartPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { OrdersContext } from '../context/OrdersContext';

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



function CartPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const { cartItems, loading: cartLoading, error: cartError, updateCartItem, removeFromCart, clearCart, calculateTotals } = useContext(CartContext);
  const { /*fetchOrders*/ } = useContext(OrdersContext);
  // State for checkout
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Extract purchase and rental items from cart
  const purchaseItems = cartItems.filter(item => item.itemType === 'purchase');
  const rentalItems = cartItems.filter(item => item.itemType === 'rental');
  
  // Check if cart is empty
  const isCartEmpty = cartItems.length === 0;
  
  // Get totals from the context
  const { subtotal, rentalTotal, shipping, tax, total } = calculateTotals();
  
  // Checkout steps
  const steps = ['Cart', 'Shipping', 'Payment', 'Confirmation'];
  
  // Handle quantity change
  const handleQuantityChange = async (id, change, currentQuantity) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    try {
      await updateCartItem(id, newQuantity);
    } catch (err) {
      console.error('Error updating quantity:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update quantity',
        severity: 'error'
      });
    }
  };
  
  // Handle direct quantity input
  const handleQuantityInput = async (id, value) => {
    // Convert to number, ensure minimum of 1
    const quantity = Math.max(1, parseInt(value) || 1);
    try {
      await updateCartItem(id, quantity);
    } catch (err) {
      console.error('Error updating quantity:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update quantity',
        severity: 'error'
      });
    }
  };
  
  // Handle item removal confirmation dialog
  const handleRemoveItemClick = (item) => {
    setItemToRemove(item);
    setShowConfirmDialog(true);
  };
  
  // Handle actual item removal
  const confirmRemoveItem = async () => {
    try {
      await removeFromCart(itemToRemove.id);
      setShowConfirmDialog(false);
      setSnackbar({
        open: true,
        message: 'Item removed from cart',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error removing item:', err);
      setSnackbar({
        open: true,
        message: 'Failed to remove item',
        severity: 'error'
      });
    }
  };
  
  // Handle navigation between checkout steps
  const { fetchOrders } = useContext(OrdersContext);

const handleNext = async () => {
  setLoading(true);
  
  try {
    // If we've completed the checkout, clear the cart and fetch orders
    if (activeStep === steps.length - 2) {
      await clearCart();
      
      // Manually fetch orders after clearing the cart
      await fetchOrders();
    }
    
    // Move to next step
    setActiveStep(prevStep => prevStep + 1);
  } catch (err) {
    console.error('Error during checkout:', err);
    setSnackbar({
      open: true,
      message: 'Error completing order',
      severity: 'error'
    });
  } finally {
    setLoading(false);
  }
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
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Calculate number of days for rental item
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
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
      
      {/* Loading state */}
      {cartLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress size={60} />
        </Box>
      )}
      
      {/* Error state */}
      {cartError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {cartError}
        </Alert>
      )}
      
      {/* Checkout Stepper */}
      {!cartLoading && (
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
      )}
      
      {/* Cart is empty */}
      {!cartLoading && isCartEmpty && activeStep === 0 ? (
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
          {!cartLoading && activeStep === 0 && (
            <Grid container spacing={4}>
              {/* Cart Items */}
              <Grid item xs={12} md={8}>
                {/* Purchase Items */}
                {purchaseItems.length > 0 && (
                  <Paper elevation={3} sx={{ mb: 3, p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Items for Purchase
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <List disablePadding>
                      {purchaseItems.map((item) => (
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
                                onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                                disabled={item.quantity <= 1}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              
                              <TextField
                                value={item.quantity}
                                size="small"
                                variant="outlined"
                                onChange={(e) => handleQuantityInput(item.id, e.target.value)}
                                inputProps={{ 
                                  min: 1, 
                                  style: { textAlign: 'center' } 
                                }}
                                sx={{ width: 60, mx: 1 }}
                              />
                              
                              <IconButton 
                                size="small" 
                                onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                              
                              <IconButton 
                                color="error" 
                                sx={{ ml: 1 }}
                                onClick={() => handleRemoveItemClick(item)}
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
                                Location: {item.location?.name || 'N/A'}
                              </Typography>
                              <Typography variant="body2">
                                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()} ({calculateDays(item.startDate, item.endDate)} days)
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="primary.main" sx={{ mt: 1 }}>
                                ${item.rentalPrice.toFixed(2)}/day · ${(item.rentalPrice * calculateDays(item.startDate, item.endDate)).toFixed(2)} total
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
                                onClick={() => handleRemoveItemClick(item)}
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
                  sx={{ mt: 4, backgroundColor:"white" }}
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
                    disabled={loading || isCartEmpty}
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
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
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

export default CartPage;