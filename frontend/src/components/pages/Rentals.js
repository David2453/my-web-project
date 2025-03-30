// frontend/src/components/pages/Rentals.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Rentals() {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locations, setLocations] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get type filter from URL if it exists
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const typeFilter = params.get('type');

  // Fetch locations
useEffect(() => {
  const fetchLocations = async () => {
    try {
      const res = await axios.get('/api/locations');
      // Map the response to include codes for the select dropdown
      const locationsWithCodes = res.data.map(location => ({
        id: location.code, // Use the code field
        name: location.name
      }));
      setLocations(locationsWithCodes);
      if (locationsWithCodes.length > 0) {
        setSelectedLocation(locationsWithCodes[0].id);
      }
    } catch (err) {
      setError('Failed to load locations. Please try again later.');
      console.error('Error fetching locations:', err);
    }
  };
  

  fetchLocations();
}, []);

// Add this useEffect after your existing one
useEffect(() => {
  const fetchBikes = async () => {
    if (!selectedLocation) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`/api/bikes/rental/${selectedLocation}`);
      setBikes(res.data);
      setFilteredBikes(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load bikes. Please try again later.');
      console.error('Error fetching bikes:', err);
      setBikes([]);
      setFilteredBikes([]);
    } finally {
      setLoading(false);
    }
  };

  fetchBikes();
}, [selectedLocation]);

  // Rest of your component remains the same..

  return (
    <div className="container py-5" >
      <h1 className="mb-4 text-center">Bike Rentals</h1>
      <p></p>
      <h2 className="lead text-center mb-5">
        Rent a bike and explore your favorite city on two wheels
      </h2>
      
      <div className="row justify-content-center mb-5">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Select a Location</h5>
              <select 
                className="form-select form-select-lg"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">Choose a city...</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {!selectedLocation ? (
        <div className="alert alert-info text-center">
          Please select a location to see available rental bikes.
        </div>
      ) : loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : bikes.length === 0 ? (
        <div className="alert alert-warning text-center">
          No bikes available for rent in this location.
        </div>
      ) : (
        <>
          <h2 className="mb-4">
            Available Bikes in {locations.find(loc => loc.id === selectedLocation)?.name}
          </h2>
          <div className="row">
            {bikes.map(bike => (
              <div className="col-md-4 mb-4" key={bike.id}>
                <div className="card h-100 shadow-sm">
                  <img 
                    src={bike.image} 
                    className="card-img-top" 
                    alt={bike.name}
                    style={{ height: "280px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h2 style={{fontSize:20}} >{bike.name}</h2>
                    <p className="card-text text-muted">{bike.type}</p>
                    <p className="card-text">{bike.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="fs-5 mb-0"><strong>${bike.rentalPrice}</strong> / day</p>
                      <Link to={`/bikes/${bike._id}?mode=rental&location=${selectedLocation}`} className="btn btn-primary">
                        Rent Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Rentals;