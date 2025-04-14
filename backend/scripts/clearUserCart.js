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

// Funcție pentru a șterge coșul unui utilizator
async function clearUserCart(username) {
  try {
    // Găsește utilizatorul după username
    const user = await User.findOne({ username });
    
    if (!user) {
      console.error(`Utilizatorul "${username}" nu a fost găsit.`);
      process.exit(1);
    }
    
    console.log(`Utilizator găsit: ${user.username} (ID: ${user._id})`);
    
    // Șterge toate elementele din coș pentru acest utilizator
    const result = await CartItem.deleteMany({ user: user._id });
    
    console.log(`Coșul utilizatorului "${username}" a fost șters.`);
    console.log(`Număr de elemente șterse: ${result.deletedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Eroare la ștergerea coșului:', error);
    process.exit(1);
  }
}

// Verifică dacă a fost furnizat un username
const username = process.argv[2];
if (!username) {
  console.error('Vă rugăm să furnizați un username ca argument.');
  console.error('Exemplu: node clearUserCart.js nume_utilizator');
  process.exit(1);
}

// Rulează funcția
clearUserCart(username); 