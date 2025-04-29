import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadProductImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.route('/')
  .get(getProducts);

router.get('/top', getTopProducts);

router.route('/:id')
  .get(getProductById);

// Protected routes (require authentication)
router.route('/:id/reviews')
  .post(protect, createProductReview);

// Admin routes
router.route('/')
  .post(protect, admin, uploadProductImage, createProduct);

router.route('/:id')
  .put(protect, admin, uploadProductImage, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router; 