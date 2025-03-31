// frontend/src/components/admin/BikeForm.js
import React, { useState, useEffect } from 'react';
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
  InputAdornment
} from '@mui/material';

const BikeForm = ({ open, handleClose, bike, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    price: 0,
    rentalPrice: 0,
    image: '',
    features: [],
    purchaseStock: 0
  });
  
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    if (bike) {
      setFormData({
        name: bike.name || '',
        type: bike.type || '',
        description: bike.description || '',
        price: bike.price || 0,
        rentalPrice: bike.rentalPrice || 0,
        image: bike.image || '',
        features: bike.features || [],
        purchaseStock: bike.purchaseStock || 0
      });
    }
  }, [bike]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddFeature = () => {
    if (featureInput.trim() !== '') {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{bike ? 'Edit Bike' : 'Add New Bike'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="name"
              label="Bike Name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Bike Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Bike Type"
              >
                <MenuItem value="Mountain Bike">Mountain Bike</MenuItem>
                <MenuItem value="Road Bike">Road Bike</MenuItem>
                <MenuItem value="Urban Bike">Urban Bike</MenuItem>
                <MenuItem value="Hybrid Bike">Hybrid Bike</MenuItem>
                <MenuItem value="Electric Bike">Electric Bike</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="price"
              label="Purchase Price"
              type="number"
              fullWidth
              value={formData.price}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="rentalPrice"
              label="Rental Price (per day)"
              type="number"
              fullWidth
              value={formData.rentalPrice}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="image"
              label="Image URL"
              fullWidth
              value={formData.image}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="purchaseStock"
              label="Purchase Stock"
              type="number"
              fullWidth
              value={formData.purchaseStock}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Features</Typography>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <TextField
                label="Add Feature"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <Button 
                variant="contained" 
                onClick={handleAddFeature}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.features.map((feature, index) => (
                <Chip
                  key={index}
                  label={feature}
                  onDelete={() => handleRemoveFeature(index)}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {bike ? 'Update' : 'Add'} Bike
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BikeForm;