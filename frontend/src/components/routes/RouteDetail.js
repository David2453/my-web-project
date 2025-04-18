// frontend/src/components/routes/RouteDetail.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Card,
  CardMedia,
  CardActionArea,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
  Slide,
  useTheme,
  useMediaQuery,
  Fade,
  Collapse
} from '@mui/material';
import {
  DirectionsBike as BikeIcon,
  Place as PlaceIcon,
  Timer as TimerIcon,
  Terrain as TerrainIcon,
  Speed as SpeedIcon,
  Repeat as RepeatIcon,
  LocalOffer as TagIcon,
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Navigation as NavigationIcon,
  WbSunny as SunnyIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

// Fix Leaflet default icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Custom hook to locate current position on map
function LocationMarker() {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker 
      position={position}
      icon={new Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: markerShadow,
        shadowSize: [41, 41]
      })}
    >
      <Popup>You are here</Popup>
    </Marker>
  );
}

function RouteDetail() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [weather, setWeather] = useState(null);
  const [showWeather, setShowWeather] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [showWeatherDetails, setShowWeatherDetails] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [showDescription, setShowDescription] = useState(true);

  // Fix Leaflet icon issues
  useEffect(() => {
    delete Icon.Default.prototype._getIconUrl;
    Icon.Default.mergeOptions({
      iconUrl: markerIcon,
      iconRetinaUrl: markerIcon2x,
      shadowUrl: markerShadow
    });
  }, []);

  useEffect(() => {
    const fetchRouteDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/routes/${id}`);
        setRoute(res.data);
        
        // Simulate a 3-star rating - in a real app, this would come from user data
        setUserRating(3.5);
        
        // Simulate getting weather data
        const fakeWeather = {
          temp: Math.round(15 + Math.random() * 10),
          condition: ['Sunny', 'Partly Cloudy', 'Clear'][Math.floor(Math.random() * 3)],
          windSpeed: Math.round(5 + Math.random() * 15)
        };
        setWeather(fakeWeather);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching route details:', err);
        setError('Failed to load route details');
      } finally {
        setLoading(false);
      }
    };

    fetchRouteDetails();
  }, [id]);

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  // Handle image click
  const handleImageClick = (img) => {
    setSelectedImage(img);
    setOpenImageDialog(true);
  };

  // Handle favorite toggle
  const toggleFavorite = () => {
    setFavorite(!favorite);
    // In a real app, you would save this to the user's favorites
  };

  // Calculate estimated calories
  const calculateCalories = (distance, difficulty) => {
    const baseCals = 40; // Calories per km for average cyclist
    const difficultyMultiplier = 
      difficulty === 'beginner' ? 0.9 : 
      difficulty === 'intermediate' ? 1.1 : 
      1.3; // advanced
    
    return Math.round(distance * baseCals * difficultyMultiplier);
  };

  // Format to hours and minutes
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="80vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} thickness={4} color="primary" />
        <Typography variant="h6" color="text.secondary">
          Loading route details...
        </Typography>
      </Box>
    );
  }

  if (error || !route) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: theme.shadows[3] 
          }}
        >
          {error || "Route not found"}
        </Alert>
        <Button 
          variant="contained" 
          component={Link} 
          to="/routes"
          startIcon={<ArrowBackIcon />}
          sx={{ borderRadius: 28 }}
        >
          Back to Routes
        </Button>
      </Container>
    );
  }

  // Define route coordinates
  let routeCoordinates = [];
  if (route.coordinates && route.coordinates.length > 0) {
    routeCoordinates = route.coordinates.map(coord => [coord.lat, coord.lng]);
  }

  // Calculate calories
  const estimatedCalories = calculateCalories(route.distance, route.difficulty);

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link to="/" style={{ color: theme.palette.text.secondary, textDecoration: 'none' }}>
            Home
          </Link>
          <Link to="/routes" style={{ color: theme.palette.text.secondary, textDecoration: 'none' }}>
            Bike Routes
          </Link>
          <Typography color="text.primary">{route.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Left side - Route info */}
          <Grid item xs={12} md={8}>
            <Box sx={{ position: 'relative', mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                {route.name}
              </Typography>
              
              <Box position="absolute" top={0} right={0} display="flex" gap={1}>
                <Tooltip title="Share Route">
                  <IconButton 
                    color="primary" 
                    sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)' }}
                    onClick={() => {
                      // In a real app, you would implement sharing functionality
                      alert('Share functionality would be implemented here');
                    }}
                  >
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={favorite ? "Remove from Favorites" : "Add to Favorites"}>
                  <IconButton 
                    color={favorite ? "error" : "default"} 
                    sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)' }}
                    onClick={toggleFavorite}
                  >
                    {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Rating 
                value={userRating} 
                precision={0.5} 
                onChange={(event, newValue) => {
                  setUserRating(newValue);
                }}
                icon={<StarIcon fontSize="inherit" />}
              />
              <Typography variant="body2" color="#ffffff" sx={{ ml: 1,fontSize:17 }}>
                Based on 28 riders
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', mb: 3, flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                icon={<PlaceIcon />} 
                label={route.location.name} 
                color="primary" 
              />
              <Chip 
                icon={<BikeIcon />} s
                label={`${route.distance} km`} 
                color="primary" 
              />
              <Chip 
                icon={<TimerIcon />} 
                label={formatTime(route.estimatedTime)} 
                color="primary" 
              />
              <Chip 
                icon={<TerrainIcon />} 
                label={route.difficulty.charAt(0).toUpperCase() + route.difficulty.slice(1)} 
                color={getDifficultyColor(route.difficulty)} 
              />
              <Chip 
                icon={<RepeatIcon />} 
                label={route.routeType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                color="primary" 
              />
              <Tooltip title="View Weather Forecast">
                <Chip 
                  icon={<SunnyIcon />} 
                  label={`${weather?.temp}°C`}
                  color="info"
                />
              </Tooltip>
            </Box>

            {/* Weather info */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                mb: 3, 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                }
              }}
              onClick={() => setShowWeatherDetails(!showWeatherDetails)}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight="medium">
                  Wheather in {route.location.name}
                </Typography>
                <IconButton size="small">
                  <ExpandMoreIcon 
                    sx={{ 
                      transform: showWeatherDetails ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.3s ease-in-out'
                    }} 
                  />
                </IconButton>
              </Box>
              
              <Collapse in={showWeatherDetails}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={4} textAlign="center">
                    <SunnyIcon sx={{ fontSize: 40, color: '#f57c00' }} />
                    <Typography variant="body2" fontWeight="medium">
                      {weather?.condition}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} textAlign="center">
                    <Typography variant="h5" fontWeight="bold">
                      {weather?.temp}°C
                    </Typography>
                    <Typography variant="body2">Temperature</Typography>
                  </Grid>
                  <Grid item xs={4} textAlign="center">
                    <Typography variant="body1" fontWeight="medium">
                      {weather?.windSpeed} km/h
                    </Typography>
                    <Typography variant="body2">Wind</Typography>
                  </Grid>
                </Grid>
              </Collapse>
            </Paper>

            <Box 
              sx={{ 
                mb: 4,
                p: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(76, 175, 80, 0.2)'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2,
                  color: 'primary.main',
                  fontWeight: 600,
                  borderBottom: '2px solid',
                  borderColor: 'primary.light',
                  pb: 1
                }}
              >
                Route Description
              </Typography>
              <Typography 
                variant="body1" 
                paragraph 
                sx={{ 
                  lineHeight: 1.8,
                  color: '#2e2e2e',
                  fontSize: '1.05rem',
                  letterSpacing: 0.3,
                  textAlign: 'justify',
                  '& strong': { color: 'primary.dark', fontWeight: 600 },
                  '& em': { fontStyle: 'italic', color: 'text.secondary' }
                }}
              >
                {route.description}
              </Typography>
            </Box>

            {/* Route Map */}
            <Paper 
              elevation={4} 
              sx={{ 
                mb: 3, 
                overflow: 'hidden', 
                borderRadius: 2,
                position: 'relative'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10, 
                  zIndex: 1000,
                  display: 'flex',
                  gap: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  p: 1,
                  borderRadius: 2,
                  boxShadow: 1
                }}
              >
                <Tooltip title="Descarcă GPX">
                  <IconButton 
                    size="small"
                    onClick={() => {
                      // Implementare descărcare GPX
                      alert('Funcționalitatea de descărcare GPX va fi implementată aici');
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={showMap ? "Ascunde harta" : "Arată harta"}>
                  <IconButton 
                    size="small"
                    onClick={() => setShowMap(!showMap)}
                  >
                    {showMap ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            
              {showMap && routeCoordinates.length > 0 ? (
                <MapContainer 
                  center={routeCoordinates[0]} 
                  zoom={13} 
                  style={{ height: '400px', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Polyline 
                    positions={routeCoordinates}
                    color="#4CAF50"
                    weight={5}
                    smoothFactor={1}
                    dashArray="5, 10"
                    dashOffset="0"
                  />
                  <Marker position={routeCoordinates[0]}>
                    <Popup>
                      <b>Punct de start:</b> {route.name}
                    </Popup>
                  </Marker>
                  <Marker position={routeCoordinates[routeCoordinates.length - 1]}>
                    <Popup>
                      <b>Punct de final:</b> {route.name}
                    </Popup>
                  </Marker>
                  <LocationMarker />
                </MapContainer>
              ) : (
                <Box sx={{ 
                  height: 400, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'grey.200'
                }}>
                  <Typography variant="h6" color="text.secondary">
                    Harta este ascunsă
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Tags */}
            {route.tags && route.tags.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  Route Features
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {route.tags.map(tag => (
                    <Chip 
                      key={tag}
                      icon={<TagIcon />}
                      label={tag}
                      size="small"
                      color="primary"
                      sx={{ 
                        borderRadius: 3,
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 1,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Image gallery */}
            {route.images && route.images.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium" color="#ffffff">
                  Photo Gallery
                </Typography>
                <Card 
                  elevation={4} 
                  sx={{ 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    position: 'relative',
                    '&:hover': {
                      '& .MuiCardMedia-root': {
                        transform: 'scale(1.02)',
                        transition: 'transform 0.3s ease-in-out'
                      }
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height={400}
                    image={route.images[activeImage]}
                    alt={`Ruta ${route.name} - imagine ${activeImage + 1}`}
                    sx={{ 
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease-in-out'
                    }}
                  />
                  {route.images.length > 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 1,
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        p: 1,
                        borderRadius: 2
                      }}
                    >
                      {route.images.map((_, index) => (
                        <IconButton
                          key={index}
                          size="small"
                          onClick={() => setActiveImage(index)}
                          sx={{
                            p: 0.5,
                            bgcolor: activeImage === index ? 'primary.main' : 'rgba(255, 255, 255, 0.3)',
                            '&:hover': {
                              bgcolor: activeImage === index ? 'primary.dark' : 'rgba(255, 255, 255, 0.5)'
                            }
                          }}
                        >
                          <Box
                            component="img"
                            src={route.images[index]}
                            alt={`Miniatură ${index + 1}`}
                            sx={{
                              width: 40,
                              height: 40,
                              objectFit: 'cover',
                              borderRadius: 1
                            }}
                          />
                        </IconButton>
                      ))}
                    </Box>
                  )}
                </Card>
              </Box>
            )}
          </Grid>

          {/* Right side - Additional info */}
          <Grid item xs={12} md={4}>
            {/* Quick stats */}
            <Paper 
              elevation={3} 
              sx={{ 
                p: 0, 
                borderRadius: 2, 
                mb: 3, 
                overflow: 'hidden',
                background: 'linear-gradient(45deg, #4CAF50, #81C784)'
              }}
            >
              <Box sx={{ color: 'white', p: 2 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Route Overview
                </Typography>
              </Box>
              <Divider />
              <Grid container sx={{ textAlign: 'center', py: 2 }}>
                <Grid item xs={4} sx={{ borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                  <Typography variant="h5" fontWeight="bold" color="white">
                    {route.distance}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    kilometers
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                  <Typography variant="h5" fontWeight="bold" color="white">
                    {route.elevationGain}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    elevation (m)
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h5" fontWeight="bold" color="white">
                    {estimatedCalories}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    calories
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                mb: 3,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom 
                fontWeight="600"
                sx={{
                  color: 'primary.main',
                  borderBottom: '3px solid',
                  borderColor: 'primary.main',
                  pb: 1.5,
                  mb: 3
                }}
              >
                Detalii Traseu
              </Typography>
              <List sx={{ '& .MuiListItem-root': { py: 2.5 } }}>
                <ListItem 
                  sx={{ 
                    backgroundColor: 'rgba(76, 175, 80, 0.04)',
                    borderRadius: 2,
                    mb: 1.5
                  }}
                >
                  <ListItemIcon>
                    <BikeIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        fontWeight="600" 
                        sx={{ 
                          color: 'text.primary', 
                          fontSize: '1.1rem',
                          mb: 0.5
                        }}
                      >
                        Distance
                      </Typography>
                    } 
                    secondary={
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#2E7D32',
                          fontSize: '1.2rem',
                          fontWeight: 500
                        }}
                      >
                        {`${route.distance} kilometri`}
                      </Typography>
                    } 
                  />
                </ListItem>
                <ListItem 
                  sx={{ 
                    backgroundColor: 'rgba(76, 175, 80, 0.04)',
                    borderRadius: 2,
                    mb: 1.5
                  }}
                >
                  <ListItemIcon>
                    <TimerIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        fontWeight="600" 
                        sx={{ 
                          color: 'text.primary', 
                          fontSize: '1.1rem',
                          mb: 0.5
                        }}
                      >
                        Estimated Time
                      </Typography>
                    } 
                    secondary={
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#2E7D32',
                          fontSize: '1.2rem',
                          fontWeight: 500
                        }}
                      >
                        {formatTime(route.estimatedTime)}
                      </Typography>
                    } 
                  />
                </ListItem>
                <ListItem 
                  sx={{ 
                    backgroundColor: 'rgba(76, 175, 80, 0.04)',
                    borderRadius: 2,
                    mb: 1.5
                  }}
                >
                  <ListItemIcon>
                    <TerrainIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        fontWeight="600" 
                        sx={{ 
                          color: 'text.primary', 
                          fontSize: '1.1rem',
                          mb: 0.5
                        }}
                      >
                        Elevation Difference
                      </Typography>
                    } 
                    secondary={
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#2E7D32',
                          fontSize: '1.2rem',
                          fontWeight: 500
                        }}
                      >
                        {`${route.elevationGain} metri`}
                      </Typography>
                    } 
                  />
                </ListItem>
                <ListItem 
                  sx={{ 
                    backgroundColor: 'rgba(76, 175, 80, 0.04)',
                    borderRadius: 2,
                    mb: 1.5
                  }}
                >
                  <ListItemIcon>
                    <SpeedIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        fontWeight="600" 
                        sx={{ 
                          color: 'text.primary', 
                          fontSize: '1.1rem',
                          mb: 0.5
                        }}
                      >
                        Difficulty
                      </Typography>
                    } 
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Chip 
                          label={route.difficulty.charAt(0).toUpperCase() + route.difficulty.slice(1)} 
                          size="large"
                          color={getDifficultyColor(route.difficulty)}
                          sx={{ 
                            fontWeight: '600',
                            fontSize: '1rem',
                            py: 1
                          }}
                        />
                      </Box>
                    } 
                  />
                </ListItem>
                <ListItem 
                  sx={{ 
                    backgroundColor: 'rgba(76, 175, 80, 0.04)',
                    borderRadius: 2,
                    mb: 1.5
                  }}
                >
                  <ListItemIcon>
                    <RepeatIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        fontWeight="600" 
                        sx={{ 
                          color: 'text.primary', 
                          fontSize: '1.1rem',
                          mb: 0.5
                        }}
                      >
                        Route Type
                      </Typography>
                    } 
                    secondary={
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#2E7D32',
                          fontSize: '1.2rem',
                          fontWeight: 500
                        }}
                      >
                        {route.routeType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                    } 
                  />
                </ListItem>
              </List>
            </Paper>

            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                mb: 3, 
                borderLeft: `5px solid ${theme.palette.primary.main}`
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight="medium">
                Location
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PlaceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {route.location.name}, {route.location.city}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                This route starts at our rental location. Perfect for a day trip!
              </Typography>
              <Button 
                variant="contained" 
                component={Link}
                to={`/rentals?location=${route.location._id}`}
                fullWidth
                sx={{ 
                  borderRadius: 28,
                  py: 1.2,
                  fontWeight: 'bold',
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Rent Bikes at This Location
              </Button>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight="medium">
                Need a Bike?
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2, 
                bgcolor: 'rgba(76, 175, 80, 0.1)', 
                p: 1.5, 
                borderRadius: 1.5 
              }}>
                <BikeIcon color="primary" sx={{ mr: 1.5, fontSize: 30 }} />
                <Typography variant="body2">
                  <b>Recommendation:</b> For this route, we recommend a {route.difficulty === 'beginner' ? 'Hybrid or City' : route.difficulty === 'intermediate' ? 'Gravel or Fitness' : 'Mountain'} bike.
                </Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Don't have your own bike? No problem! Rent one from our location and enjoy this beautiful route.
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="contained" 
                    component={Link}
                    to="/bikes"
                    fullWidth
                    sx={{ mb: 1, borderRadius: 2 }}
                  >
                    Browse Bikes
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="outlined" 
                    component={Link}
                    to="/"
                    fullWidth
                    sx={{ mb: 1, borderRadius: 2 }}
                  >
                    View Rentals
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Image Dialog */}
        <Dialog
          open={openImageDialog}
          onClose={() => setOpenImageDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                }
              }}
              onClick={() => setOpenImageDialog(false)}
            >
              <CloseIcon />
            </IconButton>
            <img
              src={selectedImage}
              alt="Route view"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </Fade>
  );
}

export default RouteDetail;