import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
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
  LocationOn as LocationIcon
} from '@mui/icons-material';

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
  const [loading, setLoading] = useState({
    users: false,
    bikes: false,
    locations: false
  });
  const [error, setError] = useState({
    users: null,
    bikes: null,
    locations: null
  });
  
  // Check if user is admin
  useEffect(() => {
    if (!authState.user || authState.user.role !== 'admin') {
      // Set errors for non-admin users
      setError({
        users: 'Access denied. Admin privileges required.',
        bikes: 'Access denied. Admin privileges required.',
        locations: 'Access denied. Admin privileges required.'
      });
    }
  }, [authState]);
  
  // Fetch data when tab changes
  useEffect(() => {
    if (tabValue === 0) {
      fetchUsers();
    } else if (tabValue === 1) {
      fetchBikes();
    } else if (tabValue === 2) {
      fetchLocations();
    }
  }, [tabValue]);

  const fetchUsers = async () => {
    // In a real implementation, this would fetch users from your API
    setLoading(prev => ({ ...prev, users: true }));
    
    try {
      // Simulate API call or use actual endpoint if available
      // const res = await axios.get('/api/users/admin');
      // setUsers(res.data);
      
      // Mock data for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUsers = [
        { _id: '1', username: 'admin', email: 'admin@example.com', role: 'admin', createdAt: '2023-05-15' },
        { _id: '2', username: 'john_doe', email: 'john@example.com', role: 'user', createdAt: '2023-05-16' },
        { _id: '3', username: 'jane_smith', email: 'jane@example.com', role: 'user', createdAt: '2023-05-17' },
        { _id: '4', username: 'guest_user', email: 'guest@example.com', role: 'guest', createdAt: '2023-05-18' },
      ];
      
      setUsers(mockUsers);
      setError(prev => ({ ...prev, users: null }));
    } catch (err) {
      setError(prev => ({ 
        ...prev, 
        users: 'Failed to load users. Please try again.' 
      }));
      console.error('Error fetching users:', err);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchBikes = async () => {
    setLoading(prev => ({ ...prev, bikes: true }));
    try {
      const res = await axios.get('/api/bikes');
      setBikes(res.data);
      setError(prev => ({ ...prev, bikes: null }));
    } catch (err) {
      // If the API call fails, we'll use mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockBikes = [
        { _id: '1', name: 'Mountain Explorer', type: 'Mountain Bike', price: 899.99, rentalPrice: 35.99, purchaseStock: 15 },
        { _id: '2', name: 'City Cruiser', type: 'Urban Bike', price: 699.99, rentalPrice: 25.99, purchaseStock: 20 },
        { _id: '3', name: 'Road Master', type: 'Road Bike', price: 1199.99, rentalPrice: 45.99, purchaseStock: 10 },
        { _id: '4', name: 'Hybrid Commuter', type: 'Hybrid Bike', price: 749.99, rentalPrice: 30.99, purchaseStock: 12 },
      ];
      
      setBikes(mockBikes);
      setError(prev => ({ ...prev, bikes: null }));
    } finally {
      setLoading(prev => ({ ...prev, bikes: false }));
    }
  };

  const fetchLocations = async () => {
    setLoading(prev => ({ ...prev, locations: true }));
    try {
      const res = await axios.get('/api/locations');
      setLocations(res.data);
      setError(prev => ({ ...prev, locations: null }));
    } catch (err) {
      // If the API call fails, we'll use mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockLocations = [
        { _id: '1', name: 'New York City Store', code: 'nyc', city: 'New York', state: 'NY', address: '123 Broadway', zipCode: '10001' },
        { _id: '2', name: 'Los Angeles Store', code: 'la', city: 'Los Angeles', state: 'CA', address: '456 Hollywood Blvd', zipCode: '90028' },
        { _id: '3', name: 'Chicago Store', code: 'chi', city: 'Chicago', state: 'IL', address: '789 Michigan Ave', zipCode: '60611' },
      ];
      
      setLocations(mockLocations);
      setError(prev => ({ ...prev, locations: null }));
    } finally {
      setLoading(prev => ({ ...prev, locations: false }));
    }
  };

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Role color mapping
  const getRoleColor = (role) => {
    switch(role) {
      case 'admin':
        return 'error';
      case 'user':
        return 'primary';
      case 'guest':
        return 'default';
      default:
        return 'default';
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
          <Tab icon={<PersonAddIcon />} label="User Management" />
          <Tab icon={<BikeIcon />} label="Bike Management" />
          <Tab icon={<LocationIcon />} label="Location Management" />
        </Tabs>

        {/* User Management Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h6">User List</Typography>
          </Box>

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
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
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
                          <IconButton color="primary" size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" size="small" disabled={user.role === 'admin'}>
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
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h6">Bike Inventory</Typography>
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
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No bikes found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bikes.map((bike) => (
                      <TableRow key={bike._id}>
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

        {/* Location Management Tab */}
        <TabPanel value={tabValue} index={2}>
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
      </Paper>
    </Container>
  );
}

export default AdminPanel;