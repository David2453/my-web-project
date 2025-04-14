// frontend/src/components/context/CartContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { authState } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configurare axios pentru a include token-ul în toate cererile
  useEffect(() => {
    if (authState.token) {
      axios.defaults.headers.common['x-auth-token'] = authState.token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [authState.token]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [authState.isAuthenticated]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      console.log('Încercare de preluare a coșului...');
      console.log('Token prezent:', !!axios.defaults.headers.common['x-auth-token']);
      
      const res = await axios.get('/api/cart');
      console.log('Răspuns preluare coș:', res.data);
      
      // Formatează datele și corectează elementele invalide
      const formattedCartItems = await Promise.all(res.data.map(async item => {
        // Dacă bicicleta lipsește, încercăm să o recuperăm
        if (!item.bike || !item.bike._id) {
          console.log('Încercare de recuperare a bicicletei pentru elementul:', item._id);
          try {
            // Verificăm dacă avem bikeId în item
            if (item.bikeId) {
              const bikeResponse = await axios.get(`/api/bikes/${item.bikeId}`);
              if (bikeResponse.data && bikeResponse.data._id) {
                // Actualizăm elementul din coș cu bicicleta recuperată
                await axios.put(`/api/cart/${item._id}`, {
                  bikeId: bikeResponse.data._id
                });
                item.bike = bikeResponse.data;
              }
            }
          } catch (err) {
            console.error('Eroare la recuperarea bicicletei:', err);
          }
        }
        
        // Pentru închirieri, verificăm și recuperăm locația dacă lipsește
        if (item.type === 'rental' && (!item.location || !item.location._id)) {
          console.log('Încercare de recuperare a locației pentru elementul:', item._id);
          try {
            // Verificăm dacă avem locationId în item
            if (item.locationId) {
              const locationResponse = await axios.get(`/api/locations/${item.locationId}`);
              if (locationResponse.data && locationResponse.data._id) {
                // Actualizăm elementul din coș cu locația recuperată
                await axios.put(`/api/cart/${item._id}`, {
                  locationId: locationResponse.data._id
                });
                item.location = locationResponse.data;
              }
            }
          } catch (err) {
            console.error('Eroare la recuperarea locației:', err);
          }
        }
        
        // Returnăm elementul formatat
        return {
          id: item._id,
          bikeId: item.bike?._id || item.bikeId,
          name: item.bike?.name || 'Bicicletă necunoscută',
          type: item.bike?.type || 'standard',
          price: item.bike?.price || 0,
          rentalPrice: item.bike?.rentalPrice || 0,
          image: item.bike?.image || '/images/default-bike.jpg',
          quantity: item.quantity,
          itemType: item.type,
          startDate: item.startDate,
          endDate: item.endDate,
          location: item.location ? {
            id: item.location._id,
            name: item.location.name,
            city: item.location.city
          } : null
        };
      }));
      
      setCartItems(formattedCartItems);
      setError(null);
    } catch (err) {
      console.error('Eroare la preluarea coșului:', err);
      setError('Nu s-a putut încărca coșul');
      setCartItems([]); // Resetează coșul în caz de eroare
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (bikeId, itemType, quantity = 1, startDate = null, endDate = null, locationId = null) => {
    console.log('Încercare de adăugare în coș cu datele:', {
      bikeId,
      itemType,
      quantity,
      startDate,
      endDate,
      locationId
    });

    if (!authState.isAuthenticated) {
      console.error('Utilizatorul nu este autentificat');
      setError('Trebuie să fiți autentificat pentru a adăuga în coș');
      return false;
    }

    try {
      // Verifică și setează token-ul pentru toate cererile
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token-ul de autentificare lipsește');
      }
      axios.defaults.headers.common['x-auth-token'] = token;

      // Verifică dacă bicicleta există înainte de a o adăuga în coș
      const bikeResponse = await axios.get(`/api/bikes/${bikeId}`);
      if (!bikeResponse.data || !bikeResponse.data._id) {
        throw new Error('Bicicleta nu a fost găsită');
      }

      // Verifică stocul disponibil
      console.log('Verificare stoc disponibil...');
      const stockCheck = await axios.get(`/api/bikes/${bikeId}/stock`, {
        params: {
          type: itemType,
          locationId: locationId
        }
      });
      
      console.log('Răspuns verificare stoc:', stockCheck.data);
      const { purchaseStock, rentalStock } = stockCheck.data;

      if (itemType === 'purchase' && purchaseStock < quantity) {
        const error = `Nu există suficient stoc disponibil pentru cumpărare (Disponibil: ${purchaseStock})`;
        setError(error);
        return false;
      }

      if (itemType === 'rental' && rentalStock < quantity) {
        const error = `Nu există suficiente biciclete disponibile pentru închiriere la această locație (Disponibil: ${rentalStock})`;
        setError(error);
        return false;
      }

      // Verifică dacă locația există pentru închiriere
      if (itemType === 'rental' && locationId) {
        const locationResponse = await axios.get(`/api/locations/${locationId}`);
        if (!locationResponse.data || !locationResponse.data._id) {
          throw new Error('Locația nu a fost găsită');
        }
      }

      console.log('Trimitere cerere POST către /api/cart...');
      const data = {
        bikeId,
        type: itemType,
        quantity,
        ...(itemType === 'rental' && {
          startDate,
          endDate,
          locationId
        })
      };
      
      const res = await axios.post('/api/cart', data);
      console.log('Răspuns adăugare în coș:', res.data);
      
      // Verifică dacă răspunsul conține bicicleta
      if (!res.data.bike || !res.data.bike._id) {
        throw new Error('Bicicleta nu a fost adăugată corect în coș');
      }
      
      await fetchCart(); // Reîncarcă coșul după adăugare
      return true;
    } catch (err) {
      console.error('Eroare detaliată la adăugarea în coș:', err);
      const errorMessage = err.response?.data?.msg || err.message || 'Nu s-a putut adăuga în coș';
      console.error('Mesaj de eroare:', errorMessage);
      setError(errorMessage);
      return false;
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    try {
      // Verifică stocul disponibil înainte de a actualiza cantitatea
      const cartItem = cartItems.find(item => item.id === cartItemId);
      if (!cartItem) {
        setError('Cart item not found');
        return false;
      }

      const stockCheck = await axios.get(`/api/bikes/${cartItem.bikeId}/stock`, {
        params: {
          type: cartItem.itemType,
          locationId: cartItem.location?.id
        }
      });

      if (cartItem.itemType === 'purchase' && stockCheck.data.purchaseStock < quantity) {
        setError('Not enough stock available for purchase');
        return false;
      }

      if (cartItem.itemType === 'rental' && stockCheck.data.rentalStock < quantity) {
        setError('Not enough bikes available for rental at this location');
        return false;
      }

      await axios.put(`/api/cart/${cartItemId}`, { quantity });
      fetchCart();
      return true;
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError(err.response?.data?.msg || 'Failed to update cart item');
      return false;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await axios.delete(`/api/cart/${cartItemId}`);
      setCartItems(cartItems.filter(item => item.id !== cartItemId));
      return true;
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.response?.data?.msg || 'Failed to remove from cart');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart');
      setCartItems([]);
      return true;
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.response?.data?.msg || 'Failed to clear cart');
      return false;
    }
  };

  const validateCartItems = async () => {
    try {
      const invalidItems = [];
      const fixedItems = [];
      
      for (const item of cartItems) {
        try {
          // Verifică dacă bicicleta există
          if (!item.bikeId) {
            console.log('Element fără bikeId:', item);
            invalidItems.push(item);
            continue;
          }
          
          // Verifică dacă bicicleta există și are stoc disponibil
          const stockCheck = await axios.get(`/api/bikes/${item.bikeId}/stock`, {
            params: {
              type: item.itemType,
              locationId: item.location?.id
            }
          });

          const { purchaseStock, rentalStock } = stockCheck.data;
          
          if (item.itemType === 'purchase' && purchaseStock < item.quantity) {
            // Ajustează cantitatea în loc să ștergi elementul
            const newQuantity = Math.min(item.quantity, purchaseStock);
            if (newQuantity > 0) {
              await axios.put(`/api/cart/${item.id}`, { quantity: newQuantity });
              fixedItems.push({ ...item, quantity: newQuantity });
            } else {
              invalidItems.push(item);
            }
          } else if (item.itemType === 'rental' && rentalStock < item.quantity) {
            // Ajustează cantitatea în loc să ștergi elementul
            const newQuantity = Math.min(item.quantity, rentalStock);
            if (newQuantity > 0) {
              await axios.put(`/api/cart/${item.id}`, { quantity: newQuantity });
              fixedItems.push({ ...item, quantity: newQuantity });
            } else {
              invalidItems.push(item);
            }
          }
        } catch (err) {
          console.error(`Eroare la verificarea elementului ${item.id}:`, err);
          invalidItems.push(item);
        }
      }

      // Reîncarcă coșul după validare
      await fetchCart();
      
      return {
        success: invalidItems.length === 0,
        message: invalidItems.length > 0 
          ? `S-au ajustat ${fixedItems.length} elemente și ${invalidItems.length} elemente nu pot fi validate` 
          : 'Toate elementele din coș sunt valide',
        fixedCount: fixedItems.length,
        invalidCount: invalidItems.length,
        fixedItems,
        invalidItems
      };
    } catch (err) {
      console.error('Eroare la validarea coșului:', err);
      return {
        success: false,
        message: 'Nu s-a putut valida coșul',
        fixedCount: 0,
        invalidCount: 0,
        fixedItems: [],
        invalidItems: []
      };
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const purchaseItems = cartItems.filter(item => item.itemType === 'purchase');
    const rentalItems = cartItems.filter(item => item.itemType === 'rental');
    
    const subtotal = purchaseItems.reduce(
      (total, item) => total + item.price * item.quantity, 
      0
    );
    
    const rentalTotal = rentalItems.reduce((total, item) => {
      if (item.startDate && item.endDate) {
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        return total + (item.rentalPrice * days);
      }
      return total;
    }, 0);
    
    const shipping = purchaseItems.length > 0 ? 15.99 : 0;
    const tax = (subtotal + rentalTotal) * 0.08; // 8% tax
    const total = subtotal + rentalTotal + shipping + tax;
    
    return {
      subtotal,
      rentalTotal,
      shipping,
      tax,
      total
    };
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCart,
        calculateTotals,
        validateCartItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;