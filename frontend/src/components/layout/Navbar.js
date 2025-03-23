// frontend/src/components/layout/Navbar.js
import React, { useContext, useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { authState, logout } = useContext(AuthContext);
  const { isAuthenticated, user } = authState;
  const navigate = useNavigate();
  const navbarCollapseRef = useRef(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Close toast after 3 seconds
  useEffect(() => {
    let timer;
    if (showToast) {
      timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showToast]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setShowToast(true);
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Function to close mobile navbar after clicking a link
  const closeNavbar = () => {
    if (window.innerWidth < 992) { // Bootstrap lg breakpoint
      if (navbarCollapseRef.current && navbarCollapseRef.current.classList.contains('show')) {
        // Get the navbar toggler button and click it to close the navbar
        document.querySelector('.navbar-toggler')?.click();
      }
    }
  };

  // Navigation handler to ensure route changes work correctly
  const handleNavigation = (path) => {
    closeNavbar();
    navigate(path);
  };

  const guestLinks = (
    <>
      <li className="nav-item">
        <Link className="nav-link" to="/login" onClick={() => handleNavigation('/login')}>Login</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/register" onClick={() => handleNavigation('/register')}>Register</Link>
      </li>
    </>
  );

  const authLinks = (
    <>
      {user && user.role === 'admin' && (
        <li className="nav-item">
          <Link className="nav-link" to="/admin" onClick={() => handleNavigation('/admin')}>Admin Panel</Link>
        </li>
      )}
      <li className="nav-item">
        <Link className="nav-link" to="/dashboard" onClick={() => handleNavigation('/dashboard')}>Dashboard</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/cart" onClick={() => handleNavigation('/cart')}>
          <i className="bi bi-cart"></i> Cart
        </Link>
      </li>
      <li className="nav-item dropdown">
        <a 
          className="nav-link dropdown-toggle" 
          href="#" 
          id="navbarDropdown" 
          role="button" 
          data-bs-toggle="dropdown" 
          aria-expanded="false"
        >
          <span className="user-avatar">{user && user.username ? user.username.charAt(0).toUpperCase() : ''}</span>
          {user && user.username}
        </a>
        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
          <li><Link className="dropdown-item" to="/profile" onClick={() => handleNavigation('/profile')}>Profile</Link></li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button className="dropdown-item logout-btn" onClick={handleLogoutClick}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </li>
        </ul>
      </li>
    </>
  );

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/" onClick={() => handleNavigation('/')}>Bike Rent & Shop</Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav" ref={navbarCollapseRef}>
            <ul className="navbar-nav main-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={() => handleNavigation('/')}>Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/bikes" onClick={() => handleNavigation('/bikes')}>Bikes</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/shop" onClick={() => handleNavigation('/shop')}>Shop</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/rentals" onClick={() => handleNavigation('/rentals')}>Rentals</Link>
              </li>
            </ul>
            <ul className="navbar-nav auth-nav">
              {isAuthenticated ? authLinks : guestLinks}
            </ul>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Logout</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={cancelLogout}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to log out?</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={cancelLogout}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={confirmLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
          <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
              <strong className="me-auto">Bike Rent & Shop</strong>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowToast(false)}
              ></button>
            </div>
            <div className="toast-body">
              <i className="bi bi-check-circle-fill text-success me-2"></i>
              You have been successfully logged out.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;