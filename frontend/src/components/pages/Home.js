import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css'
import ResponsiveVideo from './ResponsiveVideo';
import axios from 'axios';
import { CircularProgress } from '@mui/material';

function Home() {
  const [featuredBikes, setFeaturedBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tipurile de biciclete pe care vrem să le afișăm
  const bikeTypes = ['Mountain Bike', 'Urban Bike', 'Road Bike'];

  // Date statice pentru biciclete, în caz că API-ul nu returnează rezultate
  const fallbackBikes = [
    {
      _id: '1',
      name: 'Mountain Explorer Pro',
      type: 'Mountain Bike',
      price: 899.99,
      rentalPrice: 15.99,
      rating: 4.8,
      image: 'https://www.paulscycles.co.uk/images/altitude-c70-red-carbon.jpg?width=1998&height=1998&quality=85&mode=pad&format=webp&bgcolor=ffffff'
    },
    {
      _id: '2',
      name: 'City Cruiser Deluxe',
      type: 'Urban Bike',
      price: 599.99,
      rentalPrice: 12.99,
      rating: 4.6,
      image: 'https://images.ctfassets.net/ogr4ifihl2yh/3gvlDBzj1UgLVNH2vAhFEF/5a1585c9a1463d431d7cce957ba7c984/Profile_-_Around_the_Block_Women-s_26__Single_Speed_-_Mint_Green_-_630042_NEW.png?w=1000&q=85'
    },
    {
      _id: '3',
      name: 'Road Master Elite',
      type: 'Road Bike',
      price: 1199.99,
      rentalPrice: 18.99,
      rating: 4.9,
      image: 'https://www.certini.co.uk/images/products/s/sp/specialized-allez-e5-disc-road-b-2.jpg?width=1998&height=1998&quality=85&mode=pad&format=webp&bgcolor=ffffff'
    }
  ];

  useEffect(() => {
    // Funcție pentru a obține cele mai bine cotate biciclete din fiecare categorie
    async function fetchFeaturedBikes() {
      setLoading(true);
      
      try {
        // Obținem toate bicicletele de la backend
        const response = await axios.get('/api/bikes');
        console.log('Biciclete primite de la API:', response.data);
        
        // Verificăm dacă am primit date
        if (response.data && response.data.length > 0) {
          // Vom crea un array pentru cele mai bine cotate biciclete din fiecare categorie
          const topBikesByType = [];
          
          // Pentru fiecare tip de bicicletă, găsim cea mai bine cotată
          for (const type of bikeTypes) {
            // Filtrăm bicicletele după tip
            const bikesOfType = response.data.filter(bike => bike.type === type);
            console.log(`Biciclete de tipul ${type}:`, bikesOfType);
            
            if (bikesOfType.length > 0) {
              // Sortăm bicicletele după rating (descrescător)
              const sortedBikes = [...bikesOfType].sort((a, b) => {
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                return ratingB - ratingA;
              });
              
              // Adăugăm cea mai bine cotată bicicletă în lista noastră
              topBikesByType.push(sortedBikes[0]);
            } else {
              // Dacă nu găsim nicio bicicletă de acest tip, folosim una din fallback
              const fallbackIndex = bikeTypes.indexOf(type);
              if (fallbackIndex >= 0 && fallbackIndex < fallbackBikes.length) {
                console.log(`Nu s-au găsit biciclete de tipul ${type}, folosim date statice.`);
                topBikesByType.push(fallbackBikes[fallbackIndex]);
              }
            }
          }
          
          // Dacă nu avem toate tipurile, completăm cu fallback-uri
          if (topBikesByType.length < bikeTypes.length) {
            const existingTypes = topBikesByType.map(bike => bike.type);
            for (const type of bikeTypes) {
              if (!existingTypes.includes(type)) {
                const fallbackIndex = bikeTypes.indexOf(type);
                topBikesByType.push(fallbackBikes[fallbackIndex]);
              }
            }
          }
          
          console.log('Biciclete selectate:', topBikesByType);
          setFeaturedBikes(topBikesByType);
        } else {
          // Dacă nu avem date de la server, folosim fallback
          console.log('Nu s-au primit date de la API, folosim fallback');
          setFeaturedBikes(fallbackBikes);
        }
      } catch (error) {
        console.error('Eroare la încărcarea bicicletelor:', error);
        setError('Nu am putut încărca bicicletele. Vă rugăm încercați din nou mai târziu.');
        // În caz de eroare, folosim datele statice
        setFeaturedBikes(fallbackBikes);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedBikes();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <ResponsiveVideo/>
      </div>

      {/* Featured Bikes Section */}
      <div className="featured-section">
        <div className="container">
          <h2 className="section-title" style={{color:'#2cd144'}} >Cele mai apreciate biciclete</h2>
          
          {loading ? (
            <div className="text-center my-5">
              <CircularProgress color="success" />
              <p className="mt-3">Se încarcă bicicletele...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : (
            <div className="row">
              {featuredBikes.map(bike => (
                <div className="col-md-4 mb-4" key={bike._id || bike.id}>
                  <div className="card bike-card h-100">
                    <div className="bike-type-badge">
                      <span>{bike.type}</span>
                    </div>
                    <div className="bike-rating">
                      <span>{bike.rating || bike.averageRating} ★</span>
                    </div>
                    <img src={bike.image} className="card-img-top bike-img" alt={bike.name} />
                    <div className="card-body">
                      <h3 style={{fontSize:20,color:'white' }}>{bike.name}</h3>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <p className="mb-0 bike-price"><strong>Cumpără:</strong> ${bike.price}</p>
                          <p className="mb-0 bike-price"><strong>Închiriază:</strong> ${bike.rentalPrice}/zi</p>
                        </div>
                        <Link to={`/bikes/${bike._id || bike.id}`} className="btn btn-sm btn-primary">Detalii</Link>
                      </div>
                      <div className="d-flex justify-content-between mt-2">
                        <Link to={`/shop?type=${encodeURIComponent(bike.type)}`} className="btn btn-success" style={{width: '48%'}}>
                          Cumpără
                        </Link>
                        <Link to={`/rentals?type=${encodeURIComponent(bike.type)}`} className="btn btn-info" style={{width: '48%', color: 'white'}}>
                          Închiriază
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-3">
            <Link to="/bikes" className="btn btn-outline-primary view-all-btn">Vezi toate bicicletele</Link>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="services-section">
        <div className="container">
          <h2 className="section-title">Serviciile noastre</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card service-card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="bi bi-bicycle service-icon"></i>
                  </div>
                  <h5 className="card-title service-title">Închirieri biciclete</h5>
                  <p className="card-text">Închiriază o bicicletă pentru ore, zile sau săptămâni. Perfect pentru turiști și bicicliști ocazionali.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card service-card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="bi bi-shop service-icon"></i>
                  </div>
                  <h5 className="card-title service-title">Vânzări biciclete</h5>
                  <p className="card-text">Explorează colecția noastră de biciclete de înaltă calitate la prețuri competitive.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card service-card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="bi bi-tools service-icon"></i>
                  </div>
                  <h5 className="card-title service-title">Întreținere</h5>
                  <p className="card-text">Servicii profesionale de întreținere și reparație pentru biciclete, pentru a asigura plimbări fără probleme.</p>
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
                  <h3 className="cta-title">Ești gata să începi aventura?</h3>
                  <p className="lead">Creează un cont pentru a închiria sau cumpăra bicicleta perfectă astăzi.</p>
                  <div className="d-flex justify-content-center gap-3">
                    <Link to="/register" className="btn btn-light cta-btn mt-3">Înregistrează-te</Link>
                    <Link to="/login" className="btn btn-light cta-btn mt-3">Autentifică-te</Link>
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