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
  Skeleton,
  Card,
  CardContent,
  Collapse
} from '@mui/material';
import {
  Star as StarIcon,
  StarHalf as StarHalfIcon,
  ThumbUp as ThumbUpIcon,
  SentimentVeryDissatisfied as SadIcon,
  FormatQuote as QuoteIcon,
  VerifiedUser as VerifiedIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

const ReviewList = ({ reviews, loading }) => {
  const theme = useTheme();
  const [showAll, setShowAll] = useState(false);
  const initialReviewCount = 2;

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  // Calculate rating distribution
  const calculateRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    if (!reviews || reviews.length === 0) return distribution;
    
    reviews.forEach(review => {
      const starIndex = Math.floor(review.rating) - 1;
      if (starIndex >= 0 && starIndex < 5) {
        distribution[starIndex]++;
      }
    });
    
    return distribution.reverse();
  };

  const ratingDistribution = calculateRatingDistribution();
  
  // Calculate average rating
  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };
  
  const averageRating = calculateAverageRating();
  
  // Get reviews to display
  const displayedReviews = showAll ? reviews : reviews?.slice(0, initialReviewCount);

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Box sx={{ width: '100%' }}>
          <Skeleton variant="text" width="30%" height={40} />
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
        </Box>
      </Paper>
    );
  }

  // No reviews yet
  if (!reviews || reviews.length === 0) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          borderRadius: 2, 
          mb: 3,
          textAlign: 'center',
          backgroundColor: theme.palette.background.default
        }}
      >
        <SadIcon sx={{ fontSize: 80, color: theme.palette.primary.main, mb: 2 }} />
        <Typography variant="h5" gutterBottom fontWeight="medium">
          Nu există review-uri încă
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Fii primul care lasă un review pentru această bicicletă!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 4, 
        borderRadius: 2, 
        mb: 3,
        backgroundColor: theme.palette.background.default
      }}
    >
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
        Recenzii Clienți
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {/* Rating Summary */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Left side - Average rating */}
        <Grid item xs={12} md={4}>
          <Box 
            sx={{ 
              textAlign: 'center',
              p: 3,
              borderRadius: 2,
              bgcolor: theme.palette.primary.light,
              color: 'white'
            }}
          >
            <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
              {averageRating}
            </Typography>
            <Rating 
              value={parseFloat(averageRating)} 
              precision={0.5} 
              readOnly 
              size="large"
              sx={{ mb: 1 }}
            />
            <Typography variant="body1">
              Din {reviews.length} {reviews.length === 1 ? 'recenzie' : 'recenzii'}
            </Typography>
          </Box>
        </Grid>

        {/* Right side - Rating distribution */}
        <Grid item xs={12} md={8}>
          <Box>
            {[5, 4, 3, 2, 1].map((stars, index) => {
              const count = ratingDistribution[index];
              const percentage = (count / reviews.length) * 100;
              
              return (
                <Box key={stars} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ minWidth: 40 }}>
                    <Typography variant="body2">{stars}</Typography>
                  </Box>
                  <StarIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                  <Box sx={{ flexGrow: 1, mr: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.warning.main,
                          borderRadius: 4
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ minWidth: 30 }}>
                    {count}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* Reviews List */}
      <Box sx={{ mb: 4 }}>
        {displayedReviews?.map((review) => (
          <Card 
            key={review._id} 
            elevation={0}
            sx={{ 
              mb: 2,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 56,
                    height: 56,
                    bgcolor: theme.palette.primary.main,
                    boxShadow: theme.shadows[2]
                  }}
                >
                  {review.user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                
                <Box sx={{ ml: 2, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {review.user?.username || 'Anonim'}
                    </Typography>
                    <Tooltip title="Utilizator verificat">
                      <VerifiedIcon 
                        sx={{ 
                          ml: 1, 
                          fontSize: 18, 
                          color: theme.palette.success.main 
                        }} 
                      />
                    </Tooltip>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating 
                      value={review.rating} 
                      precision={0.5} 
                      readOnly 
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(review.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ pl: 9 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  {review.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {review.comment}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}

        {/* Show More Button */}
        {reviews.length > initialReviewCount && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => setShowAll(!showAll)}
              endIcon={<ExpandMoreIcon sx={{ 
                transform: showAll ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s'
              }} />}
              sx={{
                borderRadius: 28,
                px: 4,
                py: 1,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {showAll ? 'Vezi mai puține' : `Vezi toate cele ${reviews.length} recenzii`}
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ReviewList;