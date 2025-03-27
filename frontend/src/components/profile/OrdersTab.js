// frontend/src/components/profile/OrdersTab.js
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrdersContext } from '../context/OrdersContext';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Collapse,
  IconButton,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme
} from '@mui/material';
import {
  ShoppingBag as OrderIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  LocalShipping as ShippingIcon,
  Paid as PaidIcon,
  SentimentDissatisfied as SadIcon
} from '@mui/icons-material';

function OrdersTab() {
  const theme = useTheme();
  const { orders, loading, error } = useContext(OrdersContext);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetailsDialog, setOrderDetailsDialog] = useState({ open: false, order: null });

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'primary';
      case 'shipped': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Calculate total days for rental item
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  };

  // Toggle order expansion
  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Open order details dialog
  const openOrderDetails = (order) => {
    setOrderDetailsDialog({ open: true, order });
  };

  // Close order details dialog
  const closeOrderDetails = () => {
    setOrderDetailsDialog({ open: false, order: null });
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
          <OrderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Order History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </Typography>
      </Box>

      {orders.length === 0 ? (
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
            No orders yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Your order history will appear here after you make a purchase or book a rental.
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/bikes"
            startIcon={<OrderIcon />}
          >
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="10%"></TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleOrderExpand(order.id)}
                      >
                        {expandedOrder === order.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell component="th" scope="row" sx={{ fontFamily: 'monospace' }}>
                      #{order.id.substring(order.id.length - 8).toUpperCase()}
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</TableCell>
                    <TableCell align="right">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                        color={getStatusColor(order.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openOrderDetails(order)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pb: 0, pt: 0 }} colSpan={7}>
                      <Collapse in={expandedOrder === order.id} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 2 }}>
                          <Typography variant="h6" gutterBottom component="div">
                            Order Items
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell align="right">Total</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {order.items.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell component="th" scope="row">
                                    {item.name}
                                  </TableCell>
                                  <TableCell>
                                    {item.itemType === 'purchase' ? 'Purchase' : 'Rental'}
                                    {item.itemType === 'rental' && (
                                      <Box component="span" sx={{ display: 'block', fontSize: '0.75rem' }}>
                                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                                      </Box>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    ${item.price.toFixed(2)}
                                    {item.itemType === 'rental' && '/day'}
                                  </TableCell>
                                  <TableCell>
                                    {item.itemType === 'purchase' ? 
                                      item.quantity : 
                                      `${calculateDays(item.startDate, item.endDate)} days`}
                                  </TableCell>
                                  <TableCell align="right">
                                    ${item.itemType === 'purchase' 
                                      ? (item.price * item.quantity).toFixed(2) 
                                      : (item.price * calculateDays(item.startDate, item.endDate)).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsDialog.open}
        onClose={closeOrderDetails}
        maxWidth="md"
        fullWidth
      >
        {orderDetailsDialog.order && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <OrderIcon sx={{ mr: 1 }} />
                Order Details
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="overline" display="block" gutterBottom>
                      Order ID
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      #{orderDetailsDialog.order.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="overline" display="block" gutterBottom>
                      Order Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(orderDetailsDialog.order.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="overline" display="block" gutterBottom>
                      Status
                    </Typography>
                    <Chip 
                      label={orderDetailsDialog.order.status.charAt(0).toUpperCase() + orderDetailsDialog.order.status.slice(1)} 
                      color={getStatusColor(orderDetailsDialog.order.status)} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="overline" display="block" gutterBottom>
                      Payment Method
                    </Typography>
                    <Typography variant="body1">
                      {orderDetailsDialog.order.paymentMethod}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Items
              </Typography>
              <Grid container spacing={2}>
                {orderDetailsDialog.order.items.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {item.type}
                        </Typography>
                        
                        {item.itemType === 'rental' && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              {formatDate(item.startDate)} - {formatDate(item.endDate)}
                            </Typography>
                            <Typography variant="body2">
                              {calculateDays(item.startDate, item.endDate)} days
                            </Typography>
                            {item.location && (
                              <Typography variant="body2">
                                Location: {item.location.name}
                              </Typography>
                            )}
                          </Box>
                        )}
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">
                            {item.itemType === 'purchase' ? `Qty: ${item.quantity}` : ''}
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" color="primary.main">
                            ${item.itemType === 'purchase' 
                              ? (item.price * item.quantity).toFixed(2)
                              : (item.price * calculateDays(item.startDate, item.endDate)).toFixed(2)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={1}>
                  <Grid item xs={8}>
                    <Typography variant="body1">Subtotal</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body1" align="right">
                      ${orderDetailsDialog.order.subtotal.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">Shipping</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body1" align="right">
                      ${orderDetailsDialog.order.shipping.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">Tax</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body1" align="right">
                      ${orderDetailsDialog.order.tax.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="h6">Total</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h6" align="right" color="primary.main" fontWeight="bold">
                      ${orderDetailsDialog.order.total.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {orderDetailsDialog.order.shippingAddress && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Shipping Address
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1">
                      {orderDetailsDialog.order.shippingAddress.firstName} {orderDetailsDialog.order.shippingAddress.lastName}
                    </Typography>
                    <Typography variant="body1">
                      {orderDetailsDialog.order.shippingAddress.address}
                    </Typography>
                    <Typography variant="body1">
                      {orderDetailsDialog.order.shippingAddress.city}, {orderDetailsDialog.order.shippingAddress.state} {orderDetailsDialog.order.shippingAddress.zipCode}
                    </Typography>
                    <Typography variant="body1">
                      {orderDetailsDialog.order.shippingAddress.country || 'United States'}
                    </Typography>
                    {orderDetailsDialog.order.shippingAddress.phone && (
                      <Typography variant="body1">
                        Phone: {orderDetailsDialog.order.shippingAddress.phone}
                      </Typography>
                    )}
                  </Paper>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeOrderDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default OrdersTab;