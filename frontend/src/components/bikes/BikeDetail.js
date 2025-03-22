// src/components/bikes/BikeDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

function BikeDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'purchase';
  const locationId = searchParams.get('location');
  
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load bike details from API
  useEffect(() => {
    const fetchBikeDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/bikes/${id}`);
        setBike(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching bike details:', err);
        setError('Failed to load bike details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBikeDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !bike) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          {error || "Bike not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        {/* Bike Image */}
        <div className="col-md-6 mb-4">
          <img 
            src={bike.image} 
            alt={bike.name} 
            className="img-fluid rounded shadow"
            style={{ maxHeight: '500px', width: '100%', objectFit: 'cover' }} 
          />
        </div>
        
        {/* Bike Details */}
        <div className="col-md-6">
          <h2 className="mb-3">{bike.name}</h2>
          <p className="text-muted mb-3">{bike.type}</p>
          
          <p className="mb-4">{bike.description}</p>
          
          {/* Features List */}
          {bike.features && bike.features.length > 0 && (
            <div className="mb-4">
              <h5>Features:</h5>
              <ul className="list-group list-group-flush">
                {bike.features.map((feature, index) => (
                  <li className="list-group-item bg-transparent" key={index}>
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Price Information */}
          <div className="mb-4">
            {mode === 'purchase' ? (
              <>
                <h4 className="mb-3">Price: ${bike.price}</h4>
                <button className="btn btn-success btn-lg">
                  Add to Cart
                </button>
              </>
            ) : (
              <>
                <h4 className="mb-3">Rental Price: ${bike.rentalPrice}/day</h4>
                
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="startDate" className="form-label">Start Date</label>
                    <input 
                      type="date" 
                      id="startDate" 
                      className="form-control"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="endDate" className="form-label">End Date</label>
                    <input 
                      type="date" 
                      id="endDate" 
                      className="form-control"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <button className="btn btn-success btn-lg">
                  Book Now
                </button>
              </>
            )}
          </div>
          
          {/* Mode Switching Links */}
          <div className="mt-4">
            {mode === 'purchase' ? (
              <p>
                Looking to rent instead? <Link to={`/bikes/${id}?mode=rental`}>Switch to rental mode</Link>
              </p>
            ) : (
              <p>
                Looking to buy instead? <Link to={`/bikes/${id}?mode=purchase`}>Switch to purchase mode</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BikeDetail; 