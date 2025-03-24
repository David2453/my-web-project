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

  useEffect(() => {
    // Only fetch cart if user is authenticated
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
      const res = await axios.get('/api/cart');
      
      // Transform the data to match our frontend structure
      const formattedCartItems = res.data.map(item => ({
        id: item._id,
        bikeId: item.bike._id,
        name: item.bike.name,
        type: item.bike.type,
        price: item.bike.price,
        rentalPrice: item.bike.rentalPrice,
        image: item.bike.image,
        quantity: item.quantity,
        itemType: item.type, // 'purchase' or 'rental'
        startDate: item.startDate,
        endDate: item.endDate,
        location: item.location ? {
          id: item.location._id,
          name: item.location.name,
          city: item.location.city
        } : null
      }));
      
      setCartItems(formattedCartItems);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (bikeId, itemType, quantity = 1, startDate = null, endDate = null, locationId = null) => {
    if (!authState.isAuthenticated) {
      setError('You must be logged in to add items to cart');
      return false;
    }
    
    try {
      const data = {
        bikeId,
        type: itemType,
        quantity
      };
      
      if (itemType === 'rental') {
        data.startDate = startDate;
        data.endDate = endDate;
        data.locationId = locationId;
      }
      
      const res = await axios.post('/api/cart', data);
      
      const newItem = {
        id: res.data._id,
        bikeId: res.data.bike._id,
        name: res.data.bike.name,
        type: res.data.bike.type,
        price: res.data.bike.price,
        rentalPrice: res.data.bike.rentalPrice,
        image: res.data.bike.image,
        quantity: res.data.quantity,
        itemType: res.data.type,
        startDate: res.data.startDate,
        endDate: res.data.endDate,
        location: res.data.location ? {
          id: res.data.location._id,
          name: res.data.location.name,
          city: res.data.location.city
        } : null
      };
      
      // If the item was added or quantity updated, refresh the cart
      fetchCart();
      return true;
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.response?.data?.msg || 'Failed to add to cart');
      return false;
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    try {
      await axios.put(`/api/cart/${cartItemId}`, { quantity });
      
      // Update the cart in state
      setCartItems(cartItems.map(item => 
        item.id === cartItemId ? { ...item, quantity } : item
      ));
      
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
        calculateTotals
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;