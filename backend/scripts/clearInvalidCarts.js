const mongoose = require('mongoose');
const CartItem = require('../models/CartItem');
const Bike = require('../models/Bikes');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Conectare la baza de date
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectat la MongoDB'))
.catch(err => {
  console.error('Eroare la conectarea la MongoDB:', err);
  process.exit(1);
});

// Funcție pentru a șterge coșurile invalide
async function clearInvalidCarts() {
  try {
    console.log('Se caută coșurile invalide...');
    
    // Găsește toate elementele din coș
    const cartItems = await CartItem.find().populate('bike');
    
    // Filtrează elementele invalide (unde bicicleta nu mai există)
    const invalidItems = cartItems.filter(item => !item.bike);
    
    if (invalidItems.length === 0) {
      console.log('Nu s-au găsit coșuri invalide.');
      process.exit(0);
    }
    
    console.log(`S-au găsit ${invalidItems.length} coșuri invalide.`);
    
    // Extrage ID-urile elementelor invalide
    const invalidItemIds = invalidItems.map(item => item._id);
    
    // Șterge elementele invalide
    const result = await CartItem.deleteMany({
      _id: { $in: invalidItemIds }
    });
    
    console.log(`Coșurile invalide au fost șterse.`);
    console.log(`Număr total de elemente șterse: ${result.deletedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Eroare la ștergerea coșurilor invalide:', error);
    process.exit(1);
  }
}

// Rulează funcția
clearInvalidCarts(); 