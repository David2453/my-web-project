// frontend/src/components/pages/Bikes.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ModeSelectorMUI from '../bikes/ModeSelectorMUI';
import LocationSelectorMUI from '../bikes/LocationSelectorMUI';
import BikeFiltersMUI from '../bikes/BikeFiltersMUI';

// Material UI imports
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  IconButton
} from '@mui/material';
import {
  DirectionsBike as BikeIcon,
  Warning as WarningIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon
} from '@mui/icons-material';

function Bikes() {
  const [mode, setMode] = useState('purchase'); // 'purchase' or 'rental'
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Fetch locations for rental mode - using useCallback to prevent unnecessary re-renders
  const fetchLocations = useCallback(async () => {
    try {
      const res = await axios.get('/api/locations');
      setLocations(res.data);
      if (res.data.length > 0) {
        setSelectedLocation(res.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
    
    // Cleanup function to prevent memory leaks
    return () => {
      // Cancel any pending requests if component unmounts
      const source = axios.CancelToken.source();
      source.cancel('Component unmounted');
    };
  }, [fetchLocations]);

  // Fetch bikes based on mode and location - using useCallback to prevent unnecessary re-renders
  const fetchBikes = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (mode === 'purchase') {
        res = await axios.get('/api/bikes/purchase');
      } else {
        if (!selectedLocation) return;
        res = await axios.get(`/api/bikes/rental/${selectedLocation}`);
      }
      
      setBikes(res.data);
      setFilteredBikes(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load bikes. Please try again later.');
      console.error('Error fetching bikes:', err);
    } finally {
      setLoading(false);
    }
  }, [mode, selectedLocation]);

  useEffect(() => {
    fetchBikes();
    
    // Cleanup function to prevent memory leaks
    return () => {
      // Cancel any pending requests if component unmounts
      const source = axios.CancelToken.source();
      source.cancel('Component unmounted');
    };
  }, [fetchBikes]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((filters) => {
    setActiveFilters(filters);
    
    if (!bikes || bikes.length === 0) return;
    
    const { priceRange, selectedTypes, searchQuery, selectedGears } = filters;
    
    // Filter the bikes based on the criteria
    const filtered = bikes.filter(bike => {
      // Get the price based on mode
      const price = mode === 'purchase' ? bike.price : bike.rentalPrice;
      
      // Price range filter
      if (price < priceRange.min || price > priceRange.max) return false;
      
      // Bike type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(bike.type)) return false;
      
      // Search by name filter
      if (searchQuery && !bike.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Gears filter
      if (selectedGears.length > 0) {
        // Check if any of the bike features match the selected gears
        if (!bike.features) return false;
        
        const hasSelectedGear = bike.features.some(feature => {
          return selectedGears.some(gear => {
            // Check if feature contains the gear (e.g., "21-speed Shimano gears" contains "21-speed")
            const gearNumber = gear.replace('-speed', '');
            return feature.toLowerCase().includes(`${gearNumber} speed`) || 
                   feature.toLowerCase().includes(`${gearNumber}-speed`);
          });
        });
        
        if (!hasSelectedGear) return false;
      }
      
      return true;
    });
    
    setFilteredBikes(filtered);
  }, [bikes, mode]);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box textAlign="center" mb={5}>
        <Typography variant="h1" fontSize={60} color='#4ce600'>
          Biciclete
        </Typography>
        <Typography variant="h2" fontSize={30} color='white' >
          {/* Browse our selection of high-quality bikes available for purchase or rental */}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Filters Panel (Left Side) */}
        <Grid item xs={12} md={3}>
          {/* Mode Selector */}
          <ModeSelectorMUI mode={mode} setMode={setMode} />

          {/* Location Selector (only show in rental mode) */}
          {mode === 'rental' && (
            <LocationSelectorMUI 
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              locations={locations}
            />
          )}

          {/* Bike Filters */}
          {!loading && bikes.length > 0 && (
            <BikeFiltersMUI onFilterChange={handleFilterChange} bikeData={bikes} />
          )}
        </Grid>

        {/* Bikes Display (Right Side) */}
        <Grid item xs={12} md={9}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} variant="filled">
              {error}
            </Alert>
          )}

          {/* Loading Spinner */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
              <CircularProgress size={60} thickness={4} />
            </Box>
          ) : bikes.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }} variant="filled">
              {mode === 'purchase' 
                ? 'No bikes available for purchase at this time.' 
                : 'No bikes available for rental at this location.'}
            </Alert>
          ) : filteredBikes.length === 0 ? (
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                backgroundColor: 'rgba(255, 152, 0, 0.08)',
                border: '1px solid rgba(255, 152, 0, 0.2)'
              }}
            >
              <WarningIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom fontWeight="medium">
                No bikes match your filters
              </Typography>
              <Typography variant="body1">
                Try adjusting your filter criteria to see more bikes.
              </Typography>
            </Paper>
          ) : (
            <Box>
              {/* Results count and view toggle */}
              <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">
                  <Box component="span" fontWeight="medium">{filteredBikes.length}</Box> {filteredBikes.length === 1 ? 'bike' : 'bikes'} found
                  {activeFilters && (
                    <Typography component="span" color="text.secondary" variant="body2" sx={{ ml: 1 }}>
                      (Filtered from {bikes.length})
                    </Typography>
                  )}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton 
                    size="small" 
                    color={viewMode === 'grid' ? 'primary' : 'default'}
                    onClick={() => setViewMode('grid')}
                  >
                    <GridViewIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color={viewMode === 'list' ? 'primary' : 'default'}
                    onClick={() => setViewMode('list')}
                  >
                    <ListViewIcon />
                  </IconButton>
                </Stack>
              </Paper>

              {/* Bikes grid */}
              <Grid container spacing={3}>
                {filteredBikes.map(bike => (
                  <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} key={bike._id}>
                    <Card 
                      elevation={3} 
                      sx={{ 
                        height: '100%', 
                        display: viewMode === 'list' ? 'flex' : 'block',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 8
                        }
                      }}
                    >
                      <CardMedia 
                        component="img" 
                        image={bike.image} 
                        alt={bike.name}
                        sx={{ 
                          height: viewMode === 'list' ? 200 : 240,
                          width: viewMode === 'list' ? 200 : '100%',
                          objectFit: "cover"
                        }}
                      />
                      <Box sx={{ position: 'relative' }}>
                        <CardContent sx={{ pb: 1 }}>
                          <Box position="absolute" top={viewMode === 'list' ? 0 : -36} left={viewMode === 'list' ? -64 : 8}>
                            <Chip 
                              label={bike.type} 
                              size="small" 
                              color="primary" 
                              variant="filled"
                              sx={{ fontWeight: 'medium' }}
                            />
                          </Box>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {bike.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: viewMode === 'grid' ? 60 : 'auto', overflow: 'hidden' }}>
                            {bike.description.length > (viewMode === 'grid' ? 100 : 200)
                              ? `${bike.description.substring(0, viewMode === 'grid' ? 100 : 200)}...` 
                              : bike.description}
                          </Typography>
                          
                          {/* Bike features (focusing on gears) */}
                          {bike.features && bike.features.length > 0 && (
                            <Box mb={2} display="flex" flexWrap="wrap" gap={0.8}>
                              {bike.features
                                .filter(feature => /speed|gear/i.test(feature))
                                .map((feature, index) => (
                                  <Chip 
                                    key={index} 
                                    label={feature} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                ))
                              }
                            </Box>
                          )}
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                            {mode === 'purchase' ? (
                              <Typography variant="h6" color="primary.main" fontWeight="bold">${bike.price}</Typography>
                            ) : (
                              <Typography variant="h6" color="primary.main" fontWeight="bold">
                                ${bike.rentalPrice}<Typography component="span" variant="body2">/day</Typography>
                              </Typography>
                            )}
                            
                            <Button 
                              variant="contained" 
                              color="primary"
                              component={Link}
                              to={`/bikes/${bike._id}${mode === 'rental' ? `?mode=rental&location=${selectedLocation}` : ''}`}
                              startIcon={<BikeIcon />}
                              size="small"
                            >
                              View Details
                            </Button>
                          </Box>
                        </CardContent>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default Bikes;