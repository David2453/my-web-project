// frontend/src/components/context/ReviewsContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const ReviewsContext = createContext();

export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentBikeId, setCurrentBikeId] = useState(null);

  // Fetch reviews for a specific bike - using useCallback to avoid infinite re-renders
  const fetchReviews = useCallback(async (bikeId) => {
    if (!bikeId) return;
    
    // Only fetch if bike ID is different from current or we don't have reviews yet
    if (bikeId === currentBikeId && reviews.length > 0) return;
    
    setCurrentBikeId(bikeId);
    setLoading(true);
    
    try {
      const res = await axios.get(`/api/reviews/bike/${bikeId}`);
      setReviews(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [currentBikeId, reviews.length]);

  // Add a new review
  const addReview = useCallback((review) => {
    setReviews(prevReviews => [review, ...prevReviews]);
  }, []);

  // Remove a review
  const removeReview = useCallback(async (reviewId) => {
    try {
      await axios.delete(`/api/reviews/${reviewId}`);
      setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
      return true;
    } catch (err) {
      console.error('Error removing review:', err);
      return false;
    }
  }, []);

  // Calculate average rating
  const calculateAverageRating = useCallback(() => {
    if (!reviews || reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  // Create a memoized value for the context
  const contextValue = {
    reviews,
    loading,
    error,
    fetchReviews,
    addReview,
    removeReview,
    calculateAverageRating,
    reviewCount: reviews.length
  };

  return (
    <ReviewsContext.Provider value={contextValue}>
      {children}
    </ReviewsContext.Provider>
  );
};

export default ReviewsContext;