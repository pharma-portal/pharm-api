import asyncHandler from 'express-async-handler';
import GuestOrder from '../models/guestOrderModel.js';
import Drug from '../models/drugModel.js';

// @desc    Create guest order
// @route   POST /api/guest/orders
// @access  Public
const createGuestOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    email,
    name,
    phone
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Verify stock and check prescriptions for each item
  for (const item of orderItems) {
    const drug = await Drug.findById(item.drugId);
    if (!drug) {
      res.status(404);
      throw new Error(`Drug not found: ${item.drugId}`);
    }

    // Check if prescription is required but not provided
    if (drug.requiresPrescription && !item.prescription) {
      res.status(400);
      throw new Error(`Prescription required for ${drug.name}`);
    }

    // Check stock
    if (drug.inStock < item.quantity) {
      res.status(400);
      throw new Error(`Not enough stock for ${drug.name}`);
    }
  }

  // Calculate total price and create order items array
  let totalPrice = 0;
  const processedOrderItems = await Promise.all(orderItems.map(async (item) => {
    const drug = await Drug.findById(item.drugId);
    totalPrice += drug.price * item.quantity;
    return {
      drug: item.drugId,
      name: drug.name,
      quantity: item.quantity,
      price: drug.price,
      prescription: item.prescription
    };
  }));

  const order = new GuestOrder({
    orderItems: processedOrderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
    email,
    name,
    phone
  });

  // Update stock levels
  for (const item of orderItems) {
    const drug = await Drug.findById(item.drugId);
    drug.inStock -= item.quantity;
    await drug.save();
  }

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Get guest order by ID and email
// @route   GET /api/guest/orders/:id
// @access  Public
const getGuestOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email } = req.query;

  if (!email) {
    res.status(400);
    throw new Error('Please provide your email');
  }

  const order = await GuestOrder.findOne({
    _id: id,
    email: email.toLowerCase()
  });

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Cancel guest order
// @route   PUT /api/guest/orders/:id/cancel
// @access  Public
const cancelGuestOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide your email');
  }

  const order = await GuestOrder.findOne({
    _id: id,
    email: email.toLowerCase()
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
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

  res.json({ message: 'Order cancelled successfully' });
});

export {
  createGuestOrder,
  getGuestOrder,
  cancelGuestOrder
}; 