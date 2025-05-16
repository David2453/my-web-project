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
  InputAdornment,
  IconButton,
  Switch,
  FormControlLabel,
  FormGroup,
  Checkbox
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import axios from 'axios';

const BikeForm = ({ open, handleClose, bike, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    price: 0,
    rentalPrice: 0,
    image: '',
    features: [],
    purchaseStock: 0,
    isActive: true,
    availableForPurchase: true,
    availableForRental: false,
    selectedLocations: []
  });
  
  const [featureInput, setFeatureInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    // Încarcă locațiile disponibile
    const fetchLocations = async () => {
      try {
        const response = await axios.get('/api/locations');
        setLocations(response.data);
      } catch (error) {
        console.error('Eroare la încărcarea locațiilor:', error);
      }
    };

    fetchLocations();
  }, []);

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
        purchaseStock: bike.purchaseStock || 0,
        isActive: bike.isActive !== undefined ? bike.isActive : true,
        availableForPurchase: bike.purchaseStock > 0,
        availableForRental: bike.rentalInventory && bike.rentalInventory.length > 0,
        selectedLocations: bike.rentalInventory ? bike.rentalInventory.map(inv => ({
          location: inv.location,
          stock: inv.stock
        })) : []
      });
      
      if (bike.image) {
        setImagePreview(bike.image);
      }
    }
  }, [bike]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleLocationStockChange = (locationId, stock) => {
    setFormData(prev => ({
      ...prev,
      selectedLocations: prev.selectedLocations.map(loc => 
        loc.location === locationId ? { ...loc, stock: parseInt(stock) || 0 } : loc
      )
    }));
  };

  const handleLocationToggle = (locationId) => {
    setFormData(prev => {
      const locationExists = prev.selectedLocations.some(loc => loc.location === locationId);
      
      if (locationExists) {
        return {
          ...prev,
          selectedLocations: prev.selectedLocations.filter(loc => loc.location !== locationId)
        };
      } else {
        return {
          ...prev,
          selectedLocations: [...prev.selectedLocations, { location: locationId, stock: 0 }]
        };
      }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('Selected file:', file);
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        console.error('Invalid file type:', file.type);
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        console.error('File too large:', file.size);
        return;
      }

      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Image preview generated');
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        console.error('Error reading file:', reader.error);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    console.log('Removing image');
    setSelectedImage(null);
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
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

  const handleSubmit = async () => {
    try {
      const formDataToSubmit = new FormData();
      
      // Adăugăm toate câmpurile în FormData
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('type', formData.type);
      formDataToSubmit.append('description', formData.description);
      formDataToSubmit.append('price', formData.price);
      formDataToSubmit.append('rentalPrice', formData.rentalPrice);
      formDataToSubmit.append('features', JSON.stringify(formData.features));
      formDataToSubmit.append('purchaseStock', formData.purchaseStock);
      formDataToSubmit.append('isActive', formData.isActive);
      formDataToSubmit.append('rentalInventory', JSON.stringify(
        formData.availableForRental ? formData.selectedLocations : []
      ));
      
      // Adăugăm imaginea dacă există
      if (selectedImage) {
        formDataToSubmit.append('image', selectedImage);
      }
      
      onSubmit(formDataToSubmit);
      handleClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      keepMounted={false}
      disablePortal
      aria-labelledby="bike-form-dialog-title"
    >
      <DialogTitle id="bike-form-dialog-title">
        {bike ? 'Editare Bicicletă' : 'Adăugare Bicicletă Nouă'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="name"
              label="Nume Bicicletă"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Tip Bicicletă</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Tip Bicicletă"
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
              label="Descriere"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Disponibilitate
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.availableForPurchase}
                    onChange={handleAvailabilityChange}
                    name="availableForPurchase"
                  />
                }
                label="Disponibil pentru vânzare"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.availableForRental}
                    onChange={handleAvailabilityChange}
                    name="availableForRental"
                  />
                }
                label="Disponibil pentru închiriere"
              />
            </FormGroup>
          </Grid>

          {formData.availableForPurchase && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="price"
                  label="Preț Vânzare"
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
                  name="purchaseStock"
                  label="Stoc pentru Vânzare"
                  type="number"
                  fullWidth
                  value={formData.purchaseStock}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </>
          )}

          {formData.availableForRental && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="rentalPrice"
                  label="Preț Închiriere (pe zi)"
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
                <Typography variant="subtitle1" gutterBottom>
                  Locații și Stoc pentru Închiriere
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto', mt: 1 }}>
                  {locations.map((location) => {
                    const selectedLocation = formData.selectedLocations.find(
                      loc => loc.location === location._id
                    );
                    return (
                      <Box key={location._id} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!selectedLocation}
                              onChange={() => handleLocationToggle(location._id)}
                            />
                          }
                          label={location.name}
                        />
                        {selectedLocation && (
                          <TextField
                            type="number"
                            label="Stoc"
                            size="small"
                            value={selectedLocation.stock}
                            onChange={(e) => handleLocationStockChange(location._id, e.target.value)}
                            sx={{ width: 100, ml: 2 }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Imagine Bicicletă</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ mr: 2 }}
              >
                Încarcă Imagine
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                  aria-label="Încarcă imagine bicicletă"
                />
              </Button>
              {imagePreview && (
                <IconButton 
                  color="error" 
                  onClick={handleRemoveImage}
                  aria-label="Șterge imagine"
                >
                  <Delete />
                </IconButton>
              )}
            </Box>
            {imagePreview && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <img 
                  src={imagePreview} 
                  alt="Preview bicicletă" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '5px'
                  }} 
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  name="isActive"
                  color={formData.isActive ? "success" : "error"}
                />
              }
              label={
                <Typography color={formData.isActive ? "success.main" : "error.main"}>
                  {formData.isActive ? "Bicicletă Activă" : "Bicicletă Inactivă"}
                </Typography>
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Caracteristici</Typography>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <TextField
                label="Adaugă Caracteristică"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <Button 
                variant="contained" 
                onClick={handleAddFeature}
              >
                Adaugă
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
        <Button onClick={handleClose}>Anulare</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!formData.name || !formData.type || !formData.description}
        >
          {bike ? 'Actualizează' : 'Adaugă'} Bicicleta
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BikeForm;