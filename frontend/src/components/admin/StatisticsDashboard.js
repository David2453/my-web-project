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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Înregistrăm componentele Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Adăugăm opțiuni globale pentru Chart.js pentru o calitate mai bună
ChartJS.defaults.font.family = '"Roboto", "Helvetica", "Arial", sans-serif';
ChartJS.defaults.font.size = 14;
ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
ChartJS.defaults.plugins.tooltip.padding = 12;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
ChartJS.defaults.plugins.tooltip.titleFont.size = 16;
ChartJS.defaults.plugins.tooltip.bodyFont.size = 14;
ChartJS.defaults.devicePixelRatio = 2;

const COLORS = [
  'rgba(54, 162, 235, 0.8)',
  'rgba(75, 192, 192, 0.8)',
  'rgba(255, 206, 86, 0.8)',
  'rgba(255, 99, 132, 0.8)',
  'rgba(153, 102, 255, 0.8)',
  'rgba(255, 159, 64, 0.8)'
];

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

  const revenueChartData = {
    labels: statistics.revenue.monthly.map(month => month.name),
    datasets: [
      {
        label: 'Venit lunar',
        data: statistics.revenue.monthly.map(month => month.revenue),
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(75, 192, 192)'
      }
    ]
  };

  const salesChartData = {
    labels: salesStats.monthlySales.map(month => month.name),
    datasets: [
      {
        label: 'Cumpărări',
        data: salesStats.monthlySales.map(month => month.purchases),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 12,
      },
      {
        label: 'Închirieri',
        data: salesStats.monthlySales.map(month => month.rentals),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 12,
      }
    ]
  };

  const salesByTypeData = {
    labels: salesStats.salesByType.map(item => item._id.charAt(0).toUpperCase() + item._id.slice(1)),
    datasets: [
      {
        data: salesStats.salesByType.map(item => item.revenue),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderColor: [
          'rgb(54, 162, 235)',
          'rgb(255, 99, 132)'
        ],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const bikeTypeData = {
    labels: salesStats.salesByBikeType.map(item => item._id),
    datasets: [
      {
        data: salesStats.salesByBikeType.map(item => item.revenue),
        backgroundColor: COLORS,
        borderColor: COLORS.map(color => color.replace('0.8', '1')),
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
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
                Venit lunar
              </Typography>
              <Box sx={{ height: 300, p: 2 }}>
                <Line 
                  data={revenueChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          padding: 20,
                          font: {
                            size: 14
                          }
                        }
                      },
                      title: {
                        display: true,
                        text: 'Evoluția veniturilor lunare',
                        font: {
                          size: 16,
                          weight: 'bold'
                        },
                        padding: 20
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          drawBorder: false
                        },
                        ticks: {
                          font: {
                            size: 12
                          }
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          font: {
                            size: 12
                          }
                        }
                      }
                    }
                  }}
                />
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
                Tendințe vânzări (Ultimele 12 luni)
              </Typography>
              <Box sx={{ height: 300, p: 2 }}>
                <Bar
                  data={salesChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          padding: 20,
                          font: {
                            size: 14
                          }
                        }
                      },
                      title: {
                        display: true,
                        text: 'Vânzări și închirieri lunare',
                        font: {
                          size: 16,
                          weight: 'bold'
                        },
                        padding: 20
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          drawBorder: false
                        },
                        ticks: {
                          font: {
                            size: 12
                          }
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          font: {
                            size: 12
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Sales by Type */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Distribuția vânzărilor după tip
              </Typography>
              <Box sx={{ height: 300, p: 2 }}>
                <Doughnut
                  data={salesByTypeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          padding: 20,
                          font: {
                            size: 14
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                          }
                        }
                      }
                    },
                    cutout: '60%'
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Sales by Bike Type */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Venituri după tipul de bicicletă
              </Typography>
              <Box sx={{ height: 300, p: 2 }}>
                <Pie
                  data={bikeTypeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          padding: 20,
                          font: {
                            size: 14
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
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
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <BikeIcon sx={{ mr: 1 }} />
                Cele mai vândute biciclete
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nume bicicletă</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Tip</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Unități vândute</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statistics.topProducts.purchases.map((bike) => (
                      <TableRow 
                        key={bike._id}
                        sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                      >
                        <TableCell sx={{ color: 'primary.main' }}>{bike.name}</TableCell>
                        <TableCell>{bike.type}</TableCell>
                        <TableCell align="right">
                          <Typography 
                            component="span" 
                            sx={{ 
                              bgcolor: 'primary.light',
                              color: 'primary.main',
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'inline-block'
                            }}
                          >
                            {bike.totalSold}
                          </Typography>
                        </TableCell>
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
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <BikeIcon sx={{ mr: 1 }} />
                Cele mai închiriate biciclete
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nume bicicletă</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Tip</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total închirieri</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statistics.topProducts.rentals.map((bike) => (
                      <TableRow 
                        key={bike._id}
                        sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                      >
                        <TableCell sx={{ color: 'primary.main' }}>{bike.name}</TableCell>
                        <TableCell>{bike.type}</TableCell>
                        <TableCell align="right">
                          <Typography 
                            component="span" 
                            sx={{ 
                              bgcolor: 'success.light',
                              color: 'success.main',
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'inline-block'
                            }}
                          >
                            {bike.totalRented}
                          </Typography>
                        </TableCell>
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
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ mr: 1 }} />
                Sumar vânzări după tipul de bicicletă
              </Typography>
              <Box sx={{ 
                p: 3, 
                mt: 2, 
                display: 'flex', 
                justifyContent: 'space-around',
                bgcolor: 'background.default',
                borderRadius: 2
              }}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom color="text.secondary">
                    Total comenzi
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {salesStats.salesByBikeType.reduce((sum, item) => sum + item.count, 0)}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ mx: 4 }} />
                <Box>
                  <Typography variant="subtitle1" gutterBottom color="text.secondary">
                    Venit total
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {formatCurrency(salesStats.salesByBikeType.reduce((sum, item) => sum + item.revenue, 0))}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default StatisticsDashboard;