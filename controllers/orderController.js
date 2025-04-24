import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import Drug from '../models/drugModel.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.drug');

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('No items in cart');
  }

  // Verify stock and prescriptions
  for (const item of cart.items) {
    const drug = item.drug;
    if (drug.requiresPrescription && !item.prescription) {
      res.status(400);
      throw new Error(`Prescription required for ${drug.name}`);
    }
    if (drug.inStock < item.quantity) {
      res.status(400);
      throw new Error(`Not enough stock for ${drug.name}`);
    }
  }

  const orderItems = cart.items.map(item => ({
    drug: item.drug._id,
    name: item.drug.name,
    quantity: item.quantity,
    price: item.price,
    prescription: item.prescription
  }));

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress: req.body.shippingAddress,
    paymentMethod: req.body.paymentMethod,
    totalPrice: cart.totalAmount
  });

  // Update stock
  for (const item of cart.items) {
    const drug = await Drug.findById(item.drug._id);
    drug.inStock -= item.quantity;
    await drug.save();
  }

  // Clear cart
  cart.items = [];
  await cart.save();

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email');

  if (order && (order.user._id.toString() === req.user._id.toString() || req.user.role === 'admin')) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Update order payment status
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (order.status === 'delivered') {
    res.status(400);
    throw new Error('Cannot cancel delivered order');
  }

  // Restore stock
  for (const item of order.orderItems) {
    const drug = await Drug.findById(item.drug);
    drug.inStock += item.quantity;
    await drug.save();
  }

  order.status = 'cancelled';
  await order.save();

  res.json({ message: 'Order cancelled' });
});

export {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderToPaid,
  cancelOrder
}; 