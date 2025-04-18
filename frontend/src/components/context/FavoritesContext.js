// frontend/src/components/context/FavoritesContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { authState } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authState.isAuthenticated) {
      axios.defaults.headers.common['x-auth-token'] = authState.token;
      fetchFavorites();
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      setFavorites([]);
      setLoading(false);
    }
  }, [authState.isAuthenticated, authState.token]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/favorites');
      const formattedFavorites = res.data
        .filter(fav => fav.bike)
        .map(fav => ({
          id: fav._id,
          bikeId: fav.bike._id,
          name: fav.bike.name,
          type: fav.bike.type,
          price: fav.bike.price,
          rentalPrice: fav.bike.rentalPrice,
          image: fav.bike.image,
          addedOn: fav.addedOn
        }));
      setFavorites(formattedFavorites);
      setError(null);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (bikeId) => {
    try {
      const res = await axios.post('/api/favorites', { bikeId });
      const newFavorite = {
        id: res.data._id,
        bikeId: res.data.bike._id,
        name: res.data.bike.name,
        type: res.data.bike.type,
        price: res.data.bike.price,
        rentalPrice: res.data.bike.rentalPrice,
        image: res.data.bike.image,
        addedOn: res.data.addedOn
      };
      setFavorites([newFavorite, ...favorites]);
      return true;
    } catch (err) {
      console.error('Error adding favorite:', err);
      setError(err.response?.data?.msg || 'Failed to add to favorites');
      return false;
    }
  };

  const removeFavorite = async (favoriteId) => {
    try {
      await axios.delete(`/api/favorites/${favoriteId}`);
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      return true;
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError(err.response?.data?.msg || 'Failed to remove from favorites');
      return false;
    }
  };

  const checkIsFavorite = (bikeId) => {
    return favorites.some(fav => fav.bikeId === bikeId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        error,
        addFavorite,
        removeFavorite,
        checkIsFavorite,
        fetchFavorites
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;