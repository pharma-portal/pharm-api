import express from 'express';
import {
  getCategories,
  getCategoryTree,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesForDropdown,
  getFlatCategories,
  getCategoriesByType
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadCategoryImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/dropdown', getCategoriesForDropdown);
router.get('/flat', getFlatCategories);
router.get('/type/:type', getCategoriesByType);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', protect, admin, uploadCategoryImage, createCategory);
router.route('/:id')
  .put(protect, admin, uploadCategoryImage, updateCategory)
  .delete(protect, admin, deleteCategory);

export default router; 