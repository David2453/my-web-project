const mongoose = require('mongoose');
const CartItem = require('../models/CartItem');
const User = require('../models/User');
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

// Funcție pentru a șterge coșurile utilizatorilor inactivi
async function clearInactiveCarts(daysInactive) {
  try {
    // Calculează data limită (X zile în urmă)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
    
    console.log(`Se vor șterge coșurile utilizatorilor inactivi de mai mult de ${daysInactive} zile (după ${cutoffDate.toISOString()})`);
    
    // Găsește utilizatorii inactivi
    const inactiveUsers = await User.find({
      lastLogin: { $lt: cutoffDate }
    });
    
    if (inactiveUsers.length === 0) {
      console.log('Nu s-au găsit utilizatori inactivi.');
      process.exit(0);
    }
    
    console.log(`S-au găsit ${inactiveUsers.length} utilizatori inactivi.`);
    
    // Extrage ID-urile utilizatorilor inactivi
    const inactiveUserIds = inactiveUsers.map(user => user._id);
    
    // Șterge coșurile utilizatorilor inactivi
    const result = await CartItem.deleteMany({
      user: { $in: inactiveUserIds }
    });
    
    console.log(`Coșurile utilizatorilor inactivi au fost șterse.`);
    console.log(`Număr total de elemente șterse: ${result.deletedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Eroare la ștergerea coșurilor:', error);
    process.exit(1);
  }
}

// Verifică dacă a fost furnizat numărul de zile
const daysInactive = parseInt(process.argv[2]);
if (isNaN(daysInactive) || daysInactive <= 0) {
  console.error('Vă rugăm să furnizați un număr valid de zile ca argument.');
  console.error('Exemplu: node clearInactiveCarts.js 30');
  process.exit(1);
}

// Rulează funcția
clearInactiveCarts(daysInactive); 