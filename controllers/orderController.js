import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import Drug from '../models/drugModel.js';
import Product from '../models/productModel.js';
import hubtelService from '../utils/hubtelService.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingAddress,
    paymentMethod
  } = req.body;

  // Find user's cart
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.drug')
    .populate('items.product');
  
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  // Create order items from cart items
  const orderItems = cart.items.map(item => {
    // Common fields for both item types
    const orderItem = {
      qty: item.quantity,
      price: item.price,
      itemType: item.itemType
    };

    // Handle pharmacy drug items
    if (item.itemType === 'drug' && item.drug) {
      return {
        ...orderItem,
        name: item.drug.name,
        image: item.drug.image || 'default-drug.jpg',
        drug: item.drug._id,
        prescriptionFile: item.prescriptionFile,
        prescriptionVerified: false
      };
    } 
    // Handle mart product items
    else if (item.itemType === 'product' && item.product) {
      return {
        ...orderItem,
        name: item.product.name,
        image: item.product.image || 'default-product.jpg',
        product: item.product._id
      };
    }
  });

  // Create order
  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice: cart.totalAmount,
    status: 'pending',
    isPaid: false,
    isDelivered: false
  });

  const createdOrder = await order.save();

  // Clear the cart after order is created
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(201).json(createdOrder);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
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
      email_address: req.body.payer.email_address
    };

    const updatedOrder = await order.save();

    // Update stock levels for both drugs and products
    for (const item of order.orderItems) {
      if (item.itemType === 'drug' && item.drug) {
        const drug = await Drug.findById(item.drug);
        if (drug) {
          drug.countInStock -= item.qty;
          await drug.save();
        }
      } else if (item.itemType === 'product' && item.product) {
        const product = await Product.findById(item.product);
        if (product) {
          product.countInStock -= item.qty;
          await product.save();
        }
      }
    }

    // Clear user's cart
    await Cart.findOneAndDelete({ user: order.user });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Verify prescription for order item
// @route   PUT /api/orders/:id/verify-prescription/:itemId
// @access  Private/Admin
const verifyPrescription = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    const item = order.orderItems.id(req.params.itemId);

    if (item) {
      // Add itemType field if it doesn't exist (for backward compatibility)
      if (!item.itemType && item.drug) {
        item.itemType = 'drug';
      }
      
      item.prescriptionVerified = true;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order item not found');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Check if order belongs to user or user is admin
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401);
      throw new Error('Not authorized');
    }

    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      res.status(400);
      throw new Error('Order cannot be cancelled');
    }

    order.status = 'cancelled';

    // Restore stock levels if order was paid
    if (order.isPaid) {
      for (const item of order.orderItems) {
        if (item.itemType === 'drug' && item.drug) {
          const drug = await Drug.findById(item.drug);
          if (drug) {
            drug.countInStock += item.qty;
            await drug.save();
          }
        } else if (item.itemType === 'product' && item.product) {
          const product = await Product.findById(item.product);
          if (product) {
            product.countInStock += item.qty;
            await product.save();
          }
        }
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get prescription details for an order item
// @route   GET /api/orders/:id/prescription/:itemId
// @access  Private
const getPrescriptionDetails = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if the order belongs to the user
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const orderItem = order.orderItems.id(req.params.itemId);

  if (!orderItem) {
    res.status(404);
    throw new Error('Order item not found');
  }

  // Check if the drug requires a prescription
  const drug = await Drug.findById(orderItem.drug);
  
  if (!drug) {
    res.status(404);
    throw new Error('Drug not found');
  }
  
  if (!drug.requiresPrescription) {
    res.json({
      message: 'This drug does not require a prescription',
      requiresPrescription: false
    });
    return;
  }

  // Check both prescription and prescriptionFile fields
  const prescriptionUrl = orderItem.prescriptionFile || orderItem.prescription;
  
  if (!prescriptionUrl) {
    res.status(404);
    throw new Error('No prescription found for this item');
  }

  res.json({
    prescriptionFile: prescriptionUrl,
    prescriptionStatus: orderItem.prescriptionStatus || 'pending',
    prescriptionNotes: orderItem.prescriptionNotes || '',
    verificationDate: orderItem.prescriptionVerifiedAt,
    requiresPrescription: true
  });
});

// @desc    Check Hubtel transaction status
// @route   GET /api/orders/:id/hubtel-status
// @access  Private
const checkHubtelStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if the order belongs to the user or if user is admin
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Check if order has a Hubtel transaction ID
  if (!order.hubtelTransactionId) {
    res.status(400);
    throw new Error('No Hubtel transaction ID found for this order');
  }

  // Get optional parameters from query string
  const { clientReference, networkTransactionId } = req.query;

  try {
    const result = await hubtelService.updateOrderWithHubtelStatus(
      order, 
      order.hubtelTransactionId,
      clientReference,
      networkTransactionId
    );
    
    res.json({
      order: result.order,
      hubtelStatus: result.mappedStatus,
      hubtelResponse: result.hubtelResponse
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to check Hubtel status: ${error.message}`);
  }
});

// @desc    Update order with Hubtel transaction ID
// @route   PUT /api/orders/:id/hubtel-transaction
// @access  Private
const updateHubtelTransaction = asyncHandler(async (req, res) => {
  const { transactionId, clientReference, networkTransactionId } = req.body;

  if (!transactionId) {
    res.status(400);
    throw new Error('Transaction ID is required');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if the order belongs to the user or if user is admin
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Update order with Hubtel transaction ID
  order.hubtelTransactionId = transactionId;
  if (clientReference) order.hubtelClientReference = clientReference;
  if (networkTransactionId) order.hubtelNetworkTransactionId = networkTransactionId;
  await order.save();

  // Check Hubtel status immediately
  try {
    const result = await hubtelService.updateOrderWithHubtelStatus(
      order, 
      transactionId,
      clientReference,
      networkTransactionId
    );
    
    res.json({
      order: result.order,
      hubtelStatus: result.mappedStatus,
      hubtelResponse: result.hubtelResponse
    });
  } catch (error) {
    // If status check fails, still save the transaction ID but return error
    res.status(500);
    throw new Error(`Transaction ID saved but status check failed: ${error.message}`);
  }
});

// @desc    Get all orders with Hubtel status
// @route   GET /api/orders/hubtel/all
// @access  Private/Admin
const getOrdersWithHubtelStatus = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const count = await Order.countDocuments({ hubtelTransactionId: { $exists: true, $ne: null } });
  const orders = await Order.find({ hubtelTransactionId: { $exists: true, $ne: null } })
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Check Hubtel transaction status with new API format
// @route   GET /api/orders/hubtel/status/:transactionId
// @access  Private
const checkHubtelTransactionStatus = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const { clientReference, networkTransactionId } = req.query;

  if (!transactionId) {
    res.status(400);
    throw new Error('Transaction ID is required');
  }

  try {
    const hubtelResponse = await hubtelService.checkTransactionStatus(
      transactionId,
      clientReference,
      networkTransactionId
    );
    
    res.json({
      transactionId,
      hubtelResponse,
      mappedStatus: hubtelService.mapHubtelStatus(hubtelResponse.status)
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to check Hubtel transaction status: ${error.message}`);
  }
});

export {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  verifyPrescription,
  getMyOrders,
  getOrders,
  cancelOrder,
  getPrescriptionDetails,
  checkHubtelStatus,
  updateHubtelTransaction,
  getOrdersWithHubtelStatus,
  checkHubtelTransactionStatus
}; 