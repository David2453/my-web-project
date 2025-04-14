// frontend/src/components/reviews/ReviewList.js
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Rating,
  Avatar,
  Chip,
  Grid,
  Button,
  Pagination,
  LinearProgress,
  useTheme,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  Star as StarIcon,
  StarHalf as StarHalfIcon,
  ThumbUp as ThumbUpIcon,
  SentimentVeryDissatisfied as SadIcon,
  FormatQuote as QuoteIcon
} from '@mui/icons-material';

const ReviewList = ({ reviews, loading }) => {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const reviewsPerPage = 3;

  // Calculate rating distribution
  const calculateRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // 5 stars to 1 star
    
    if (!reviews || reviews.length === 0) return distribution;
    
    reviews.forEach(review => {
      const starIndex = Math.floor(review.rating) - 1;
      if (starIndex >= 0 && starIndex < 5) {
        distribution[starIndex]++;
      }
    });
    
    return distribution.reverse(); // Reverse to have 5 stars first
  };
  
  const ratingDistribution = calculateRatingDistribution();
  
  // Calculate average rating
  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  };
  
  const averageRating = calculateAverageRating();
  
  // Handle pagination
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const indexOfLastReview = page * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews ? reviews.slice(indexOfFirstReview, indexOfLastReview) : [];
  const totalPages = reviews ? Math.ceil(reviews.length / reviewsPerPage) : 0;
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Loading skeletons
  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Reviews
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={60} height={60} sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" width="80%" sx={{ mx: 'auto' }} />
              <Skeleton variant="text" width="50%" sx={{ mx: 'auto' }} />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            {[1, 2, 3, 4, 5].map((_, index) => (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }} key={index}>
                <Skeleton variant="text" width={100} />
                <Skeleton variant="rectangular" height={10} sx={{ flexGrow: 1, ml: 1 }} />
              </Box>
            ))}
          </Grid>
        </Grid>
        
        {[1, 2, 3].map((_, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ ml: 2 }}>
                <Skeleton variant="text" width={120} />
                <Skeleton variant="text" width={80} />
              </Box>
            </Box>
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="95%" />
          </Box>
        ))}
      </Paper>
    );
  }

  // No reviews yet
  if (!reviews || reviews.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Reviews
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <SadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No reviews yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Be the first to review this bike!
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Customer Reviews
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      {/* Reviews Summary */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Left side - Average Rating */}
        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold" color="primary.main">
              {averageRating.toFixed(1)}
            </Typography>
            <Rating 
              value={averageRating} 
              precision={0.5} 
              readOnly 
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </Typography>
          </Box>
        </Grid>
        
        {/* Right side - Rating Distribution */}
        <Grid item xs={12} md={8}>
          {[5, 4, 3, 2, 1].map((stars, index) => {
            const count = ratingDistribution[index];
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }} key={stars}>
                <Box sx={{ minWidth: 60 }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    {stars} <StarIcon fontSize="small" sx={{ ml: 0.5, color: theme.palette.warning.main }} />
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={percentage} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: theme.palette.grey[200],
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.warning.main
                      }
                    }} 
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {count}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Grid>
      </Grid>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Individual Reviews */}
      {currentReviews.map((review) => (
        <Box key={review._id} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                width: 48,
                height: 48
              }}
            >
              {review.user?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {review.user?.username || 'Anonymous'}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating 
                  value={review.rating} 
                  precision={0.5} 
                  readOnly 
                  size="small"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {formatDate(review.createdAt)}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ ml: 7 }}>
            <Typography variant="h6" gutterBottom>
              {review.title}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {review.comment}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip title="Mark as helpful">
                <Chip
                  icon={<ThumbUpIcon fontSize="small" />}
                  label="Helpful"
                  variant="outlined"
                  size="small"
                  clickable
                  sx={{ 
                    borderRadius: 28,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                      transform: 'translateY(-2px)',
                      boxShadow: 1
                    }
                  }}
                />
              </Tooltip>
            </Box>
          </Box>
          
          {/* Divider between reviews */}
          {currentReviews.indexOf(review) < currentReviews.length - 1 && (
            <Divider sx={{ my: 3 }} />
          )}
        </Box>
      ))}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Paper>
  );
};

export default ReviewList;