// frontend/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import AdminPanel from './components/admin/AdminPanel';
import CartPage from './components/cart/CartPage';
import ProfilePage from './components/profile/ProfilePage';
import PrivateRouteWrapper from './components/routing/PrivateRouteWrapper';
import TestMUI from './components/pages/TestMUI';
import Shop from './components/pages/Shop';
import Rentals from './components/pages/Rentals';
import Bikes from './components/pages/Bikes';
import BikeDetailMUI from './components/bikes/BikeDetailMUI';
import { AuthProvider } from './components/context/AuthContext';
import { FavoritesProvider } from './components/context/FavoritesContext';
import { CartProvider } from './components/context/CartContext';
import theme from './theme';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Component that scrolls to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <div className="App">
                <Navbar />
                <div className="container-fluid p-0">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route 
                      path="/dashboard" 
                      element={
                        <PrivateRouteWrapper>
                          <Dashboard />
                        </PrivateRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/admin" 
                      element={
                        <PrivateRouteWrapper requiredRole="admin">
                          <AdminPanel />
                        </PrivateRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/cart" 
                      element={
                        <PrivateRouteWrapper>
                          <CartPage />
                        </PrivateRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <PrivateRouteWrapper>
                          <ProfilePage />
                        </PrivateRouteWrapper>
                      } 
                    />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/rentals" element={<Rentals />} />
                    <Route path="/bikes" element={<Bikes />} />
                    <Route path="/bikes/:id" element={<BikeDetailMUI />} />
                    <Route path="/test" element={<TestMUI />} />
                  </Routes>
                </div>
              </div>
            </Router>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;