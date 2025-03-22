// frontend/src/components/layout/Navbar.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css'; // Import the CSS file

function Navbar() {
  const { authState, logout } = useContext(AuthContext);
  const { isAuthenticated, user } = authState;

  const handleLogout = () => {
    logout();
  };

  const guestLinks = (
    <>
      <li className="nav-item">
        <Link className="nav-link" to="/login">Login</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/register">Register</Link>
      </li>
    </>
  );

  const authLinks = (
    <>
      {user && user.role === 'admin' && (
        <li className="nav-item">
          <Link className="nav-link" to="/admin">Admin Panel</Link>
        </li>
      )}
      <li className="nav-item">
        <Link className="nav-link" to="/dashboard">Dashboard</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/cart">
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
          <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <a className="dropdown-item" href="#!" onClick={handleLogout}>
              Logout
            </a>
          </li>
        </ul>
      </li>
    </>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Bike Rent & Shop</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav main-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/bikes">Bikes</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/rentals">Rentals</Link>
            </li>
          </ul>
          <ul className="navbar-nav auth-nav">
            {isAuthenticated ? authLinks : guestLinks}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;