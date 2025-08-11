import express from 'express';
import {
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
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getOrders);

router.get('/myorders', protect, getMyOrders);

// Hubtel routes
router.get('/hubtel/all', protect, admin, getOrdersWithHubtelStatus);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/pay')
  .put(protect, updateOrderToPaid);

router.route('/:id/deliver')
  .put(protect, admin, updateOrderToDelivered);

router.route('/:id/verify-prescription/:itemId')
  .put(protect, admin, verifyPrescription);

router.route('/:id/prescription/:itemId')
  .get(protect, getPrescriptionDetails);

router.route('/:id/cancel')
  .put(protect, cancelOrder);

// Hubtel status routes
router.route('/:id/hubtel-status')
  .get(protect, checkHubtelStatus);

router.route('/:id/hubtel-transaction')
  .put(protect, updateHubtelTransaction);

// New Hubtel transaction status check route
router.route('/hubtel/status/:transactionId')
  .get(protect, checkHubtelTransactionStatus);

export default router; 