// frontend/src/components/dashboard/Dashboard.js
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { OrdersContext } from '../context/OrdersContext';
import './Dashboard.css';

function Dashboard() {
  const { authState, logout } = useContext(AuthContext);
  const { user } = authState;
  const { getUpcomingRentals, getRecentOrders, loading: ordersLoading } = useContext(OrdersContext);
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Get upcoming bookings from the orders context
  const upcomingBookings = getUpcomingRentals ? getUpcomingRentals() : [];
  
  // Get recent orders
  const recentOrders = getRecentOrders ? getRecentOrders(3) : [];

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
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate duration between two dates in days
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
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
                      Here's an overview of your upcoming bookings and recent orders.
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
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Upcoming Bookings</h5>
              </div>
              <div className="card-body">
                {ordersLoading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : upcomingBookings.length === 0 ? (
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
                            <td>{formatDate(booking.startDate)}</td>
                            <td>{booking.bikeName}</td>
                            <td>{booking.location ? booking.location.name : 'N/A'}</td>
                            <td>{calculateDuration(booking.startDate, booking.endDate)}</td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <Link 
                                  to={`/bikes/${booking.bikeId}`} 
                                  className="btn btn-outline-primary"
                                >
                                  View Bike
                                </Link>
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

            {/* Recent Orders */}
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Recent Orders</h5>
              </div>
              <div className="card-body">
                {ordersLoading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <p className="text-center text-muted py-3">No recent orders found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map(order => (
                          <tr key={order.id}>
                            <td>#{order.id.substring(order.id.length - 6).toUpperCase()}</td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</td>
                            <td>${order.total.toFixed(2)}</td>
                            <td>
                              <span className={`badge bg-${
                                order.status === 'pending' ? 'warning' :
                                order.status === 'processing' ? 'primary' :
                                order.status === 'shipped' ? 'info' :
                                order.status === 'delivered' ? 'success' :
                                order.status === 'cancelled' ? 'danger' :
                                'secondary'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="text-center mt-3">
                      <Link to="/profile" className="btn btn-outline-primary btn-sm" onClick={() => navigate('/profile')}>
                        View All Orders
                      </Link>
                    </div>
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
                  <Link to="/profile" className="list-group-item list-group-item-action">
                    <i className="bi bi-person me-2"></i> Profile Settings
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