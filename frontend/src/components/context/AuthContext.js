import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    user: null,
    loading: true
  });

  // Load user data on first render or when token changes
  useEffect(() => {
    const loadUser = async () => {
      // Check if token exists in localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAuthState({
          token: null,
          isAuthenticated: false,
          user: null,
          loading: false
        });
        return;
      }
      
      // Set token in axios headers
      axios.defaults.headers.common['x-auth-token'] = token;
      
      try {
        // Get user data
        const res = await axios.get('/api/users/me');
        
        setAuthState({
          token,
          isAuthenticated: true,
          user: res.data,
          loading: false
        });
      } catch (err) {
        // Token might be invalid or expired
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        
        setAuthState({
          token: null,
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    };

    loadUser();
  }, []);

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    
    setAuthState({
      token: null,
      isAuthenticated: false,
      user: null,
      loading: false
    });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        setAuthState,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;