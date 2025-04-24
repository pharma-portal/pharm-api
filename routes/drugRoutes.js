import express from 'express';
import {
  getDrugs,
  getDrugById,
  createDrug,
  updateDrug,
  deleteDrug,
  createDrugReview,
  getDrugsByCategory,
  getDrugsByBrand
} from '../controllers/drugController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadDrugImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getDrugs)
  .post(protect, admin, uploadDrugImage, createDrug);

router.route('/:id')
  .get(getDrugById)
  .put(protect, admin, uploadDrugImage, updateDrug)
  .delete(protect, admin, deleteDrug);

router.post('/:id/reviews', protect, createDrugReview);
router.get('/category/:category', getDrugsByCategory);
router.get('/brand/:brand', getDrugsByBrand);

export default router; 