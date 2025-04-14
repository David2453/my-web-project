// backend/scripts/seedData.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

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
        code: 'buc',
        name: 'București Store',
        address: 'Strada Victoriei 100',
        city: 'București',
        state: 'București',
        zipCode: '010096',
        phone: '021-555-1234',
        email: 'bucuresti@bikerentals.com',
        createdAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        code: 'brv',
        name: 'Brașov Store',
        address: 'Strada Mureșenilor 15',
        city: 'Brașov',
        state: 'Brașov',
        zipCode: '500030',
        phone: '0268-555-6789',
        email: 'brasov@bikerentals.com',
        createdAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        code: 'clj',
        name: 'Cluj Store',
        address: 'Strada Memorandumului 28',
        city: 'Cluj-Napoca',
        state: 'Cluj',
        zipCode: '400114',
        phone: '0264-555-4321',
        email: 'cluj@bikerentals.com',
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
        description: 'O bicicletă de munte de înaltă performanță perfectă pentru trasee dificile și aventuri în aer liber.',
        price: 899.99,
        rentalPrice: 35.99,
        image: 'https://www.paulscycles.co.uk/images/altitude-c70-red-carbon.jpg?width=1998&height=1998&quality=85&mode=pad&format=webp&bgcolor=ffffff',
        features: ['Viteză Shimano cu 27 de trepte', 'Frâne pe disc hidraulice', 'Cadru din aluminiu ușor'],
        purchaseStock: 15,
        rentalInventory: [
          {
            location: locations[0]._id, // București
            stock: 5
          },
          {
            location: locations[1]._id, // Brașov
            stock: 3
          }
        ],
        createdAt: new Date()
      },
      {
        name: 'City Cruiser',
        type: 'Urban Bike',
        description: 'Bicicletă urbană confortabilă și elegantă perfectă pentru naveta și plimbări ocazionale.',
        price: 699.99,
        rentalPrice: 25.99,
        image: 'https://images.ctfassets.net/ogr4ifihl2yh/3gvlDBzj1UgLVNH2vAhFEF/5a1585c9a1463d431d7cce957ba7c984/Profile_-_Around_the_Block_Women-s_26__Single_Speed_-_Mint_Green_-_630042_NEW.png?w=1000&q=85',
        features: ['Viteză Shimano cu 7 trepte', 'Poziție confortabilă verticală', 'Aripioare și protecție pentru lanț'],
        purchaseStock: 20,
        rentalInventory: [
          {
            location: locations[0]._id, // București
            stock: 6
          },
          {
            location: locations[2]._id, // Cluj
            stock: 4
          }
        ],
        createdAt: new Date()
      },
      {
        name: 'Road Master',
        type: 'Road Bike',
        description: 'Bicicletă de șosea de înaltă performanță proiectată pentru viteză și curse pe distanțe lungi.',
        price: 1199.99,
        rentalPrice: 45.99,
        image: 'https://www.certini.co.uk/images/products/s/sp/specialized-allez-e5-disc-road-b-2.jpg?width=1998&height=1998&quality=85&mode=pad&format=webp&bgcolor=ffffff',
        features: ['Transmisie Shimano 105 cu 22 de viteze', 'Furcă din carbon pentru greutate redusă', 'Cadru din aluminiu ușor'],
        purchaseStock: 10,
        rentalInventory: [
          {
            location: locations[1]._id, // Brașov
            stock: 3
          },
          {
            location: locations[2]._id, // Cluj
            stock: 3
          }
        ],
        createdAt: new Date()
      },
      {
        name: 'Hybrid Commuter',
        type: 'Hybrid Bike',
        description: 'Bicicletă hibridă versatilă care combină caracteristici ale bicicletelor de șosea și de munte.',
        price: 749.99,
        rentalPrice: 30.99,
        image: 'https://mediacdn.libertatea.ro/unsafe/800x600/smart/filters:format(webp):contrast(8):quality(75)/https://static4.libertatea.ro/wp-content/uploads/2020/09/rasa-de-caine-pug.jpg',
        features: ['Viteză Shimano cu 21 de trepte', 'Furcă cu suspensie frontală', 'Gripuri ergonomice confortabile'],
        purchaseStock: 12,
        rentalInventory: [
          {
            location: locations[0]._id, // București
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