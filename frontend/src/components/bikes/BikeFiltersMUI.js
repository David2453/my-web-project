// frontend/src/components/bikes/BikeFiltersMUI.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
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
  Chip,
  Badge,
  Tooltip,
  useTheme,
  alpha,
  Stack,
  Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterAlt as FilterIcon,
  RestartAlt as ResetIcon,
  AttachMoney as MoneyIcon,
  PedalBike as BikeIcon,
  Settings as GearIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

function BikeFiltersMUI({ onFilterChange, bikeData, mode = "buy" }) {
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

  // Count active filters
  const activeFilterCount = 
    (selectedTypes.length > 0 ? 1 : 0) + 
    (selectedGears.length > 0 ? 1 : 0) + 
    (searchQuery ? 1 : 0) + 
    ((priceRange.min !== priceMinMax.min || priceRange.max !== priceMinMax.max) ? 1 : 0);
  
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
      elevation={4}
      sx={{ 
        mb: 4, 
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          boxShadow: theme.shadows[6]
        }
      }}
    >
      {/* Filter Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          borderBottom: expanded ? `1px solid ${theme.palette.divider}` : 'none'
        }}
      >
        <Box display="flex" alignItems="center">
          <Badge
            badgeContent={activeFilterCount}
            color="primary"
            sx={{ mr: 1.5 }}
          >
            <FilterIcon color="primary" />
          </Badge>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textFillColor: 'transparent'
            }}
          >
            Filter Bikes
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {activeFilterCount > 0 && (
            <Tooltip title="Reset all filters">
              <IconButton 
                size="small" 
                onClick={handleResetFilters}
                sx={{ 
                  color: 'error.main',
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.2),
                  }
                }}
              >
                <ResetIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <IconButton
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
            size="small"
            sx={{ 
              color: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
              transition: 'transform 0.3s ease',
              transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)'
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Active Filters Pills */}
      {activeFilterCount > 0 && (
        <Collapse in={!expanded}>
          <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {searchQuery && (
              <Chip 
                icon={<SearchIcon fontSize="small" />}
                label={`"${searchQuery}"`}
                color="primary" 
                variant="outlined"
                size="small"
                onDelete={() => setSearchQuery('')}
              />
            )}
            
            {(priceRange.min !== priceMinMax.min || priceRange.max !== priceMinMax.max) && (
              <Chip 
                icon={<MoneyIcon fontSize="small" />}
                label={`$${priceRange.min} - $${priceRange.max}`}
                color="primary" 
                variant="outlined"
                size="small"
                onDelete={() => setPriceRange(priceMinMax)}
              />
            )}
            
            {selectedTypes.map(type => (
              <Chip 
                key={type}
                icon={<BikeIcon fontSize="small" />}
                label={type}
                color="primary" 
                variant="outlined"
                size="small"
                onDelete={() => handleTypeChange(type)}
              />
            ))}
            
            {selectedGears.map(gear => (
              <Chip 
                key={gear}
                icon={<GearIcon fontSize="small" />}
                label={gear}
                color="primary" 
                variant="outlined"
                size="small"
                onDelete={() => handleGearChange(gear)}
              />
            ))}
          </Box>
        </Collapse>
      )}
      
      {/* Filter Content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 3 }}>
          {/* Search by name */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <SearchIcon 
                fontSize="small" 
                sx={{ mr: 1, color: 'primary.main' }} 
              />
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 600 }}
              >
                Search by Name
              </Typography>
            </Box>
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
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                  }
                }
              }}
            />
          </Box>
          
          <Divider sx={{ my: 2.5, opacity: 0.7 }} />
          
          {/* Price range filter */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <MoneyIcon 
                fontSize="small" 
                sx={{ mr: 1, color: 'primary.main' }} 
              />
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 600 }}
              >
                Price Range
              </Typography>
            </Box>
            
            <Box sx={{ px: 1, mt: 2 }}>
              <Slider
                value={[priceRange.min, priceRange.max]}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                min={priceMinMax.min}
                max={priceMinMax.max}
                sx={{
                  '& .MuiSlider-thumb': {
                    height: 24,
                    width: 24,
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    '&:hover, &.Mui-active': {
                      boxShadow: '0 3px 12px rgba(0,0,0,0.2)',
                    },
                    '&::after': {
                      width: 12,
                      height: 12,
                      backgroundColor: 'primary.main',
                    },
                  },
                  '& .MuiSlider-rail': {
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                  '& .MuiSlider-track': {
                    height: 6,
                    borderRadius: 3,
                  },
                  '& .MuiSlider-valueLabel': {
                    backgroundColor: 'primary.main',
                    borderRadius: 1,
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  },
                }}
                valueLabelFormat={(value) => `$${value}`}
              />
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                mt: 1.5
              }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Min
                  </Typography>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main'
                    }}
                  >
                    ${priceRange.min}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Max
                  </Typography>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main'
                    }}
                  >
                    ${priceRange.max}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2.5, opacity: 0.7 }} />
          
          {/* Bike type filter */}
          {availableTypes.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <BikeIcon 
                  fontSize="small" 
                  sx={{ mr: 1, color: 'primary.main' }} 
                />
                <Typography 
                  variant="subtitle1" 
                  sx={{ fontWeight: 600 }}
                >
                  Bike Type
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {availableTypes.map(type => (
                  <Chip
                    key={type}
                    label={type}
                    clickable
                    color={selectedTypes.includes(type) ? "primary" : "default"}
                    variant={selectedTypes.includes(type) ? "filled" : "outlined"}
                    onClick={() => handleTypeChange(type)}
                    icon={selectedTypes.includes(type) ? <CheckCircleIcon fontSize="small" /> : <BikeIcon fontSize="small" />}
                    sx={{
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {availableTypes.length > 0 && availableGears.length > 0 && (
            <Divider sx={{ my: 2.5, opacity: 0.7 }} />
          )}
          
          {/* Gears filter */}
          {availableGears.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <GearIcon 
                  fontSize="small" 
                  sx={{ mr: 1, color: 'primary.main' }} 
                />
                <Typography 
                  variant="subtitle1" 
                  sx={{ fontWeight: 600 }}
                >
                  Gears
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {availableGears.map(gear => (
                  <Chip
                    key={gear}
                    label={gear}
                    clickable
                    color={selectedGears.includes(gear) ? "primary" : "default"}
                    variant={selectedGears.includes(gear) ? "filled" : "outlined"}
                    onClick={() => handleGearChange(gear)}
                    icon={selectedGears.includes(gear) ? <CheckCircleIcon fontSize="small" /> : <GearIcon fontSize="small" />}
                    sx={{
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {/* Reset filters button */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mt: 3
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<ResetIcon />}
              onClick={handleResetFilters}
              size="medium"
              sx={{ 
                borderRadius: 28,
                py: 1,
                px: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                transition: 'all 0.3s ease',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                }
              }}
            >
              Reset All Filters
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}

export default BikeFiltersMUI;