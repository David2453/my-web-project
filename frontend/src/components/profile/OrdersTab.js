// frontend/src/components/profile/OrdersTab.js
import React, { useContext, useState, useEffect } from 'react';
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
  SentimentDissatisfied as SadIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarTodayIcon,
  LocationOn as LocationOnIcon,
  Receipt as ReceiptIcon,
  Phone as PhoneIcon,
  TrackChanges as TrackChangesIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

function OrdersTab() {
  const theme = useTheme();
  const { orders, loading, error, fetchOrders } = useContext(OrdersContext);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetailsDialog, setOrderDetailsDialog] = useState({ open: false, order: null });

  // Reîncarcă comenzile când se montează componenta
  useEffect(() => {
    fetchOrders();
  }, []);

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

  // Handle refresh
  const handleRefresh = () => {
    fetchOrders();
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          <OrderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Istoric comenzi
        </Typography>
        <Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mr: 1 }}
          >
            Reîmprospătează
          </Button>
          <Typography variant="body2" color="text.secondary" component="span">
            {orders.length} {orders.length === 1 ? 'comandă' : 'comenzi'}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              REÎNCEARCĂ
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!error && orders.length === 0 ? (
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
            Nu există comenzi
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Istoricul comenzilor va apărea aici după ce faceți o achiziție sau o închiriere.
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/bikes"
            startIcon={<OrderIcon />}
          >
            Începeți cumpărăturile
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="10%"></TableCell>
                <TableCell>ID Comandă</TableCell>
                <TableCell>Dată</TableCell>
                <TableCell>Produse</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Acțiuni</TableCell>
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
                    <TableCell>{order.items.length} {order.items.length === 1 ? 'produs' : 'produse'}</TableCell>
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
                        Detalii
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
                                      `${calculateDays(item.startDate, item.endDate)} days${item.quantity > 1 ? `, ${item.quantity} biciclete` : ''}`}
                                  </TableCell>
                                  <TableCell align="right">
                                    ${item.itemType === 'purchase' 
                                      ? (item.price * item.quantity).toFixed(2) 
                                      : (item.price * calculateDays(item.startDate, item.endDate) * item.quantity).toFixed(2)}
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
        PaperProps={{
          sx: { borderRadius: 2, overflow: 'hidden' }
        }}
      >
        {orderDetailsDialog.order && (
          <>
            <DialogTitle sx={{ 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText',
              display: 'flex', 
              alignItems: 'center',
              p: 2
            }}>
              <Box display="flex" alignItems="center" width="100%">
                <OrderIcon sx={{ mr: 1.5, fontSize: 28 }} />
                <Typography variant="h6">Detalii Comandă</Typography>
                <Box flexGrow={1} />
                <Chip 
                  label={orderDetailsDialog.order.status.charAt(0).toUpperCase() + orderDetailsDialog.order.status.slice(1)} 
                  color={getStatusColor(orderDetailsDialog.order.status)} 
                  sx={{ 
                    fontSize: '1.2rem',
                    color: 'white'
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
                        Număr Comandă
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" fontFamily="monospace">
                        #{orderDetailsDialog.order.id.substring(orderDetailsDialog.order.id.length - 8).toUpperCase()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
                        Dată Comandă
                      </Typography>
                      <Typography variant="body1" display="flex" alignItems="center">
                        <CalendarTodayIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                        {formatDate(orderDetailsDialog.order.createdAt)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
                        Metodă Plată
                      </Typography>
                      <Typography variant="body1" display="flex" alignItems="center">
                        <PaidIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                        {orderDetailsDialog.order.paymentMethod || 'Card'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
                        Total Comandă
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary.main" fontSize="1.1rem">
                        ${orderDetailsDialog.order.total.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              <Typography variant="h6" sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center', 
                color: 'text.primary',
                bgcolor: 'background.paper',
                p: 1,
                borderRadius: 1
              }}>
                <OrderIcon sx={{ mr: 1 }} />
                Produse Comandate
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {orderDetailsDialog.order.items.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 3
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          mb: 1
                        }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {item.name}
                          </Typography>
                          <Chip 
                            label={item.itemType === 'purchase' ? 'Cumpărare' : 'Închiriere'} 
                            size="small"
                            color={item.itemType === 'purchase' ? 'primary' : 'success'}
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Box>
                        
                        <Divider sx={{ mb: 1.5 }} />
                        
                        <Box sx={{ mb: 1.5 }}>
                          {item.itemType === 'purchase' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                Cantitate:
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {item.quantity}
                              </Typography>
                            </Box>
                          ) : (
                            <>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <CalendarTodayIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <AccessTimeIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" fontWeight="medium">
                                  {calculateDays(item.startDate, item.endDate)} zile
                                </Typography>
                              </Box>
                              {item.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <LocationOnIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" fontWeight="medium">
                                    {item.location.name}
                                  </Typography>
                                </Box>
                              )}
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                  Cantitate:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {item.quantity}
                                </Typography>
                              </Box>
                            </>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            {item.itemType === 'purchase' ? 
                              `$${item.price.toFixed(2)} x ${item.quantity}` : 
                              `$${item.price.toFixed(2)} x ${calculateDays(item.startDate, item.endDate)} zile x ${item.quantity}`}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                            ${item.itemType === 'purchase' 
                              ? (item.price * item.quantity).toFixed(2)
                              : (item.price * calculateDays(item.startDate, item.endDate) * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Typography variant="h6" sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center', 
                color: 'text.primary',
                bgcolor: 'background.paper',
                p: 1,
                borderRadius: 1
              }}>
                <ReceiptIcon sx={{ mr: 1 }} />
                Rezumat Comandă
              </Typography>
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: 2, 
                  mb: 3 
                }}
              >
                <Grid container spacing={1}>
                  <Grid item xs={8}>
                    <Typography variant="body1" color="text.secondary">Subtotal</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body1" align="right">
                      ${orderDetailsDialog.order.subtotal?.toFixed(2) || orderDetailsDialog.order.total.toFixed(2)}
                    </Typography>
                  </Grid>
                  
                  {(orderDetailsDialog.order.shipping !== undefined) && (
                    <>
                      <Grid item xs={8}>
                        <Typography variant="body1" color="text.secondary">Transport</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body1" align="right">
                          ${orderDetailsDialog.order.shipping.toFixed(2)}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  {(orderDetailsDialog.order.tax !== undefined) && (
                    <>
                      <Grid item xs={8}>
                        <Typography variant="body1" color="text.secondary">TVA</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body1" align="right">
                          ${orderDetailsDialog.order.tax.toFixed(2)}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1.5 }} />
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
                  <Typography variant="h6" sx={{ 
                    mb: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: 'text.primary',
                    bgcolor: 'background.paper',
                    p: 1,
                    borderRadius: 1
                  }}>
                    <ShippingIcon sx={{ mr: 1 }} />
                    Adresă Livrare
                  </Typography>
                  
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      border: `1px solid ${theme.palette.divider}`, 
                      borderRadius: 2 
                    }}
                  >
                    <Typography variant="body1" fontWeight="medium">
                      {orderDetailsDialog.order.shippingAddress.firstName} {orderDetailsDialog.order.shippingAddress.lastName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {orderDetailsDialog.order.shippingAddress.address}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {orderDetailsDialog.order.shippingAddress.city}, {orderDetailsDialog.order.shippingAddress.state} {orderDetailsDialog.order.shippingAddress.zipCode}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {orderDetailsDialog.order.shippingAddress.country || 'România'}
                    </Typography>
                    {orderDetailsDialog.order.shippingAddress.phone && (
                      <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <PhoneIcon sx={{ mr: 0.5, fontSize: 16 }} />
                        {orderDetailsDialog.order.shippingAddress.phone}
                      </Typography>
                    )}
                  </Paper>
                </>
              )}

              {/* Adaugă o secțiune de stare comandă cu timeline */}
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'text.primary',
                  bgcolor: 'background.paper',
                  p: 1,
                  borderRadius: 1
                }}>
                  <TrackChangesIcon sx={{ mr: 1 }} />
                  Stare Comandă
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  position: 'relative',
                  px: 2,
                  py: 1
                }}>
                  {/* Linia de progres */}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '40px', 
                    left: '40px', 
                    right: '40px', 
                    height: '4px', 
                    bgcolor: 'divider',
                    zIndex: 0
                  }} />
                  
                  {/* Progresul actual */}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '40px', 
                    left: '40px', 
                    height: '4px', 
                    bgcolor: 'primary.main',
                    zIndex: 1,
                    width: (() => {
                      const status = orderDetailsDialog.order.status;
                      if (status === 'cancelled') return '0%';
                      if (status === 'pending') return '25%';
                      if (status === 'processing') return '50%';
                      if (status === 'shipped') return '75%';
                      if (status === 'delivered') return '100%';
                      return '0%';
                    })()
                  }} />
                  
                  {/* Etapele */}
                  {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => {
                    const isActive = (() => {
                      const currentStatus = orderDetailsDialog.order.status;
                      if (currentStatus === 'cancelled') return false;
                      
                      const statusOrder = {
                        'pending': 0,
                        'processing': 1,
                        'shipped': 2,
                        'delivered': 3
                      };
                      
                      return statusOrder[currentStatus] >= statusOrder[status];
                    })();
                    
                    return (
                      <Box key={status} sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        zIndex: 2,
                        position: 'relative'
                      }}>
                        <Box sx={{ 
                          width: 25, 
                          height: 25, 
                          borderRadius: '50%', 
                          bgcolor: isActive ? 'primary.main' : 'background.paper',
                          border: `2px solid ${isActive ? 'primary.main' : theme.palette.divider}`,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          mb: 1
                        }}>
                          {isActive && <CheckIcon sx={{ color: 'white', fontSize: 16 }} />}
                        </Box>
                        <Typography variant="body2" fontWeight={isActive ? 'bold' : 'normal'} color={isActive ? 'primary.main' : 'text.secondary'}>
                          {status === 'pending' && 'Procesată'}
                          {status === 'processing' && 'În pregătire'}
                          {status === 'shipped' && 'Expediată'}
                          {status === 'delivered' && 'Livrată'}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
                
                {orderDetailsDialog.order.status === 'cancelled' && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mt: 2,
                    p: 1,
                    bgcolor: 'error.light',
                    color: 'error.dark',
                    borderRadius: 1
                  }}>
                    <CancelIcon sx={{ mr: 1 }} />
                    <Typography variant="body2" fontWeight="medium">
                      Această comandă a fost anulată
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button 
                variant="outlined" 
                onClick={closeOrderDetails}
                startIcon={<CloseIcon />}
              >
                Închide
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => window.print()}
                startIcon={<PrintIcon />}
              >
                Printează Comanda
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default OrdersTab;