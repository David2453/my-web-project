import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import BikeForm from './BikeForm';
import StatisticsDashboard from './StatisticsDashboard';
import SearchBar from '../common/SearchBar';
import { AuthContext } from '../context/AuthContext';
import { 
  Box, 
  Typography, 
  Container, 
  Tabs, 
  Tab, 
  Paper, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  DirectionsBike as BikeIcon,
  LocationOn as LocationIcon,
  Add as AddIcon,
  BarChart as BarChartIcon,
  ShoppingBag as OrderIcon,
  CheckCircle as ApproveIcon,
  Route as RouteIcon
} from '@mui/icons-material';
import RouteForm from './RouteForm';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AdminPanel() {
  const { authState } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState({
    users: false,
    bikes: false,
    locations: false,
    orders: false,
    routes: false
  });
  const [error, setError] = useState({
    users: null,
    bikes: null,
    locations: null,
    orders: null,
    routes: null
  });
  const [openBikeForm, setOpenBikeForm] = useState(false);
  const [currentBike, setCurrentBike] = useState(null);
  const [openRouteForm, setOpenRouteForm] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);
  
  // Search and filter states
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  
  // Filter options
  const userFilterOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
    { label: 'Guest', value: 'guest' }
  ];
  
  const orderFilterOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  // Check if user is admin
  useEffect(() => {
    if (!authState.user || authState.user.role !== 'admin') {
      setError({
        users: 'Access denied. Admin privileges required.',
        bikes: 'Access denied. Admin privileges required.',
        locations: 'Access denied. Admin privileges required.',
        orders: 'Access denied. Admin privileges required.',
        routes: 'Access denied. Admin privileges required.'
      });
    }
  }, [authState]);

  // Fetch data when tab changes
  useEffect(() => {
    if (tabValue === 1) {
      fetchUsers();
    } else if (tabValue === 2) {
      fetchBikes();
    } else if (tabValue === 3) {
      fetchLocations();
    } else if (tabValue === 4) {
      fetchOrders();
    } else if (tabValue === 5) {
      fetchRoutes();
    }
  }, [tabValue]);

  // Update filtered users when users change
  useEffect(() => {
    if (users.length > 0) {
      setFilteredUsers(users);
    }
  }, [users]);

  // Update filtered orders when orders change
  useEffect(() => {
    if (orders.length > 0) {
      setFilteredOrders(orders);
    }
  }, [orders]);

  // Modificăm efectul pentru a încărca locațiile și când se deschide formularul de rute
  useEffect(() => {
    if (tabValue === 3 || openRouteForm) {
      fetchLocations();
    }
  }, [tabValue, openRouteForm]);

  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const res = await axios.get('/api/admin/users', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setUsers(res.data);
      setError(prev => ({ ...prev, users: null }));
    } catch (err) {
      setError(prev => ({ 
        ...prev, 
        users: err.response?.data.msg || 'Failed to load users. Please try again.' 
      }));
      console.error('Error fetching users:', err);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setUsers(users.filter(user => user._id !== userId));
      setFilteredUsers(filteredUsers.filter(user => user._id !== userId));
    } catch (err) {
      setError(prev => ({ 
        ...prev, 
        users: err.response?.data.msg || 'Failed to delete user. Please try again.' 
      }));
      console.error('Error deleting user:', err);
    }
  };

  const fetchBikes = async () => {
    setLoading(prev => ({ ...prev, bikes: true }));
    try {
      const res = await axios.get('/api/bikes');
      setBikes(res.data);
      setError(prev => ({ ...prev, bikes: null }));
    } catch (err) {
      setError(prev => ({ 
        ...prev, 
        bikes: err.response?.data.msg || 'Failed to load bikes. Please try again.' 
      }));
      console.error('Error fetching bikes:', err);
    } finally {
      setLoading(prev => ({ ...prev, bikes: false }));
    }
  };

  const deleteBike = async (bikeId) => {
    if (!window.confirm('Are you sure you want to delete this bike?')) {
      return;
    }
    try {
      await axios.delete(`/api/admin/bikes/${bikeId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setBikes(bikes.filter(bike => bike._id !== bikeId));
    } catch (err) {
      setError(prev => ({ 
        ...prev, 
        bikes: err.response?.data.msg || 'Failed to delete bike. Please try again.' 
      }));
      console.error('Error deleting bike:', err);
    }
  };

  const fetchLocations = async () => {
    setLoading(prev => ({ ...prev, locations: true }));
    try {
      const res = await axios.get('/api/locations');
      setLocations(res.data);
      setError(prev => ({ ...prev, locations: null }));
    } catch (err) {
      setError(prev => ({ 
        ...prev, 
        locations: err.response?.data.msg || 'Failed to load locations. Please try again.' 
      }));
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(prev => ({ ...prev, locations: false }));
    }
  };

  const fetchOrders = async () => {
    setLoading(prev => ({ ...prev, orders: true }));
    try {
      const res = await axios.get('/api/admin/orders', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setOrders(res.data);
      setError(prev => ({ ...prev, orders: null }));
    } catch (err) {
      setError(prev => ({ 
        ...prev, 
        orders: err.response?.data.msg || 'Failed to load orders. Please try again.' 
      }));
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`/api/orders/${orderId}`, 
        { status: newStatus },
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      // Update the orders list with the updated order
      setOrders(orders.map(order => 
        order._id === orderId ? res.data : order
      ));
      
      // Also update filtered orders if needed
      setFilteredOrders(filteredOrders.map(order => 
        order._id === orderId ? res.data : order
      ));
      
    } catch (err) {
      setError(prev => ({ 
        ...prev, 
        orders: err.response?.data.msg || 'Failed to update order status. Please try again.' 
      }));
      console.error('Error updating order status:', err);
    }
  };

  // Search handlers
  const handleUserSearch = (query, activeFilters = []) => {
    setUserSearchQuery(query);
    
    let filtered = [...users];
    
    // Filter by search query if it exists
    if (query.trim() !== '') {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(lowerQuery) ||
        (user.email && user.email.toLowerCase().includes(lowerQuery)) ||
        (user.profile && user.profile.firstName && user.profile.firstName.toLowerCase().includes(lowerQuery)) ||
        (user.profile && user.profile.lastName && user.profile.lastName.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Apply role filters if any are active
    if (activeFilters.length > 0) {
      filtered = filtered.filter(user => 
        activeFilters.includes(user.role)
      );
    }
    
    setFilteredUsers(filtered);
  };

  const handleOrderSearch = (query, activeFilters = []) => {
    setOrderSearchQuery(query);
    
    let filtered = [...orders];
    
    // Filter by search query if it exists
    if (query.trim() !== '') {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(order => {
        // Search by order ID
        const orderIdMatch = order._id.toLowerCase().includes(lowerQuery);
        
        // For short ID search (last part of the ID)
        const shortIdMatch = order._id.substring(order._id.length - 8).toLowerCase().includes(lowerQuery);
        
        // Search by customer name if available
        const customerNameMatch = order.user && 
          `${order.user.firstName || ''} ${order.user.lastName || ''}`.toLowerCase().includes(lowerQuery);
        
        return orderIdMatch || shortIdMatch || customerNameMatch;
      });
    }
    
    // Apply status filters if any are active
    if (activeFilters.length > 0) {
      filtered = filtered.filter(order => 
        activeFilters.includes(order.status)
      );
    }
    
    setFilteredOrders(filtered);
  };

  // Format date for orders
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get order status color
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

  const handleAddBike = () => {
    setCurrentBike(null);
    setOpenBikeForm(true);
  };

  const handleEditBike = (bike) => {
    setCurrentBike(bike);
    setOpenBikeForm(true);
  };

  const handleCloseBikeForm = () => {
    setOpenBikeForm(false);
  };

  const handleSubmitBike = async (formData) => {
    try {
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const headers = {
        'x-auth-token': localStorage.getItem('token')
      };

      let response;
      if (currentBike) {
        // Update existing bike
        console.log('Updating bike:', currentBike._id);
        response = await axios.put(`/api/admin/bikes/${currentBike._id}`, formData, { headers });
        console.log('Update response:', response.data);
        setBikes(bikes.map(bike => 
          bike._id === currentBike._id ? response.data : bike
        ));
      } else {
        // Add new bike
        console.log('Creating new bike');
        response = await axios.post('/api/admin/bikes', formData, { headers });
        console.log('Create response:', response.data);
        setBikes([...bikes, response.data]);
      }
      setOpenBikeForm(false);
      setCurrentBike(null);
      setError(prev => ({ ...prev, bikes: null }));
    } catch (err) {
      console.error('Error in handleSubmitBike:', err.response?.data || err);
      setError(prev => ({ 
        ...prev, 
        bikes: err.response?.data.msg || 'Failed to save bike. Please try again.' 
      }));
    }
  };

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'error';
      case 'user': return 'primary';
      case 'guest': return 'default';
      default: return 'default';
    }
  };

  const fetchRoutes = async () => {
    setLoading(prev => ({ ...prev, routes: true }));
    try {
      const res = await axios.get('/api/admin/routes', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setRoutes(res.data);
      setError(prev => ({ ...prev, routes: null }));
    } catch (err) {
      setError(prev => ({ 
        ...prev, 
        routes: err.response?.data.msg || 'Failed to load routes. Please try again.' 
      }));
      console.error('Error fetching routes:', err);
    } finally {
      setLoading(prev => ({ ...prev, routes: false }));
    }
  };

  const handleAddRoute = () => {
    if (locations.length === 0) {
      fetchLocations(); // Încărcăm locațiile dacă nu sunt încărcate
    }
    setCurrentRoute(null);
    setOpenRouteForm(true);
  };

  const handleEditRoute = (route) => {
    setCurrentRoute(route);
    setOpenRouteForm(true);
  };

  const handleDeleteRoute = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route?')) {
      return;
    }
    try {
      await axios.delete(`/api/admin/routes/${routeId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setRoutes(routes.filter(route => route._id !== routeId));
    } catch (err) {
      setError(prev => ({ 
        ...prev, 
        routes: err.response?.data.msg || 'Failed to delete route. Please try again.' 
      }));
      console.error('Error deleting route:', err);
    }
  };

  const handleSubmitRoute = async (formData) => {
    try {
      const headers = {
        'x-auth-token': localStorage.getItem('token'),
      };
      let response;
      if (currentRoute) {
        // Update existing route
        response = await axios.put(`/api/admin/routes/${currentRoute._id}`, formData, { headers });
        setRoutes(routes.map(route => 
          route._id === currentRoute._id ? response.data : route
        ));
      } else {
        // Add new route
        response = await axios.post('/api/admin/routes', formData, { headers });
        setRoutes([...routes, response.data]);
      }
      setError(prev => ({ ...prev, routes: null }));
      setOpenRouteForm(false);
    } catch (err) {
      setError(prev => ({ 
        ...prev, 
        routes: err.response?.data.msg || 'Failed to save route. Please try again.' 
      }));
      console.error('Error saving route:', err);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Admin Dashboard
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2">
            Logged in as {authState.user?.username || 'Admin'}
          </Typography>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<BarChartIcon />} label="Statistics" />
          <Tab icon={<PersonAddIcon />} label="User Management" />
          <Tab icon={<BikeIcon />} label="Bike Management" />
          <Tab icon={<LocationIcon />} label="Location Management" />
          <Tab icon={<OrderIcon />} label="Orders" />
          <Tab icon={<RouteIcon />} label="Routes" />
        </Tabs>

        {/* Statistics Dashboard Tab */}
        <TabPanel value={tabValue} index={0}>
          <StatisticsDashboard />
        </TabPanel>

        {/* User Management Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h6">User Management</Typography>
          </Box>
          
          <SearchBar 
            placeholder="Search users by name, email..."
            onSearch={handleUserSearch}
            filterOptions={userFilterOptions}
            value={userSearchQuery}
          />
          
          {error.users && (
            <Alert severity="error" sx={{ mb: 2 }}>{error.users}</Alert>
          )}
          {loading.users ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          {userSearchQuery ? 'No users found matching your search' : 'No users found'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role}
                            color={getRoleColor(user.role)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <IconButton 
                            color="error" 
                            size="small" 
                            disabled={user.role === 'admin'}
                            onClick={() => deleteUser(user._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Bike Management Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h6">Bike Inventory</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddBike}
            >
              Add New Bike
            </Button>
          </Box>
          {error.bikes && (
            <Alert severity="error" sx={{ mb: 2 }}>{error.bikes}</Alert>
          )}
          {loading.bikes ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Imagine</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Purchase Price</TableCell>
                    <TableCell>Rental Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bikes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No bikes found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bikes.map((bike) => (
                      <TableRow key={bike._id}>
                        <TableCell>
                          {bike.image ? (
                            <img 
                              src={bike.image} 
                              alt={bike.name} 
                              style={{ 
                                width: '50px', 
                                height: '50px', 
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }} 
                            />
                          ) : (
                            <Box 
                              sx={{ 
                                width: '50px', 
                                height: '50px', 
                                backgroundColor: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px'
                              }}
                            >
                              <BikeIcon color="disabled" />
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>{bike.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={bike.type}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>${bike.price}</TableCell>
                        <TableCell>${bike.rentalPrice}/day</TableCell>
                        <TableCell>{bike.purchaseStock}</TableCell>
                        <TableCell align="right">
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => handleEditBike(bike)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => deleteBike(bike._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Location Management Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h6">Store Locations</Typography>
          </Box>
          {error.locations && (
            <Alert severity="error" sx={{ mb: 2 }}>{error.locations}</Alert>
          )}
          {loading.locations ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>State</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {locations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No locations found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    locations.map((location) => (
                      <TableRow key={location._id}>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>{location.code}</TableCell>
                        <TableCell>{location.city}</TableCell>
                        <TableCell>{location.state}</TableCell>
                        <TableCell align="right">
                          <IconButton color="primary" size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" size="small">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Orders Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h2" fontWeight="medium">
              <OrderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Manage Orders
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={fetchOrders}
            >
              Refresh
            </Button>
          </Box>

          <SearchBar 
            placeholder="Search by order ID or customer name..."
            onSearch={handleOrderSearch}
            filterOptions={orderFilterOptions}
            value={orderSearchQuery}
          />

          {loading.orders ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : error.orders ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error.orders}
            </Alert>
          ) : filteredOrders.length === 0 ? (
            <Alert severity="info">
              {orderSearchQuery ? 'No orders found matching your search' : 'No orders found'}
            </Alert>
          ) : (
            <TableContainer component={Paper} elevation={1}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order._id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                      <TableCell component="th" scope="row" sx={{ fontFamily: 'monospace' }}>
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        {order.user?.profile ? 
                          `${order.user.profile.firstName || ''} ${order.user.profile.lastName || ''}`.trim() || order.user.username
                          : 'Guest User'}
                      </TableCell>
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
                        {order.status === 'pending' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<ApproveIcon />}
                            onClick={() => updateOrderStatus(order._id, 'delivered')}
                          >
                            Approve
                          </Button>
                        )}
                        {order.status !== 'pending' && (
                          <Typography variant="body2" color="text.secondary">
                            No action needed
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Routes Tab */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h6">Bike Routes Management</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddRoute}
            >
              Add New Route
            </Button>
          </Box>
          {error.routes && (
            <Alert severity="error" sx={{ mb: 2 }}>{error.routes}</Alert>
          )}
          {loading.routes ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Distance</TableCell>
                    <TableCell>Difficulty</TableCell>
                    <TableCell>Est. Time</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {routes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No routes found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    routes.map((route) => (
                      <TableRow key={route._id}>
                        <TableCell>{route.name}</TableCell>
                        <TableCell>{route.location?.name || 'N/A'}</TableCell>
                        <TableCell>{route.distance} km</TableCell>
                        <TableCell>
                          <Chip 
                            label={route.difficulty}
                            color={getDifficultyColor(route.difficulty)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{route.estimatedTime} min</TableCell>
                        <TableCell align="right">
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => handleEditRoute(route)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => handleDeleteRoute(route._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>
      <BikeForm 
        open={openBikeForm}
        handleClose={handleCloseBikeForm}
        bike={currentBike}
        onSubmit={handleSubmitBike}
      />
      <RouteForm 
        open={openRouteForm}
        handleClose={() => setOpenRouteForm(false)}
        route={currentRoute}
        locations={locations}
        onSubmit={handleSubmitRoute}
      />
    </Container>
  );
}

export default AdminPanel;