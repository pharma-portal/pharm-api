import express from 'express';
import {
  createGuestOrder,
  getGuestOrder,
  cancelGuestOrder
} from '../controllers/guestOrderController.js';
import { uploadPrescription } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(uploadPrescription, createGuestOrder);

router.route('/:id')
  .get(getGuestOrder);

router.route('/:id/cancel')
  .put(cancelGuestOrder);

export default router; 