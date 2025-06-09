import express from 'express';
import {
  createReview,
  getItemReviews,
  deleteReview
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:itemType/:itemId')
  .get(getItemReviews)
  .post(protect, createReview);

router.route('/:id')
  .delete(protect, deleteReview);

export default router; 