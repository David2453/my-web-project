// backend/scripts/seedData.js
const mongoose = require('mongoose');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Get collection references
    const bikeCollection = mongoose.connection.collection('bikes');
    const locationCollection = mongoose.connection.collection('locations');

    // Clear existing data
    console.log('Clearing existing data...');
    await bikeCollection.deleteMany({});
    await locationCollection.deleteMany({});
    console.log('Existing data cleared');

    // Sample locations with logical IDs
    const locations = [
      {
        _id: new mongoose.Types.ObjectId(),
        code: 'nyc',
        name: 'New York City Store',
        address: '123 Broadway',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '212-555-1234',
        email: 'nyc@bikerentals.com',
        createdAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        code: 'la',
        name: 'Los Angeles Store',
        address: '456 Hollywood Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90028',
        phone: '323-555-6789',
        email: 'la@bikerentals.com',
        createdAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        code: 'chi',
        name: 'Chicago Store',
        address: '789 Michigan Ave',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60611',
        phone: '312-555-4321',
        email: 'chicago@bikerentals.com',
        createdAt: new Date()
      }
    ];

    // Create locations
    console.log('Creating locations...');
    await locationCollection.insertMany(locations);
    console.log(`${locations.length} locations created`);

    // Log created locations for debugging
    for (const loc of locations) {
      console.log(`Location: ${loc.name}, ID: ${loc._id}, Code: ${loc.code}`);
    }

    // Sample bikes
    const bikes = [
      {
        name: 'Mountain Explorer',
        type: 'Mountain Bike',
        description: 'A high-performance mountain bike perfect for challenging trails and outdoor adventures.',
        price: 899.99,
        rentalPrice: 35.99,
        image: 'https://www.paulscycles.co.uk/images/altitude-c70-red-carbon.jpg?width=1998&height=1998&quality=85&mode=pad&format=webp&bgcolor=ffffff',
        features: ['27-speed Shimano gears', 'Hydraulic disc brakes', 'Lightweight aluminum frame'],
        purchaseStock: 15,
        rentalInventory: [
          {
            location: locations[0]._id, // NYC
            stock: 5
          },
          {
            location: locations[1]._id, // LA
            stock: 3
          }
        ],
        createdAt: new Date()
      },
      {
        name: 'City Cruiser',
        type: 'Urban Bike',
        description: 'Comfortable and stylish city bike perfect for commuting and casual rides.',
        price: 699.99,
        rentalPrice: 25.99,
        image: 'https://images.ctfassets.net/ogr4ifihl2yh/3gvlDBzj1UgLVNH2vAhFEF/5a1585c9a1463d431d7cce957ba7c984/Profile_-_Around_the_Block_Women-s_26__Single_Speed_-_Mint_Green_-_630042_NEW.png?w=1000&q=85',
        features: ['7-speed Shimano gearing', 'Comfortable upright position', 'Fenders and chain guard'],
        purchaseStock: 20,
        rentalInventory: [
          {
            location: locations[0]._id, // NYC
            stock: 6
          },
          {
            location: locations[2]._id, // Chicago
            stock: 4
          }
        ],
        createdAt: new Date()
      },
      {
        name: 'Road Master',
        type: 'Road Bike',
        description: 'High-performance road bike designed for speed and long-distance riding.',
        price: 1199.99,
        rentalPrice: 45.99,
        image: 'https://www.certini.co.uk/images/products/s/sp/specialized-allez-e5-disc-road-b-2.jpg?width=1998&height=1998&quality=85&mode=pad&format=webp&bgcolor=ffffff',
        features: ['22-speed Shimano 105 drivetrain', 'Carbon fork for reduced weight', 'Lightweight aluminum frame'],
        purchaseStock: 10,
        rentalInventory: [
          {
            location: locations[1]._id, // LA
            stock: 3
          },
          {
            location: locations[2]._id, // Chicago
            stock: 3
          }
        ],
        createdAt: new Date()
      },
      {
        name: 'Hybrid Commuter',
        type: 'Hybrid Bike',
        description: 'Versatile hybrid bike that combines features of road and mountain bikes.',
        price: 749.99,
        rentalPrice: 30.99,
        image: 'https://cdn.shopify.com/s/files/1/0799/9645/products/EB1P9394_1200x.jpg?v=1695330380',
        features: ['21-speed Shimano gearing', 'Front suspension fork', 'Comfortable ergonomic grips'],
        purchaseStock: 12,
        rentalInventory: [
          {
            location: locations[0]._id, // NYC
            stock: 4
          }
        ],
        createdAt: new Date()
      }
    ];

    // Create bikes
    console.log('Creating bikes...');
    await bikeCollection.insertMany(bikes);
    console.log(`${bikes.length} bikes created`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();