// frontend/src/components/bikes/BikeFiltersMUI.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Slider,
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  TextField,
  Button,
  Divider,
  Collapse,
  IconButton,
  Paper,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterAlt as FilterIcon,
  RestartAlt as ResetIcon
} from '@mui/icons-material';

function BikeFiltersMUI({ onFilterChange, bikeData }) {
  const theme = useTheme();
  
  // Filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1500 });
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGears, setSelectedGears] = useState([]);
  const [expanded, setExpanded] = useState(true);
  
  // Extract available bike types and gears from data
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableGears, setAvailableGears] = useState([]);
  
  // Find min and max prices from available bikes
  const [priceMinMax, setPriceMinMax] = useState({ min: 0, max: 1500 });
  
  // Set up available filters from bike data
  useEffect(() => {
    let isMounted = true;
    
    if (bikeData && bikeData.length > 0 && isMounted) {
      // Extract unique bike types
      const types = [...new Set(bikeData.map(bike => bike.type))];
      setAvailableTypes(types);
      
      // Extract gear options from features (if available)
      const gearOptions = [];
      bikeData.forEach(bike => {
        if (bike.features) {
          bike.features.forEach(feature => {
            // Look for features that mention speed/gears
            if (/(\d+)[\s-]speed/i.test(feature)) {
              const match = feature.match(/(\d+)[\s-]speed/i);
              if (match && match[1]) {
                gearOptions.push(match[1] + '-speed');
              }
            }
          });
        }
      });
      
      if (isMounted) {
        setAvailableGears([...new Set(gearOptions)]);
      
        // Find min and max prices
        const prices = bikeData.map(bike => bike.price || bike.rentalPrice);
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));
        
        setPriceMinMax({ min: 0, max: maxPrice });
        setPriceRange({ min: minPrice, max: maxPrice });
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [bikeData]);
  
  // Apply filters when any filter changes
  const applyFilters = useCallback(() => {
    // Create filter object with current filter values
    const filters = {
      priceRange,
      selectedTypes,
      searchQuery,
      selectedGears
    };
    
    // Pass filters up to parent
    onFilterChange(filters);
  }, [priceRange, selectedTypes, searchQuery, selectedGears, onFilterChange]);
  
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);
  
  // Handle type filter change
  const handleTypeChange = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };
  
  // Handle gear filter change
  const handleGearChange = (gear) => {
    if (selectedGears.includes(gear)) {
      setSelectedGears(selectedGears.filter(g => g !== gear));
    } else {
      setSelectedGears([...selectedGears, gear]);
    }
  };
  
  // Handle price range change
  const handlePriceChange = (event, newValue) => {
    setPriceRange({
      min: newValue[0],
      max: newValue[1]
    });
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setPriceRange(priceMinMax);
    setSelectedTypes([]);
    setSelectedGears([]);
    setSearchQuery('');
  };
  
  return (
    <Paper 
      elevation={3}
      sx={{ 
        mb: 4, 
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        borderRadius: 2
      }}
    >
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Filter Bikes</Typography>
          </Box>
        }
        action={
          <IconButton
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      />
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Box sx={{ p: 1 }}>
            {/* Search by name */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
                Search by Name
              </Typography>
              <TextField
                fullWidth
                placeholder="Search bikes..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Price range filter */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
                Price Range
              </Typography>
              
              <Box sx={{ px: 1 }}>
                <Slider
                  value={[priceRange.min, priceRange.max]}
                  onChange={handlePriceChange}
                  valueLabelDisplay="auto"
                  min={priceMinMax.min}
                  max={priceMinMax.max}
                  sx={{
                    '& .MuiSlider-valueLabel': {
                      backgroundColor: 'primary.main',
                    },
                  }}
                  valueLabelFormat={(value) => `$${value}`}
                />
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mt: 1
                }}>
                  <Typography variant="body2" color="text.secondary">
                    ${priceRange.min}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${priceRange.max}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Bike type filter */}
            {availableTypes.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
                  Bike Type
                </Typography>
                <FormGroup>
                  {availableTypes.map(type => (
                    <FormControlLabel
                      key={type}
                      control={
                        <Checkbox
                          checked={selectedTypes.includes(type)}
                          onChange={() => handleTypeChange(type)}
                          size="small"
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2">{type}</Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </Box>
            )}
            
            {availableTypes.length > 0 && availableGears.length > 0 && (
              <Divider sx={{ my: 2 }} />
            )}
            
            {/* Gears filter */}
            {availableGears.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
                  Gears
                </Typography>
                <FormGroup>
                  {availableGears.map(gear => (
                    <FormControlLabel
                      key={gear}
                      control={
                        <Checkbox
                          checked={selectedGears.includes(gear)}
                          onChange={() => handleGearChange(gear)}
                          size="small"
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2">{gear}</Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            {/* Reset filters button */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ResetIcon />}
                onClick={handleResetFilters}
                size="medium"
                sx={{ borderRadius: 28 }}
              >
                Reset Filters
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Collapse>
    </Paper>
  );
}

export default BikeFiltersMUI;