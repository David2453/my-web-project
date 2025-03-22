// frontend/src/components/pages/Bikes.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ModeSelector from '../bikes/ModeSelector';
import LocationSelector from '../bikes/LocationSelector';
import BikeFilters from '../bikes/BikeFilters';
import './Bikes.css';

function Bikes() {
  const [mode, setMode] = useState('purchase'); // 'purchase' or 'rental'
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState(null);

  // Fetch locations for rental mode - using useCallback to prevent unnecessary re-renders
  const fetchLocations = useCallback(async () => {
    try {
      const res = await axios.get('/api/locations');
      setLocations(res.data);
      if (res.data.length > 0) {
        setSelectedLocation(res.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
    
    // Cleanup function to prevent memory leaks
    return () => {
      // Cancel any pending requests if component unmounts
      const source = axios.CancelToken.source();
      source.cancel('Component unmounted');
    };
  }, [fetchLocations]);

  // Fetch bikes based on mode and location - using useCallback to prevent unnecessary re-renders
  const fetchBikes = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (mode === 'purchase') {
        res = await axios.get('/api/bikes/purchase');
      } else {
        if (!selectedLocation) return;
        res = await axios.get(`/api/bikes/rental/${selectedLocation}`);
      }
      
      setBikes(res.data);
      setFilteredBikes(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load bikes. Please try again later.');
      console.error('Error fetching bikes:', err);
    } finally {
      setLoading(false);
    }
  }, [mode, selectedLocation]);

  useEffect(() => {
    fetchBikes();
    
    // Cleanup function to prevent memory leaks
    return () => {
      // Cancel any pending requests if component unmounts
      const source = axios.CancelToken.source();
      source.cancel('Component unmounted');
    };
  }, [fetchBikes]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((filters) => {
    setActiveFilters(filters);
    
    if (!bikes || bikes.length === 0) return;
    
    const { priceRange, selectedTypes, searchQuery, selectedGears } = filters;
    
    // Filter the bikes based on the criteria
    const filtered = bikes.filter(bike => {
      // Get the price based on mode
      const price = mode === 'purchase' ? bike.price : bike.rentalPrice;
      
      // Price range filter
      if (price < priceRange.min || price > priceRange.max) return false;
      
      // Bike type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(bike.type)) return false;
      
      // Search by name filter
      if (searchQuery && !bike.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Gears filter
      if (selectedGears.length > 0) {
        // Check if any of the bike features match the selected gears
        if (!bike.features) return false;
        
        const hasSelectedGear = bike.features.some(feature => {
          return selectedGears.some(gear => {
            // Check if feature contains the gear (e.g., "21-speed Shimano gears" contains "21-speed")
            const gearNumber = gear.replace('-speed', '');
            return feature.toLowerCase().includes(`${gearNumber} speed`) || 
                   feature.toLowerCase().includes(`${gearNumber}-speed`);
          });
        });
        
        if (!hasSelectedGear) return false;
      }
      
      return true;
    });
    
    setFilteredBikes(filtered);
  }, [bikes, mode]);

  return (
    <div className="container py-5">
      <h1 className="mb-4 text-center">Our Bicycles</h1>
      <p className="lead text-center mb-5">
        Browse our selection of high-quality bikes available for purchase or rental
      </p>

      <div className="row">
        {/* Filters Panel (Left Side) */}
        <div className="col-lg-3">
          {/* Mode Selector */}
          <div className="mb-4">
            <ModeSelector mode={mode} setMode={setMode} />
          </div>

          {/* Location Selector (only show in rental mode) */}
          {mode === 'rental' && (
            <div className="mb-4">
              <LocationSelector 
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                locations={locations}
              />
            </div>
          )}

          {/* Bike Filters */}
          {!loading && bikes.length > 0 && (
            <BikeFilters onFilterChange={handleFilterChange} bikeData={bikes} />
          )}
        </div>

        {/* Bikes Display (Right Side) */}
        <div className="col-lg-9">
          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Loading Spinner */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : bikes.length === 0 ? (
            <div className="alert alert-info text-center">
              {mode === 'purchase' 
                ? 'No bikes available for purchase at this time.' 
                : 'No bikes available for rental at this location.'}
            </div>
          ) : filteredBikes.length === 0 ? (
            <div className="alert alert-warning text-center">
              <i className="bi bi-emoji-frown fs-4 d-block mb-3"></i>
              <h5>No bikes match your filters</h5>
              <p>Try adjusting your filter criteria to see more bikes.</p>
            </div>
          ) : (
            <div>
              {/* Results count */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <p className="mb-0">
                  <span className="fw-medium">{filteredBikes.length}</span> {filteredBikes.length === 1 ? 'bike' : 'bikes'} found
                  {activeFilters && (
                    <span className="text-muted ms-2">
                      (Filtered from {bikes.length})
                    </span>
                  )}
                </p>
                <div className="btn-group">
                  <button className="btn btn-sm btn-outline-primary active">
                    <i className="bi bi-grid-3x3-gap"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-primary">
                    <i className="bi bi-list"></i>
                  </button>
                </div>
              </div>

              {/* Bikes grid */}
              <div className="row">
                {filteredBikes.map(bike => (
                  <div className="col-md-6 col-lg-4 mb-4" key={bike._id}>
                    <div className="card h-100 shadow-sm">
                      <div className="position-relative">
                        <img 
                          src={bike.image} 
                          className="card-img-top" 
                          alt={bike.name}
                          style={{ height: "240px", objectFit: "cover" }}
                        />
                        <span className="position-absolute top-0 start-0 badge rounded-pill bg-dark m-2">
                          {bike.type}
                        </span>
                      </div>
                      <div className="card-body">
                        <h5 className="card-title">{bike.name}</h5>
                        <p className="card-text description">
                          {bike.description.length > 100 
                            ? `${bike.description.substring(0, 100)}...` 
                            : bike.description}
                        </p>
                        
                        {/* Bike features (focusing on gears) */}
                        {bike.features && bike.features.length > 0 && (
                          <div className="mb-3">
                            <div className="bike-features">
                              {bike.features
                                .filter(feature => /speed|gear/i.test(feature))
                                .map((feature, index) => (
                                  <span key={index} className="badge bg-light text-dark me-2 mb-1">
                                    {feature}
                                  </span>
                                ))
                              }
                            </div>
                          </div>
                        )}
                        
                        <div className="d-flex justify-content-between align-items-center" >
                          {mode === 'purchase' ? (
                            <p className="fs-5 mb-0"><strong>${bike.price}</strong></p>
                          ) : (
                            <p className="fs-5 mb-0"><strong>${bike.rentalPrice}</strong> / day</p>
                          )}
                          
                        </div>
                        <Link 
                            to={`/bikes/${bike._id}${mode === 'rental' ? `?mode=rental&location=${selectedLocation}` : ''}`} 
                            className="btn btn-primary"
                          >
                            View Details
                          </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Bikes;