// frontend/src/components/admin/RouteForm.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  Slider,
  Paper,
  Alert
} from '@mui/material';
import {
  PhotoCamera,
  Delete,
  Add as AddIcon,
  Place as PlaceIcon,
  DirectionsBike as BikeIcon,
  Timer as TimerIcon,
  Terrain as TerrainIcon,
  Speed as SpeedIcon,
  Repeat as RepeatIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corectăm iconițele pentru markeri
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component pentru selectarea coordonatelor pe hartă
const CoordinateSelector = ({ coordinates, setCoordinates }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setCoordinates([...coordinates, { lat, lng }]);
    }
  });
  return null;
};

const RouteForm = ({ open, handleClose, route, locations, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    distance: '',
    difficulty: 'beginner',
    estimatedTime: '',
    routeType: 'loop',
    coordinates: [],
    elevationGain: '',
    images: [],
    tags: []
  });
  const [error, setError] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [newImage, setNewImage] = useState('');
  const [mapCenter, setMapCenter] = useState([45.75, 21.22]); // Default center (you can adjust this)
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (route) {
      setFormData({
        name: route.name || '',
        description: route.description || '',
        location: route.location?._id || '',
        distance: route.distance || '',
        difficulty: route.difficulty || 'beginner',
        estimatedTime: route.estimatedTime || '',
        routeType: route.routeType || 'loop',
        coordinates: route.coordinates || [],
        elevationGain: route.elevationGain || '',
        images: route.images || [],
        tags: route.tags || []
      });
      
      // Center map on first coordinate if available
      if (route.coordinates && route.coordinates.length > 0) {
        setMapCenter([route.coordinates[0].lat, route.coordinates[0].lng]);
      }
    } else {
      setFormData({
        name: '',
        description: '',
        location: '',
        distance: '',
        difficulty: 'beginner',
        estimatedTime: '',
        routeType: 'loop',
        coordinates: [],
        elevationGain: '',
        images: [],
        tags: []
      });
    }
  }, [route]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddImage = () => {
    if (newImage.trim() && !formData.images.includes(newImage.trim())) {
      setFormData({
        ...formData,
        images: [...formData.images, newImage.trim()]
      });
      setNewImage('');
    }
  };

  const handleRemoveImage = (imageToRemove) => {
    setFormData({
      ...formData,
      images: formData.images.filter(image => image !== imageToRemove)
    });
  };

  const handleClearCoordinates = () => {
    setFormData({
      ...formData,
      coordinates: []
    });
  };

  const handleRemoveLastPoint = () => {
    if (formData.coordinates.length > 0) {
      setFormData({
        ...formData,
        coordinates: formData.coordinates.slice(0, -1)
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.location || 
        !formData.distance || !formData.estimatedTime) {
      setError('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  // Calculate distance based on coordinates
  const calculateDistance = (coords) => {
    if (coords.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = [coords[i].lat, coords[i].lng];
      const p2 = [coords[i + 1].lat, coords[i + 1].lng];
      totalDistance += calculateHaversineDistance(p1, p2);
    }
    
    return Math.round(totalDistance * 10) / 10; // Round to 1 decimal place
  };

  // Haversine formula to calculate distance between two points
  const calculateHaversineDistance = (p1, p2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (p2[0] - p1[0]) * Math.PI / 180;
    const dLon = (p2[1] - p1[1]) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Update distance when coordinates change
  useEffect(() => {
    if (formData.coordinates.length >= 2) {
      const calculatedDistance = calculateDistance(formData.coordinates);
      setFormData(prev => ({
        ...prev,
        distance: calculatedDistance.toString()
      }));
    }
  }, [formData.coordinates]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
      scroll="paper"
    >
      <DialogTitle>{route ? 'Edit Bike Route' : 'Add New Bike Route'}</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <TextField
              name="name"
              label="Route Name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Location</InputLabel>
              <Select
                name="location"
                value={formData.location}
                onChange={handleChange}
                label="Location"
              >
                {locations && locations.map(location => (
                  <MenuItem key={location._id} value={location._id}>
                    {location.name}, {location.city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Route Details</Typography>
            <TextField
              name="distance"
              label="Distance (km)"
              type="number"
              fullWidth
              value={formData.distance}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                readOnly: formData.coordinates.length >= 2,
              }}
              helperText={formData.coordinates.length >= 2 ? "Distance is calculated automatically from route points" : ""}
            />
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Difficulty</InputLabel>
              <Select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                label="Difficulty"
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              name="estimatedTime"
              label="Estimated Time (minutes)"
              type="number"
              fullWidth
              value={formData.estimatedTime}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Route Type</InputLabel>
              <Select
                name="routeType"
                value={formData.routeType}
                onChange={handleChange}
                label="Route Type"
              >
                <MenuItem value="loop">Loop</MenuItem>
                <MenuItem value="out-and-back">Out and Back</MenuItem>
                <MenuItem value="point-to-point">Point to Point</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              name="elevationGain"
              label="Elevation Gain (meters)"
              type="number"
              fullWidth
              value={formData.elevationGain}
              onChange={handleChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Route Map</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Click on the map to add points to your route. The distance will be calculated automatically.
            </Typography>
            
            <Box sx={{ height: 400, mb: 2, position: 'relative' }}>
              <MapContainer 
                center={mapCenter} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {formData.coordinates.length > 0 && (
                  <>
                    <Polyline 
                      positions={formData.coordinates.map(coord => [coord.lat, coord.lng])}
                      color="#4CAF50"
                      weight={3}
                    />
                    {formData.coordinates.map((coord, index) => (
                      <Marker 
                        key={index} 
                        position={[coord.lat, coord.lng]}
                      />
                    ))}
                  </>
                )}
                
                <CoordinateSelector 
                  coordinates={formData.coordinates}
                  setCoordinates={(newCoords) => setFormData({...formData, coordinates: newCoords})}
                />
              </MapContainer>

              <Box sx={{ 
                position: 'absolute', 
                top: 10, 
                right: 10, 
                zIndex: 1000,
                display: 'flex',
                gap: 1
              }}>
                <Button 
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={handleClearCoordinates}
                  disabled={formData.coordinates.length === 0}
                >
                  Clear All Points
                </Button>
                <Button 
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={handleRemoveLastPoint}
                  disabled={formData.coordinates.length === 0}
                >
                  Remove Last Point
                </Button>
              </Box>
            </Box>

            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1">
                    <BikeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Distance: {formData.distance} km
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1">
                    <PlaceIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Points: {formData.coordinates.length}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1">
                    <TimerIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Est. Time: {formData.estimatedTime} minutes
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Tags</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="Add Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Images</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="Image URL"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleAddImage}
                disabled={!newImage.trim()}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.images.map((image) => (
                <Chip
                  key={image}
                  label={image}
                  onDelete={() => handleRemoveImage(image)}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {route ? 'Update Route' : 'Add Route'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RouteForm;