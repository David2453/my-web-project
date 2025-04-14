const mongoose = require('mongoose');
const CartItem = require('../models/CartItem');
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

// Funcție pentru a șterge coșurile vechi
async function clearOldCarts(daysOld) {
  try {
    // Calculează data limită (X zile în urmă)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    console.log(`Se vor șterge coșurile mai vechi de ${daysOld} zile (create înainte de ${cutoffDate.toISOString()})`);
    
    // Șterge coșurile vechi
    const result = await CartItem.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    console.log(`Coșurile vechi au fost șterse.`);
    console.log(`Număr total de elemente șterse: ${result.deletedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Eroare la ștergerea coșurilor:', error);
    process.exit(1);
  }
}

// Verifică dacă a fost furnizat numărul de zile
const daysOld = parseInt(process.argv[2]);
if (isNaN(daysOld) || daysOld <= 0) {
  console.error('Vă rugăm să furnizați un număr valid de zile ca argument.');
  console.error('Exemplu: node clearOldCarts.js 90');
  process.exit(1);
}

// Rulează funcția
clearOldCarts(daysOld); 