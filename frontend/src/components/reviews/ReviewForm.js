// frontend/src/components/reviews/ReviewForm.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Collapse,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';

const ReviewForm = ({ bikeId, onReviewSubmitted }) => {
  const theme = useTheme();
  const { authState } = useContext(AuthContext);
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      rating: newValue
    }));
  };

  const toggleForm = () => {
    setExpanded(!expanded);
    // Reset form and messages when toggling
    if (!expanded) {
      setError(null);
      setSuccess(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!formData.title.trim()) {
      setError('Please enter a review title');
      return;
    }
    
    if (!formData.comment.trim()) {
      setError('Please enter a review comment');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Curățăm textul de orice stilizare CSS
      const cleanComment = formData.comment.replace(/[^a-zA-Z0-9\s.,!?-]/g, '');
      const cleanTitle = formData.title.replace(/[^a-zA-Z0-9\s.,!?-]/g, '');
      
      const response = await axios.post('/api/reviews', {
        bikeId,
        rating: formData.rating,
        title: cleanTitle,
        comment: cleanComment
      });
      
      setSuccess(true);
      setFormData({
        rating: 0,
        title: '',
        comment: ''
      });
      
      // Notify parent component that a review was submitted
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data);
      }
      
      // Auto-close the form after submission
      setTimeout(() => {
        setExpanded(false);
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.msg || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If user is not authenticated, don't show the form
  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <Paper elevation={expanded ? 3 : 1} sx={{ 
      mb: 3, 
      borderRadius: 2,
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        bgcolor: expanded ? theme.palette.primary.light : 'background.paper',
        color: expanded ? 'white' : 'text.primary',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease'
      }}
      onClick={toggleForm}
      >
        <Typography variant="subtitle1" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
          {expanded ? <EditIcon sx={{ mr: 1 }} /> : <AddIcon sx={{ mr: 1 }} />}
          {expanded ? 'Write Your Review' : 'Add a Review'}
        </Typography>
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          toggleForm();
        }} sx={{ color: expanded ? 'white' : 'action.active' }}>
          {expanded ? <CloseIcon /> : <EditIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Divider />
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Your review has been submitted successfully!
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="subtitle1" gutterBottom>
              Your Rating
            </Typography>
            <Rating
              name="rating"
              value={formData.rating}
              onChange={handleRatingChange}
              precision={0.5}
              size="large"
              icon={<StarIcon fontSize="inherit" />}
              emptyIcon={<StarBorderIcon fontSize="inherit" />}
              sx={{ fontSize: '2rem', mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {formData.rating > 0 ? `${formData.rating} out of 5 stars` : 'Click to rate'}
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            label="Review Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            placeholder="Summarize your experience"
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
          
          <TextField
            fullWidth
            label="Review Comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            multiline
            rows={4}
            placeholder="Share your thoughts about this bike"
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              sx={{ 
                borderRadius: 28,
                px: 3,
                py: 1,
                fontWeight: 'medium',
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ReviewForm;