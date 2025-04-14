// frontend/src/components/context/OrdersContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const { authState } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [authState.isAuthenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Încercare de preluare comenzi...');
      console.log('Token prezent:', !!axios.defaults.headers.common['x-auth-token']);
      
      // Verifică și setează token-ul pentru toate cererile
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token-ul de autentificare lipsește');
      }
      axios.defaults.headers.common['x-auth-token'] = token;
      
      const res = await axios.get('/api/orders');
      console.log('Răspuns preluare comenzi:', res.data);
      
      // Transform the data to match our frontend structure
      const formattedOrders = res.data
        .filter(order => order && order.items) // Verificăm dacă order și order.items există
        .map(order => ({
          id: order._id,
          items: order.items
            .filter(item => item && item.bike) // Verificăm dacă item și item.bike există
            .map(item => ({
              id: item._id || '',
              bikeId: item.bike?._id || '',
              name: item.bike?.name || 'Produs indisponibil',
              type: item.bike?.type || '',
              itemType: item.type || '',
              price: item.price || 0,
              quantity: item.quantity || 1,
              startDate: item.startDate || null,
              endDate: item.endDate || null,
              location: item.location ? {
                id: item.location._id || '',
                name: item.location.name || '',
                city: item.location.city || ''
              } : null,
              image: item.bike?.image || ''
            })),
          status: order.status || 'pending',
          shippingAddress: order.shippingAddress || null,
          paymentMethod: order.paymentMethod || '',
          subtotal: order.subtotal || 0,
          tax: order.tax || 0,
          shipping: order.shipping || 0,
          total: order.total || 0,
          createdAt: order.createdAt || new Date().toISOString()
        }));
      
      console.log('Comenzi formatate:', formattedOrders);
      setOrders(formattedOrders);
      setError(null);
    } catch (err) {
      console.error('Eroare la preluarea comenzilor:', err);
      const errorMessage = err.response?.data?.msg || err.message || 'Nu s-au putut încărca comenzile';
      console.error('Mesaj de eroare:', errorMessage);
      setError(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to get upcoming rentals
  const getUpcomingRentals = () => {
    const today = new Date();
    
    return orders
      .flatMap(order => 
        (order.items || [])
          .filter(item => 
            item && 
            item.itemType === 'rental' && 
            item.endDate && 
            new Date(item.endDate) >= today
          )
          .map(item => ({
            id: `${order.id}-${item.id}`,
            orderId: order.id,
            bikeId: item.bikeId || '',
            bikeName: item.name || '',
            startDate: item.startDate,
            endDate: item.endDate,
            location: item.location || null,
            status: order.status || '',
            createdAt: order.createdAt
          }))
      )
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  };

  // Function to get recent orders
  const getRecentOrders = (limit = 5) => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, limit);
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        error,
        fetchOrders,
        getUpcomingRentals,
        getRecentOrders
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export default OrdersContext;