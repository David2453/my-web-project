// frontend/src/components/common/SearchBar.js
import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

/**
 * A reusable search component with filter options.
 * 
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text for the search field
 * @param {function} props.onSearch - Function called when search query changes
 * @param {function} props.onClear - Function called when search is cleared
 * @param {Array} props.filterOptions - Array of filter options
 * @param {function} props.onFilterChange - Function called when filters change
 * @param {string} props.value - Current search value
 */
const SearchBar = ({
  placeholder = "Search...",
  onSearch,
  onClear,
  filterOptions = [],
  onFilterChange,
  value = "",
}) => {
  const [searchQuery, setSearchQuery] = useState(value);
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onSearch(newValue, activeFilters);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch('', activeFilters);
    if (onClear) onClear();
  };

  const handleFilterToggle = (filter) => {
    let newFilters;
    if (activeFilters.includes(filter)) {
      newFilters = activeFilters.filter(f => f !== filter);
    } else {
      newFilters = [...activeFilters, filter];
    }
    
    setActiveFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
    onSearch(searchQuery, newFilters);
  };

  const toggleShowFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          placeholder={placeholder}
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {searchQuery && (
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                    aria-label="clear search"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
                {filterOptions.length > 0 && (
                  <Tooltip title="Show filters">
                    <IconButton 
                      size="small" 
                      onClick={toggleShowFilters}
                      edge="end"
                      aria-label="show filters"
                      color={showFilters ? "primary" : "default"}
                    >
                      <FilterIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {showFilters && filterOptions.length > 0 && (
        <Paper 
          variant="outlined" 
          sx={{ 
            mt: 1, 
            p: 1, 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1 
          }}
        >
          {filterOptions.map((filter) => (
            <Chip
              key={filter.value}
              label={filter.label}
              onClick={() => handleFilterToggle(filter.value)}
              color={activeFilters.includes(filter.value) ? "primary" : "default"}
              variant={activeFilters.includes(filter.value) ? "filled" : "outlined"}
              size="small"
            />
          ))}
        </Paper>
      )}

      {activeFilters.length > 0 && !showFilters && (
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {activeFilters.map((filter) => {
            const filterOption = filterOptions.find(f => f.value === filter);
            return (
              <Chip
                key={filter}
                label={filterOption ? filterOption.label : filter}
                onDelete={() => handleFilterToggle(filter)}
                color="primary"
                size="small"
                variant="outlined"
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;