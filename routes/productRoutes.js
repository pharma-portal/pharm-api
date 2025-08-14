import express from 'express';
import {
  getProducts,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductCategories,
  getProductSubcategories
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadProductImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/all', getAllProducts);
router.get('/top', getTopProducts);

// Category routes for frontend dropdowns
router.get('/categories', getProductCategories);
router.get('/categories/:mainCategory/subcategories', getProductSubcategories);

router.route('/:id')
  .get(getProductById);

// Protected routes (require authentication)
router.route('/:id/reviews')
  .post(protect, createProductReview);

// Admin routes
router.post('/', protect, admin, uploadProductImage, createProduct);

router.route('/:id')
  .put(protect, admin, uploadProductImage, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router; 