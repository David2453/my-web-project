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
    // Only fetch orders if user is authenticated
    if (authState.isAuthenticated) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [authState.isAuthenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/orders');
      
      // Transform the data to match our frontend structure
      const formattedOrders = res.data.map(order => ({
        id: order._id,
        items: order.items.map(item => ({
          id: item._id,
          bikeId: item.bike._id,
          name: item.bike.name,
          type: item.bike.type,
          itemType: item.type, // 'purchase' or 'rental'
          price: item.price,
          quantity: item.quantity,
          startDate: item.startDate,
          endDate: item.endDate,
          location: item.location ? {
            id: item.location._id,
            name: item.location.name,
            city: item.location.city
          } : null,
          image: item.bike.image
        })),
        status: order.status,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        createdAt: order.createdAt
      }));
      
      setOrders(formattedOrders);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Function to get upcoming rentals
  const getUpcomingRentals = () => {
    const today = new Date();
    
    return orders
      .flatMap(order => 
        order.items
          .filter(item => 
            item.itemType === 'rental' && 
            new Date(item.endDate) >= today
          )
          .map(item => ({
            id: `${order.id}-${item.id}`,
            orderId: order.id,
            bikeId: item.bikeId,
            bikeName: item.name,
            startDate: item.startDate,
            endDate: item.endDate,
            location: item.location,
            status: order.status,
            createdAt: order.createdAt
          }))
      )
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  };

  // Function to get recent orders
  const getRecentOrders = (limit = 5) => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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