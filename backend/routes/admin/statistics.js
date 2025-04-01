// backend/routes/admin/statistics.js
const express = require('express');
const router = express.Router();
const adminMiddleware = require('../../middleware/adminMiddleware');
const Order = require('../../models/Orders');
const Bike = require('../../models/Bikes');
const User = require('../../models/Users');
const Review = require('../../models/Review');

// @route   GET /api/admin/statistics/overview
// @desc    Get overview statistics for admin dashboard
// @access  Admin
router.get('/overview', adminMiddleware, async (req, res) => {
  try {
    // Get counts
    const userCount = await User.countDocuments();
    const bikeCount = await Bike.countDocuments();
    const orderCount = await Order.countDocuments();
    const reviewCount = await Review.countDocuments();

    // Get total revenue
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Get recent user registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Get pending orders count
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Get completed orders (delivered status)
    const completedOrders = await Order.countDocuments({ status: 'delivered' });

    // Get top selling bikes (for purchases only)
    const topSellingBikes = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.type': 'purchase' } },
      { $group: { 
          _id: '$items.bike', 
          totalSold: { $sum: '$items.quantity' } 
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: {
          from: 'bikes',
          localField: '_id',
          foreignField: '_id',
          as: 'bikeInfo'
        }
      },
      { $project: {
          _id: 1,
          totalSold: 1,
          name: { $arrayElemAt: ['$bikeInfo.name', 0] },
          type: { $arrayElemAt: ['$bikeInfo.type', 0] }
        }
      }
    ]);

    // Get top rental bikes
    const topRentalBikes = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.type': 'rental' } },
      { $group: { 
          _id: '$items.bike', 
          totalRented: { $sum: 1 } 
        }
      },
      { $sort: { totalRented: -1 } },
      { $limit: 5 },
      { $lookup: {
          from: 'bikes',
          localField: '_id',
          foreignField: '_id',
          as: 'bikeInfo'
        }
      },
      { $project: {
          _id: 1,
          totalRented: 1,
          name: { $arrayElemAt: ['$bikeInfo.name', 0] },
          type: { $arrayElemAt: ['$bikeInfo.type', 0] }
        }
      }
    ]);

    // Get monthly revenue for the current year
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          createdAt: { 
            $gte: new Date(`${currentYear}-01-01`), 
            $lt: new Date(`${currentYear+1}-01-01`) 
          } 
        } 
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format monthly revenue for all months (including zero revenue months)
    const formattedMonthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const foundMonth = monthlyRevenue.find(item => item._id === month);
      return {
        month,
        name: new Date(0, i).toLocaleString('default', { month: 'short' }),
        revenue: foundMonth ? foundMonth.revenue : 0
      };
    });

    // Send statistics
    res.json({
      counts: {
        users: userCount,
        bikes: bikeCount,
        orders: orderCount,
        reviews: reviewCount,
        pendingOrders,
        completedOrders,
        newUsers
      },
      revenue: {
        total: totalRevenue,
        monthly: formattedMonthlyRevenue
      },
      topProducts: {
        purchases: topSellingBikes,
        rentals: topRentalBikes
      }
    });
  } catch (err) {
    console.error('Error fetching admin statistics:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/admin/statistics/sales
// @desc    Get detailed sales statistics
// @access  Admin
router.get('/sales', adminMiddleware, async (req, res) => {
  try {
    // Get sales by type (purchase vs rental)
    const salesByType = await Order.aggregate([
      { $unwind: '$items' },
      { 
        $group: { 
          _id: '$items.type', 
          count: { $sum: 1 },
          revenue: { $sum: '$items.price' }
        }
      }
    ]);

    // Get sales by bike type
    const salesByBikeType = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'bikes',
          localField: 'items.bike',
          foreignField: '_id',
          as: 'bikeInfo'
        }
      },
      {
        $group: {
          _id: { $arrayElemAt: ['$bikeInfo.type', 0] },
          count: { $sum: 1 },
          revenue: { $sum: '$items.price' }
        }
      },
      { $match: { _id: { $ne: null } } }
    ]);

    // Get sales trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySales = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: twelveMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          purchases: {
            $sum: {
              $size: {
                $filter: {
                  input: '$items',
                  as: 'item',
                  cond: { $eq: ['$$item.type', 'purchase'] }
                }
              }
            }
          },
          rentals: {
            $sum: {
              $size: {
                $filter: {
                  input: '$items',
                  as: 'item',
                  cond: { $eq: ['$$item.type', 'rental'] }
                }
              }
            }
          },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly sales for all months (including zero sales months)
    const formattedMonthlySales = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const foundMonth = monthlySales.find(
        item => item._id.year === year && item._id.month === month
      );
      
      formattedMonthlySales.unshift({
        date: `${year}-${month.toString().padStart(2, '0')}`,
        name: date.toLocaleString('default', { month: 'short' }),
        purchases: foundMonth ? foundMonth.purchases : 0,
        rentals: foundMonth ? foundMonth.rentals : 0,
        revenue: foundMonth ? foundMonth.revenue : 0
      });
    }

    res.json({
      salesByType,
      salesByBikeType,
      monthlySales: formattedMonthlySales
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;