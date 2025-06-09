import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  uploadPrescription,
  getUserPrescriptions,
  getAllPrescriptions,
  updatePrescriptionStatus,
  deletePrescription
} from '../controllers/prescriptionController.js';
import { uploadPrescription as uploadPrescriptionMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// User routes (requires authentication)
router.post('/', protect, uploadPrescriptionMiddleware, uploadPrescription);
router.get('/', protect, getUserPrescriptions);
router.delete('/:id', protect, deletePrescription);

// Admin routes (requires admin privileges)
router.get('/all', protect, admin, getAllPrescriptions);
router.put('/:id', protect, admin, updatePrescriptionStatus);

export default router; 