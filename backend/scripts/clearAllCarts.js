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

// Funcție pentru a șterge toate coșurile
async function clearAllCarts() {
  try {
    // Șterge toate elementele din coș
    const result = await CartItem.deleteMany({});
    
    console.log('Toate coșurile au fost șterse.');
    console.log(`Număr total de elemente șterse: ${result.deletedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Eroare la ștergerea coșurilor:', error);
    process.exit(1);
  }
}

// Confirmare pentru ștergerea tuturor coșurilor
console.log('ATENȚIE: Această acțiune va șterge TOATE coșurile din baza de date.');
console.log('Această acțiune nu poate fi anulată.');
console.log('Pentru a continua, tastați "CONFIRM" și apăsați Enter:');

// Așteaptă confirmarea utilizatorului
process.stdin.once('data', (data) => {
  const input = data.toString().trim();
  
  if (input === 'CONFIRM') {
    clearAllCarts();
  } else {
    console.log('Operațiune anulată.');
    process.exit(0);
  }
}); 