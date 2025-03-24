import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Paper, 
  Container 
} from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';

// This component wraps routes that require authentication and/or specific roles
const PrivateRouteWrapper = ({ children, requiredRole = null }) => {
  const { authState } = useContext(AuthContext);
  const { isAuthenticated, user, loading } = authState;

  // If still loading auth state, show a loading spinner
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <CircularProgress size={50} thickness={4} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verifying your access...
        </Typography>
      </Box>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role is required and user doesn't have the required role, show access denied
  if (requiredRole && (!user || user.role !== requiredRole)) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <LockIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" paragraph>
            Sorry, you don't have permission to access this page.
            This area requires admin privileges.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Navigate to="/" replace />
          </Box>
        </Paper>
      </Container>
    );
  }

  // If authenticated and has the required role (if any), render the children
  return children;
};

export default PrivateRouteWrapper;