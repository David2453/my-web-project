import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'
import ResponsiveVideo from './ResponsiveVideo';

function Home() {
  // Sample featured bikes (in a real app, these would come from your backend)
  const featuredBikes = [
    {
      id: 1,
      name: 'Mountain Explorer',
      type: 'Mountain Bike',
      price: 89.99,
      rentalPrice: 15.99,
      image: 'https://www.paulscycles.co.uk/images/altitude-c70-red-carbon.jpg?width=1998&height=1998&quality=85&mode=pad&format=webp&bgcolor=ffffff'
    },
    {
      id: 2,
      name: 'City Cruiser',
      type: 'Urban Bike',
      price: 69.99,
      rentalPrice: 12.99,
      image: 'https://images.ctfassets.net/ogr4ifihl2yh/3gvlDBzj1UgLVNH2vAhFEF/5a1585c9a1463d431d7cce957ba7c984/Profile_-_Around_the_Block_Women-s_26__Single_Speed_-_Mint_Green_-_630042_NEW.png?w=1000&q=85'
    },
    {
      id: 3,
      name: 'Road Master',
      type: 'Road Bike',
      price: 119.99,
      rentalPrice: 18.99,
      image: 'https://www.certini.co.uk/images/products/s/sp/specialized-allez-e5-disc-road-b-2.jpg?width=1998&height=1998&quality=85&mode=pad&format=webp&bgcolor=ffffff'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <ResponsiveVideo/>
        
      </div>

      {/* Featured Bikes Section */}
      <div className="featured-section">
        <div className="container">
          <h2 className="section-title" style={{color:'#2cd144'}} >Featured Bikes</h2>
          <div className="row">
            {featuredBikes.map(bike => (
              <div className="col-md-4 mb-4" key={bike.id}>
               <div className="card bike-card h-100">
                  <img src={bike.image} className="card-img-top bike-img" alt={bike.name} />
                  <div className="card-body">
                    <h2 style={{fontSize:24,color:'white' }}>{bike.type}</h2>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <p className="mb-0 bike-price"><strong>Buy:</strong> ${bike.price}</p>
                        <p className="mb-0 bike-price"><strong>Rent:</strong> ${bike.rentalPrice}/day</p>
                      </div>
                      <Link to={`/bikes/${bike.id}`} className="btn btn-sm btn-primary">View Details</Link>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <Link to={`/shop?type=${encodeURIComponent(bike.type)}`} className="btn btn-success" style={{width: '48%'}}>
                        Buy
                      </Link>
                      <Link to={`/rentals?type=${encodeURIComponent(bike.type)}`} className="btn btn-info" style={{width: '48%', color: 'white'}}>
                        Rent
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <Link to="/bikes" className="btn btn-outline-primary view-all-btn">View All Bikes</Link>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="services-section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card service-card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="bi bi-bicycle service-icon"></i>
                  </div>
                  <h5 className="card-title service-title">Bike Rentals</h5>
                  <p className="card-text">Rent a bike for hours, days, or weeks. Perfect for tourists and casual riders.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card service-card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="bi bi-shop service-icon"></i>
                  </div>
                  <h5 className="card-title service-title">Bike Sales</h5>
                  <p className="card-text">Browse our collection of high-quality bikes for sale at competitive prices.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card service-card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="bi bi-tools service-icon"></i>
                  </div>
                  <h5 className="card-title service-title">Maintenance</h5>
                  <p className="card-text">Professional bike maintenance and repair services to keep your rides smooth.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="card cta-card">
                <div className="card-body p-5 text-center">
                  <h3 className="cta-title">Ready to start your adventure?</h3>
                  <p className="lead">Create an account to rent or purchase your perfect bike today.</p>
                  <div className="d-flex justify-content-center gap-3">
                    <Link to="/register" className="btn btn-light cta-btn mt-3">Sign Up Now</Link>
                    <Link to="/login" className="btn btn-light cta-btn mt-3">Log In</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;