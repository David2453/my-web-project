// frontend/src/components/pages/BikeRoutes.js
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  DirectionsBike as BikeIcon,
  Place as PlaceIcon,
  Timer as TimerIcon,
  Terrain as TerrainIcon
} from '@mui/icons-material';

function BikeRoutes() {
  const [searchParams] = useSearchParams();
  const locationParam = searchParams.get('location');
  
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(locationParam || '');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get('/api/locations');
        setLocations(res.data);
        
        if (!selectedLocation && res.data.length > 0) {
          setSelectedLocation(locationParam || res.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to load locations');
      }
    };

    fetchLocations();
  }, [locationParam, selectedLocation]);

  // Fetch routes based on selected location
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!selectedLocation) return;
      
      setLoading(true);
      try {
        const res = await axios.get(`/api/routes/location/${selectedLocation}`);
        setRoutes(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching routes:', err);
        setError('Failed to load bike routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [selectedLocation]);

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box textAlign="center" mb={5}>
        <Typography variant="h1" fontSize={60}>
          Bike Routes
        </Typography>
        <Typography variant="h2" fontSize={30}>
          Discover amazing cycling trails around our rental locations
        </Typography>
      </Box>

      {/* Location selector */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="location-select-label">Select Location</InputLabel>
          <Select
            labelId="location-select-label"
            id="location-select"
            value={selectedLocation}
            label="Select Location"
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            {locations.map((location) => (
              <MenuItem key={location._id} value={location._id}>
                {location.name}, {location.city}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Error handling */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : routes.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No bike routes found for this location.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {routes.map((route) => (
            <Grid item xs={12} md={6} key={route._id}>
              <Card 
                elevation={3} 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2
                }}
              >
                <CardMedia
                  component="img"
                  height={240}
                  image={route.images[0] || "/images/default-route.jpg"}
                  alt={route.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {route.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      icon={<PlaceIcon />} 
                      label={route.location.name} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    <Chip 
                      icon={<BikeIcon />} 
                      label={`${route.distance} km`} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      icon={<TimerIcon />} 
                      label={`${route.estimatedTime} min`} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      icon={<TerrainIcon />} 
                      label={route.difficulty.charAt(0).toUpperCase() + route.difficulty.slice(1)} 
                      size="small" 
                      color={getDifficultyColor(route.difficulty)} 
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {route.description.length > 150 ? 
                      `${route.description.substring(0, 150)}...` : 
                      route.description}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="contained" 
                      component={Link} 
                      to={`/routes/${route._id}`}
                      fullWidth
                    >
                      View Route Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default BikeRoutes;