// frontend/src/components/pages/Shop.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { style } from '@mui/system';
import { green } from '@mui/material/colors';

function Shop() {
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get type filter from URL if it exists
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const typeFilter = params.get('type');
  
  useEffect(() => {
    const fetchBikes = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/bikes/purchase');
        setBikes(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to load bikes. Please try again later.');
        console.error('Error fetching bikes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBikes();
  }, []);
  
  // Filter bikes based on type parameter
  useEffect(() => {
    if (bikes.length > 0) {
      if (typeFilter) {
        const filtered = bikes.filter(bike => 
          bike.type.toLowerCase() === typeFilter.toLowerCase()
        );
        setFilteredBikes(filtered);
      } else {
        setFilteredBikes(bikes);
      }
    }
  }, [bikes, typeFilter]);

  // Rest of your component remains the same...


  return (
    <div className="container py-5">
      <h1 className="mb-4 text-center">Bike Shop</h1>
      {/* <p></p> */}
      <h2>Browse our selection of high-quality bikes available for purchase</h2>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {bikes.map(bike => (
            <div className="col-md-4 mb-4" key={bike.id}>
              
              <div className="card h-100 shadow-sm">
                
                <img 
                  src={bike.image} 
                  className="card-img-top" 
                  alt={bike.name} 
                  style={{ height: "290px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h2 style={{fontSize:20,color:'#9bff9e'}} className="card-title">{bike.name}</h2>
                  <p className="card-text text-muted">{bike.type}</p>
                  <p className="card-text">{bike.description}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="fs-5 mb-0"><strong>${bike.price}</strong></p>
                    <Link to={`/bikes/${bike._id}`} className="btn btn-primary">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Shop;