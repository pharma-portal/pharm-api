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

// Debug middleware to log all cart route requests
router.use((req, res, next) => {
  console.log(`🔍 Cart Route Request: ${req.method} ${req.originalUrl}`);
  console.log(`📍 Path: ${req.path}`);
  console.log(`🔗 Full URL: ${req.originalUrl}`);
  next();
});

// Get cart and clear cart routes
router.route('/')
  .get(optionalAuth, getCart)
  .delete(optionalAuth, clearCart);

// EXPLICIT ROUTES - Order matters! More specific routes must come first
// Add prescription drug to cart (with prescription file) - MOST SPECIFIC
router.post('/drug/prescription', optionalAuth, uploadPrescription, addDrugToCart);

// Add non-prescription drug to cart
router.post('/drug', optionalAuth, addDrugToCart);

// Add mart product to cart
router.post('/product', optionalAuth, addProductToCart);

// Update and remove cart item routes - LEAST SPECIFIC (must come last)
router.route('/:id')
  .put(optionalAuth, updateCartItem)
  .delete(optionalAuth, removeFromCart);

// Debug: Log all registered routes
console.log('🚀 Cart Routes Registered:');
console.log('  POST /drug/prescription');
console.log('  POST /drug');
console.log('  POST /product');
console.log('  GET /');
console.log('  DELETE /');
console.log('  PUT /:id');
console.log('  DELETE /:id');

export default router; 