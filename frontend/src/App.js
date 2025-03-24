// App.js
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
import PrivateRouteWrapper from './components/routing/PrivateRouteWrapper';
import TestMUI from './components/pages/TestMUI';
import Shop from './components/pages/Shop';
import Rentals from './components/pages/Rentals';
import Bikes from './components/pages/Bikes';
import BikeDetail from './components/bikes/BikeDetail';
import { AuthProvider } from './components/context/AuthContext';
import theme from './theme'; // Import the theme we created
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
      <CssBaseline /> {/* Provides a consistent baseline with MUI styling */}
      <AuthProvider>
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
                <Route path="/shop" element={<Shop />} />
                <Route path="/rentals" element={<Rentals />} />
                <Route path="/bikes" element={<Bikes />} />
                <Route path="/bikes/:id" element={<BikeDetail />} />
              <Route path="/test" element={<TestMUI />} />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;