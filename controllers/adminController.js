import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
import GuestOrder from '../models/guestOrderModel.js';
import { generateToken } from '../middleware/authMiddleware.js';

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await User.findOne({ email, role: 'admin' }).select('+password');
  if (admin && (await admin.matchPassword(password))) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid admin credentials');
  }
});

// @desc    Update admin password
// @route   PUT /api/admin/password
// @access  Private/Admin
const updateAdminPassword = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.user._id).select('+password');

  if (admin && (await admin.matchPassword(req.body.currentPassword))) {
    admin.password = req.body.newPassword;
    await admin.save();

    res.json({
      message: 'Password updated successfully'
    });
  } else {
    res.status(401);
    throw new Error('Invalid current password');
  }
});

// @desc    Get all orders (including guest orders)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  // Get regular user orders
  const userOrders = await Order.find({})
    .populate('user', 'id name email')
    .sort('-createdAt');

  // Get guest orders
  const guestOrders = await GuestOrder.find({})
    .sort('-createdAt');

  // Combine and format orders
  const allOrders = [
    ...userOrders.map(order => ({
      ...order.toObject(),
      orderType: 'registered',
      customerInfo: {
        name: order.user?.name || 'Unknown User',
        email: order.user?.email || 'No email',
        type: 'registered'
      }
    })),
    ...guestOrders.map(order => ({
      ...order.toObject(),
      orderType: 'guest',
      customerInfo: {
        name: order.name || 'Unknown Guest',
        email: order.email || 'No email',
        phone: order.phone || 'No phone',
        type: 'guest'
      }
    }))
  ].sort((a, b) => b.createdAt - a.createdAt);

  res.json(allOrders);
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  // Try to find in regular orders first
  let order = await Order.findById(req.params.id);
  let isGuestOrder = false;

  // If not found in regular orders, check guest orders
  if (!order) {
    order = await GuestOrder.findById(req.params.id);
    isGuestOrder = true;
  }

  if (order) {
    order.status = req.body.status || order.status;
    
    if (req.body.status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json({
      ...updatedOrder.toObject(),
      orderType: isGuestOrder ? 'guest' : 'registered'
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    userOrdersCount,
    guestOrdersCount,
    pendingUserOrders,
    pendingGuestOrders,
    totalUsers
  ] = await Promise.all([
    Order.countDocuments(),
    GuestOrder.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    GuestOrder.countDocuments({ status: 'pending' }),
    User.countDocuments({ role: 'user' })
  ]);

  const recentOrders = await Promise.all([
    // Get recent user orders
    Order.find({})
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(3),
    // Get recent guest orders
    GuestOrder.find({})
      .sort('-createdAt')
      .limit(2)
  ]);

  const combinedRecentOrders = [
    ...recentOrders[0].map(order => ({
      ...order.toObject(),
      orderType: 'registered'
    })),
    ...recentOrders[1].map(order => ({
      ...order.toObject(),
      orderType: 'guest'
    }))
  ].sort((a, b) => b.createdAt - a.createdAt)
   .slice(0, 5);

  res.json({
    totalOrders: userOrdersCount + guestOrdersCount,
    pendingOrders: pendingUserOrders + pendingGuestOrders,
    totalUsers,
    recentOrders: combinedRecentOrders
  });
});

export {
  loginAdmin,
  updateAdminPassword,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats
}; 