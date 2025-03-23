// frontend/src/components/dashboard/Dashboard.js
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const { authState, logout } = useContext(AuthContext);
  const { user } = authState;
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Mock data for upcoming bookings

  const upcomingBookings = [
    { id: 101, date: '2023-06-28', bike: 'City Cruiser', location: 'New York City Store', duration: '2 days' }
  ];

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };
  
  return (
    <div className="dashboard-container py-5">
      <div className="container">
        {/* User Welcome Section */}
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card shadow-sm welcome-card">
              <div className="card-body p-4">
                <div className="d-md-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="mb-1">Welcome back, {user?.username}!</h2>
                    <p className="text-muted mb-md-0">
                      Here's an overview of your upcoming bookings.
                    </p>
                  </div>
                  <div className="d-flex mt-3 mt-md-0">
                    <Link to="/shop" className="btn btn-primary me-2">
                      <i className="bi bi-cart-plus me-1"></i> Shop Bikes
                    </Link>
                    <Link to="/rentals" className="btn btn-success">
                      <i className="bi bi-bicycle me-1"></i> Rent a Bike
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8">

            {/* Upcoming Bookings */}
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Upcoming Bookings</h5>
              </div>
              <div className="card-body">
                {upcomingBookings.length === 0 ? (
                  <p className="text-center text-muted py-3">No upcoming bookings found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Bike</th>
                          <th>Location</th>
                          <th>Duration</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingBookings.map(booking => (
                          <tr key={booking.id}>
                            <td>{booking.date}</td>
                            <td>{booking.bike}</td>
                            <td>{booking.location}</td>
                            <td>{booking.duration}</td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-primary">
                                  Details
                                </button>
                                <button className="btn btn-outline-danger">
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="col-lg-4">
            {/* User Profile Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Your Profile</h5>
              </div>
              <div className="card-body">
                <div className="text-center mb-3">
                  <div className="avatar-placeholder mb-3">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <h5 className="mb-0">{user?.username}</h5>
                  <p className="text-muted">{user?.email}</p>
                </div>
                
                <hr />
                
                <div className="profile-details">
                  <div className="mb-2">
                    <small className="text-muted">Full Name</small>
                    <p className="mb-0">{user?.profile?.firstName} {user?.profile?.lastName || 'Not provided'}</p>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Phone</small>
                    <p className="mb-0">{user?.profile?.phone || 'Not provided'}</p>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Address</small>
                    <p className="mb-0">{user?.profile?.address || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="d-grid gap-2">
                  <Link to="/profile" className="btn btn-outline-primary">
                    <i className="bi bi-pencil-square me-1"></i> Edit Profile
                  </Link>
                  <button className="btn btn-outline-danger" onClick={handleLogoutClick}>
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                  </button>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Quick Links</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  <Link to="/bikes" className="list-group-item list-group-item-action">
                    <i className="bi bi-bicycle me-2"></i> Browse All Bikes
                  </Link>
                  <Link to="/shop" className="list-group-item list-group-item-action">
                    <i className="bi bi-cart me-2"></i> Shop
                  </Link>
                  <Link to="/rentals" className="list-group-item list-group-item-action">
                    <i className="bi bi-calendar-check me-2"></i> Rent a Bike
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="list-group-item list-group-item-action">
                      <i className="bi bi-gear me-2"></i> Admin Panel
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
    </div>
  );
}

export default Dashboard;