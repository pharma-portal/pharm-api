import express from 'express';
import {
  loginAdmin,
  updateAdminPassword,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.put('/password', protect, admin, updateAdminPassword);
router.get('/orders', protect, admin, getAllOrders);
router.put('/orders/:id', protect, admin, updateOrderStatus);
router.get('/dashboard', protect, admin, getDashboardStats);

export default router; 