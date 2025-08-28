import express from 'express';
import {
  getSalesAnalytics,
} from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All analytics routes are protected and admin-only
router.get('/sales', protect, admin, getSalesAnalytics);

export default router; 