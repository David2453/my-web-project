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
      
      for (let i = 1; i <= numRoutes; i++) {
        // Create route with fake coordinates
        const centerLat = 44.4268 + (Math.random() * 0.1 - 0.05); // Random around 44.4268
        const centerLng = 26.1025 + (Math.random() * 0.1 - 0.05); // Random around 26.1025
        
        // Generate route coordinates (a simple loop path)
        const coordinates = [];
        const numPoints = 10 + Math.floor(Math.random() * 10); // 10-19 points
        
        for (let j = 0; j < numPoints; j++) {
          const angle = (j / numPoints) * Math.PI * 2;
          const radius = 0.01 + (Math.random() * 0.005); // Random radius
          
          coordinates.push({
            lat: centerLat + Math.sin(angle) * radius,
            lng: centerLng + Math.cos(angle) * radius
          });
        }
        
        const route = {
          name: `${location.name} Route ${i}`,
          description: `A beautiful cycling route near ${location.name} in ${location.city}. Perfect for enjoying the scenery and getting some exercise.`,
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