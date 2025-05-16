// frontend/src/components/pages/Shop.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { style } from '@mui/system';
import { green } from '@mui/material/colors';
import { 
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';

function Shop() {
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
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

  // Calculate pagination
  const indexOfLastBike = page * itemsPerPage;
  const indexOfFirstBike = indexOfLastBike - itemsPerPage;
  const currentBikes = filteredBikes.slice(indexOfFirstBike, indexOfLastBike);
  const totalPages = Math.ceil(filteredBikes.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setPage(1); // Reset to first page when changing items per page
  };

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
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <span className="me-3">
                Showing {filteredBikes.length} {filteredBikes.length === 1 ? 'bike' : 'bikes'}
              </span>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Items per page</InputLabel>
                <Select
                  value={itemsPerPage}
                  label="Items per page"
                  onChange={handleItemsPerPageChange}
                >
                  <MenuItem value={12}>12</MenuItem>
                  <MenuItem value={24}>24</MenuItem>
                  <MenuItem value={48}>48</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="row">
            {currentBikes.map(bike => (
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

          {totalPages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </div>
  );
}

export default Shop;