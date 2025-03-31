import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  DirectionsBike as BikeIcon,
  Star as StarIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const StatisticsDashboard = () => {
  const [statsTab, setStatsTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    counts: {
      users: 0,
      bikes: 0,
      orders: 0,
      reviews: 0,
      newUsers: 0
    },
    revenue: {
      total: 0,
      monthly: []
    },
    topProducts: {
      purchases: [],
      rentals: []
    }
  });
  const [salesStats, setSalesStats] = useState({
    salesByType: [],
    salesByBikeType: [],
    monthlySales: []
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Fetch real data from API
        const overviewRes = await axios.get('/api/admin/statistics/overview', {
          headers: { 'x-auth-token': token }
        });
        
        if (isMounted) {
          setStatistics(overviewRes.data);
        }
        
        // Fetch sales statistics
        const salesRes = await axios.get('/api/admin/statistics/sales', {
          headers: { 'x-auth-token': token }
        });
        
        if (isMounted) {
          setSalesStats(salesRes.data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        if (isMounted) {
          setError(err.response?.data.msg || 'Failed to load statistics. Please try again.');
          
          // ONLY use mock data if the API call fails
          console.log('Using mock data as fallback');
          setStatistics({
            counts: {
              users: 243,
              bikes: 87,
              orders: 1254,
              reviews: 756,
              newUsers: 17
            },
            revenue: {
              total: 158976.50,
              monthly: [
                { month: 1, name: 'Jan', revenue: 10500 },
                { month: 2, name: 'Feb', revenue: 12200 },
                { month: 3, name: 'Mar', revenue: 14300 },
                { month: 4, name: 'Apr', revenue: 16200 },
                { month: 5, name: 'May', revenue: 18100 },
                { month: 6, name: 'Jun', revenue: 17500 },
                { month: 7, name: 'Jul', revenue: 19800 },
                { month: 8, name: 'Aug', revenue: 21200 },
                { month: 9, name: 'Sep', revenue: 18700 },
                { month: 10, name: 'Oct', revenue: 16400 },
                { month: 11, name: 'Nov', revenue: 14100 },
                { month: 12, name: 'Dec', revenue: 0 },
              ]
            },
            topProducts: {
              purchases: [
                { _id: '1', name: 'Mountain Pro 5000', type: 'Mountain Bike', totalSold: 87 },
                { _id: '2', name: 'Urban Commuter', type: 'Urban Bike', totalSold: 64 },
                { _id: '3', name: 'Road Master Elite', type: 'Road Bike', totalSold: 58 },
                { _id: '4', name: 'Electric Explorer', type: 'Electric Bike', totalSold: 52 },
                { _id: '5', name: 'Hybrid Cruiser', type: 'Hybrid Bike', totalSold: 47 },
              ],
              rentals: [
                { _id: '3', name: 'Road Master Elite', type: 'Road Bike', totalRented: 126 },
                { _id: '1', name: 'Mountain Pro 5000', type: 'Mountain Bike', totalRented: 113 },
                { _id: '4', name: 'Electric Explorer', type: 'Electric Bike', totalRented: 98 },
                { _id: '2', name: 'Urban Commuter', type: 'Urban Bike', totalRented: 89 },
                { _id: '5', name: 'Hybrid Cruiser', type: 'Hybrid Bike', totalRented: 76 },
              ]
            }
          });
          
          setSalesStats({
            salesByType: [
              { _id: 'purchase', count: 754, revenue: 98765.50 },
              { _id: 'rental', count: 500, revenue: 60211.00 }
            ],
            salesByBikeType: [
              { _id: 'Mountain Bike', count: 378, revenue: 54321.75 },
              { _id: 'Road Bike', count: 296, revenue: 42876.50 },
              { _id: 'Electric Bike', count: 243, revenue: 36542.25 },
              { _id: 'Urban Bike', count: 187, revenue: 15432.50 },
              { _id: 'Hybrid Bike', count: 150, revenue: 9803.50 }
            ],
            monthlySales: Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const month = date.toLocaleString('default', { month: 'short' });
              const sales = Math.floor(Math.random() * 100) + 50;
              return {
                date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`,
                name: month,
                purchases: Math.floor(sales * 0.6),
                rentals: Math.floor(sales * 0.4),
                revenue: sales * 100 + Math.floor(Math.random() * 1000)
              };
            }).reverse()
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStatistics();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChangeStatsTab = (event, newValue) => {
    setStatsTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <Box>
      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%', 
              backgroundColor: 'primary.light',
              color: 'primary.contrastText'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCartIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Orders</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {statistics.counts.orders.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%', 
              backgroundColor: 'success.light',
              color: 'success.contrastText'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Users</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {statistics.counts.users.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                +{statistics.counts.newUsers} new (last 7 days)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%', 
              backgroundColor: 'warning.light',
              color: 'warning.contrastText'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BikeIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Bikes</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {statistics.counts.bikes.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%', 
              backgroundColor: 'info.light',
              color: 'info.contrastText'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Revenue</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(statistics.revenue.total)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different stat views */}
      <Box sx={{ mb: 2 }}>
        <Tabs
          value={statsTab}
          onChange={handleChangeStatsTab}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Overview" />
          <Tab label="Sales Analysis" />
          <Tab label="Products" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {statsTab === 0 && (
        <Grid container spacing={3}>
          {/* Monthly Revenue Box */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Monthly Revenue
              </Typography>
              <Box sx={{ p: 2, mt: 2 }}>
                <Typography variant="h4" sx={{ mb: 2 }}>
                  {formatCurrency(statistics.revenue.monthly.reduce((sum, month) => sum + month.revenue, 0))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total revenue across all months
                </Typography>
                
                {/* Instead of chart, display a revenue table */}
                <TableContainer sx={{ mt: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {statistics.revenue.monthly.map((month) => (
                        <TableRow key={month.month}>
                          <TableCell>{month.name}</TableCell>
                          <TableCell align="right">{formatCurrency(month.revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Reviews and Stats */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Reviews & Ratings
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StarIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h4">
                  {statistics.counts.reviews.toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ ml: 1 }}>
                  Total Reviews
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Customer Satisfaction
              </Typography>
              
              {/* Display rating distribution as a table instead of chart */}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rating</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { name: '5★', value: Math.round(statistics.counts.reviews * 0.45) },
                      { name: '4★', value: Math.round(statistics.counts.reviews * 0.25) },
                      { name: '3★', value: Math.round(statistics.counts.reviews * 0.15) },
                      { name: '2★', value: Math.round(statistics.counts.reviews * 0.10) },
                      { name: '1★', value: Math.round(statistics.counts.reviews * 0.05) }
                    ].map((rating) => (
                      <TableRow key={rating.name}>
                        <TableCell>{rating.name}</TableCell>
                        <TableCell align="right">{rating.value}</TableCell>
                        <TableCell align="right">
                          {(rating.value / statistics.counts.reviews * 100).toFixed(0)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Sales Analysis Tab */}
      {statsTab === 1 && (
        <Grid container spacing={3}>
          {/* Sales Trend Summary */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sales Trend (Last 12 Months)
              </Typography>
              
              {/* Display sales trends as a table instead of chart */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Purchases</TableCell>
                      <TableCell align="right">Rentals</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesStats.monthlySales.map((month) => (
                      <TableRow key={month.date}>
                        <TableCell>{month.name}</TableCell>
                        <TableCell align="right">{month.purchases}</TableCell>
                        <TableCell align="right">{month.rentals}</TableCell>
                        <TableCell align="right">{formatCurrency(month.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Sales by Type */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sales by Order Type
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Orders</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesStats.salesByType.map((item) => {
                      const totalOrders = salesStats.salesByType.reduce((sum, i) => sum + i.count, 0);
                      const percentage = (item.count / totalOrders * 100).toFixed(1);
                      
                      return (
                        <TableRow key={item._id}>
                          <TableCell>
                            {item._id.charAt(0).toUpperCase() + item._id.slice(1)}
                          </TableCell>
                          <TableCell align="right">{item.count}</TableCell>
                          <TableCell align="right">{formatCurrency(item.revenue)}</TableCell>
                          <TableCell align="right">{percentage}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Sales by Bike Type */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Revenue by Bike Type
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bike Type</TableCell>
                      <TableCell align="right">Orders</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesStats.salesByBikeType.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{item._id}</TableCell>
                        <TableCell align="right">{item.count}</TableCell>
                        <TableCell align="right">{formatCurrency(item.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Products Tab */}
      {statsTab === 2 && (
        <Grid container spacing={3}>
          {/* Top Selling Bikes */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Selling Bikes
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bike Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Units Sold</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statistics.topProducts.purchases.map((bike) => (
                      <TableRow key={bike._id}>
                        <TableCell>{bike.name}</TableCell>
                        <TableCell>{bike.type}</TableCell>
                        <TableCell align="right">{bike.totalSold}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Top Rental Bikes */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Rental Bikes
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bike Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Times Rented</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statistics.topProducts.rentals.map((bike) => (
                      <TableRow key={bike._id}>
                        <TableCell>{bike.name}</TableCell>
                        <TableCell>{bike.type}</TableCell>
                        <TableCell align="right">{bike.totalRented}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Sales by Bike Type Summary */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sales Summary by Bike Type
              </Typography>
              <Box sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Total Orders: {salesStats.salesByBikeType.reduce((sum, item) => sum + item.count, 0)}
                </Typography>
                <Typography variant="subtitle1">
                  Total Revenue: {formatCurrency(salesStats.salesByBikeType.reduce((sum, item) => sum + item.revenue, 0))}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default StatisticsDashboard;