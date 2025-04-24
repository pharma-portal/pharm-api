import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { uploadPrescription } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(optionalAuth, getCart)
  .post(optionalAuth, uploadPrescription, addToCart)
  .delete(optionalAuth, clearCart);

router.route('/:id')
  .put(optionalAuth, updateCartItem)
  .delete(optionalAuth, removeFromCart);

export default router; 