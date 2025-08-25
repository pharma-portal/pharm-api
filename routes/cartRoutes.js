import express from 'express';
import {
  getCart,
  addDrugToCart,
  addProductToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { uploadPrescription } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Get cart and clear cart routes
router.route('/')
  .get(optionalAuth, getCart)
  .delete(optionalAuth, clearCart);

// Add prescription drug to cart (with prescription file) - MUST come before /:id route
router.post('/drug/prescription', optionalAuth, uploadPrescription, addDrugToCart);

// Add non-prescription drug to cart
router.post('/drug', optionalAuth, addDrugToCart);

// Add mart product to cart
router.post('/product', optionalAuth, addProductToCart);

// Update and remove cart item routes - MUST come after specific routes
router.route('/:id')
  .put(optionalAuth, updateCartItem)
  .delete(optionalAuth, removeFromCart);

export default router; 