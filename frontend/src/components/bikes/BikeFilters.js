// frontend/src/components/bikes/BikeFilters.js
import React, { useState, useEffect, useCallback } from 'react';
import './BikeFilter.css';

function BikeFilters({ onFilterChange, bikeData }) {
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
  const handlePriceChange = (e, bound) => {
    const value = parseInt(e.target.value, 10);
    setPriceRange(prev => ({
      ...prev,
      [bound]: value
    }));
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setPriceRange(priceMinMax);
    setSelectedTypes([]);
    setSelectedGears([]);
    setSearchQuery('');
  };
  
  return (
    <div className="bike-filters card shadow-sm mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-funnel-fill me-2"></i>
          Filter Bikes
        </h5>
        <button 
          className="btn btn-sm"
          onClick={() => setExpanded(!expanded)}
          type="button"
        >
          <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`}></i>
        </button>
      </div>
      {expanded && (
        <div className="card-body">
          <div className="row">
            {/* Search by name */}
            <div className="col-md-12 mb-3">
              <label className="form-label">Search by Name</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search bikes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Price range filter */}
            <div className="col-md-12 mb-3">
              <label className="form-label">Price Range: ${priceRange.min} - ${priceRange.max}</label>
              <div className="d-flex gap-2 align-items-center">
                <input
                  type="range"
                  className="form-range"
                  min={priceMinMax.min}
                  max={priceMinMax.max}
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange(e, 'min')}
                />
                <span className="price-value">${priceRange.min}</span>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <input
                  type="range"
                  className="form-range"
                  min={priceMinMax.min}
                  max={priceMinMax.max}
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange(e, 'max')}
                />
                <span className="price-value">${priceRange.max}</span>
              </div>
            </div>
            
            {/* Bike type filter */}
            {availableTypes.length > 0 && (
              <div className="col-12 mb-3">
                <label className="form-label">Bike Type</label>
                <div className="bike-type-filters">
                  {availableTypes.map(type => (
                    <div className="form-check" key={type}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`type-${type.replace(/\s+/g, '-').toLowerCase()}`}
                        checked={selectedTypes.includes(type)}
                        onChange={() => handleTypeChange(type)}
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor={`type-${type.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Gears filter */}
            {availableGears.length > 0 && (
              <div className="col-12 mb-3">
                <label className="form-label">Gears</label>
                <div className="gear-filters">
                  {availableGears.map(gear => (
                    <div className="form-check" key={gear}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`gear-${gear.replace(/\s+/g, '-').toLowerCase()}`}
                        checked={selectedGears.includes(gear)}
                        onChange={() => handleGearChange(gear)}
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor={`gear-${gear.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {gear}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reset filters button */}
            <div className="col-12 mt-2">
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={handleResetFilters}
                type="button"
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BikeFilters;