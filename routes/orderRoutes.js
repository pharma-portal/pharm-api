import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderToPaid,
  cancelOrder
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, getUserOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/pay')
  .put(protect, updateOrderToPaid);

router.route('/:id/cancel')
  .put(protect, cancelOrder);

export default router; 