// frontend/src/components/bikes/LocationSelectorMUI.js
import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Paper
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';

function LocationSelectorMUI({ selectedLocation, setSelectedLocation, locations }) {
  const handleChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  return (
    <Paper elevation={3} sx={{ mb: 3, p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium', mb: 1.5, display: 'flex', alignItems: 'center' }}>
        <LocationIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
        Select a Location for Rental
      </Typography>
      
      <FormControl fullWidth size="small">
        <InputLabel id="location-select-label">Location</InputLabel>
        <Select
          labelId="location-select-label"
          id="location-select"
          value={selectedLocation}
          label="Location"
          onChange={handleChange}
          sx={{ borderRadius: 1 }}
        >
          <MenuItem value="">
            <em>Select a city...</em>
          </MenuItem>
          {locations.map(location => (
            <MenuItem key={location.id || location._id} value={location.id || location._id}>
              {location.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>
  );
}

export default LocationSelectorMUI;