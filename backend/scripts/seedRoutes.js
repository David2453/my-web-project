// backend/scripts/seedRoutes.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const seedRoutes = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is undefined. Make sure your .env file is set up correctly.');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB with URI:', process.env.MONGO_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Import models
    const Route = require('../models/Route');
    const Location = require('../models/Locations');

    // Get all locations
    const locations = await Location.find();
    
    if (locations.length === 0) {
      console.log('No locations found. Please run seedData.js first.');
      process.exit(1);
    }

    // Clear existing routes
    await Route.deleteMany({});
    console.log('Cleared existing routes');

    // Sample routes for each location
    const routesData = [];

    for (const location of locations) {
      // Generate 2-3 routes per location
      const numRoutes = Math.floor(Math.random() * 2) + 2; // 2-3 routes
      
      // Set center coordinates based on city
      let centerLat, centerLng;
      switch(location.city) {
        case 'București':
          centerLat = 44.4268;
          centerLng = 26.1025;
          break;
        case 'Brașov':
          centerLat = 45.6427;
          centerLng = 25.5887;
          break;
        case 'Cluj-Napoca':
          centerLat = 46.7712;
          centerLng = 23.6236;
          break;
        default:
          centerLat = 44.4268;
          centerLng = 26.1025;
      }
      
      for (let i = 1; i <= numRoutes; i++) {
        // Create route with coordinates around the city center
        const routeCenterLat = centerLat + (Math.random() * 0.1 - 0.05);
        const routeCenterLng = centerLng + (Math.random() * 0.1 - 0.05);
        
        // Generate route coordinates (a simple loop path)
        const coordinates = [];
        const numPoints = 10 + Math.floor(Math.random() * 10); // 10-19 points
        
        for (let j = 0; j < numPoints; j++) {
          const angle = (j / numPoints) * Math.PI * 2;
          const radius = 0.01 + (Math.random() * 0.005); // Random radius
          
          coordinates.push({
            lat: routeCenterLat + Math.sin(angle) * radius,
            lng: routeCenterLng + Math.cos(angle) * radius
          });
        }
        
        const route = {
          name: `Traseu ${location.city} ${i}`,
          description: `Un traseu frumos pentru biciclete în apropierea ${location.name} din ${location.city}. Perfect pentru a te bucura de peisaj și a face exerciții fizice.`,
          location: location._id,
          distance: Math.round((5 + Math.random() * 15) * 10) / 10, // 5-20 km
          difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
          estimatedTime: Math.floor((20 + Math.random() * 100)), // 20-120 minutes
          routeType: ['loop', 'out-and-back', 'point-to-point'][Math.floor(Math.random() * 3)],
          coordinates: coordinates,
          elevationGain: Math.floor(Math.random() * 500), // 0-500 meters
          tags: ['scenic', 'family-friendly', 'mountainous', 'urban', 'coastal', 'challenging']
            .sort(() => Math.random() - 0.5)
            .slice(0, 2 + Math.floor(Math.random() * 3)), // 2-4 random tags
          images: [
            'https://images.unsplash.com/photo-1541625602330-2277a4c46182',
            'https://images.unsplash.com/photo-1544191696-102152079a3f'
          ]
        };
        
        routesData.push(route);
      }
    }

    // Insert routes into database
    await Route.insertMany(routesData);
    console.log(`${routesData.length} routes created`);

    console.log('Database seeded with routes successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding routes:', error);
    process.exit(1);
  }
};

// Run the seed function
seedRoutes();