// frontend/src/components/dashboard/DashboardOrdersTab.js
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
  useTheme
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  KeyboardArrowRight as ArrowRightIcon,
  SentimentDissatisfied as SadIcon
} from '@mui/icons-material';

function DashboardOrdersTab() {
  const theme = useTheme();
  const { getRecentOrders, loading, error } = useContext(OrdersContext);
  
  // Get recent orders (last 5)
  const recentOrders = getRecentOrders ? getRecentOrders(5) : [];

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
          <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Recent Orders
        </Typography>
        <Button 
          variant="text" 
          component={Link} 
          to="/profile" 
          endIcon={<ArrowRightIcon />}
          onClick={() => {
            // Programmatically set tab value to 3 (Orders) in the profile page
            localStorage.setItem('profileTabValue', '3');
          }}
        >
          View All
        </Button>
      </Box>

      {recentOrders.length === 0 ? (
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
          >
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow 
                  key={order.id} 
                  sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                >
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
                      component={Link}
                      to="/profile"
                      onClick={() => {
                        // Programmatically set tab value to 3 (Orders) in the profile page
                        localStorage.setItem('profileTabValue', '3');
                        localStorage.setItem('selectedOrderId', order.id);
                      }}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default DashboardOrdersTab;