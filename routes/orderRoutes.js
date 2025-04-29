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
  getPrescriptionDetails
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getOrders);

router.get('/myorders', protect, getMyOrders);

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

export default router; 