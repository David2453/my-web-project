// backend/scripts/checkData.js
const mongoose = require('mongoose');
require('dotenv').config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Get collection references
    const bikeCollection = mongoose.connection.collection('bikes');
    const locationCollection = mongoose.connection.collection('locations');

    // Check locations
    const locations = await locationCollection.find({}).toArray();
    console.log('Locations in database:', locations.length);
    if (locations.length > 0) {
      console.log('Sample location:', {
        _id: locations[0]._id,
        name: locations[0].name,
        city: locations[0].city
      });
    }

    // Check bikes
    const bikes = await bikeCollection.find({}).toArray();
    console.log('Bikes in database:', bikes.length);
    if (bikes.length > 0) {
      console.log('Sample bike:', {
        _id: bikes[0]._id,
        name: bikes[0].name,
        rentalInventory: bikes[0].rentalInventory
      });

      // Check bikes with rental inventory for a specific location
      const locationId = locations[0]._id;
      console.log(`Checking bikes for location: ${locations[0].name} (${locationId})`);
      
      const bikesForLocation = await bikeCollection.find({
        'rentalInventory': {
          $elemMatch: {
            'location': locationId,
            'stock': { $gt: 0 }
          }
        }
      }).toArray();
      
      console.log(`Bikes available for ${locations[0].name}:`, bikesForLocation.length);
      
      if (bikesForLocation.length === 0) {
        // Check all rental inventory to see what's going on
        console.log('Examining all rental inventory configurations:');
        for (const bike of bikes) {
          console.log(`${bike.name} rental inventory:`, bike.rentalInventory);
          if (bike.rentalInventory) {
            for (const inventory of bike.rentalInventory) {
              console.log('  Location ID:', inventory.location);
              console.log('  Stock:', inventory.stock);
              console.log('  Is ObjectId?', mongoose.Types.ObjectId.isValid(inventory.location));
            }
          }
        }
      }
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error checking database:', error);
  }
};

checkData();