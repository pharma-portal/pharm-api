import asyncHandler from 'express-async-handler';
import Prescription from '../models/prescriptionModel.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// @desc    Upload a prescription
// @route   POST /api/prescriptions
// @access  Private
const uploadPrescription = asyncHandler(async (req, res) => {
  try {
    console.log('Request file:', req.file); // Debug log
    console.log('Request body:', req.body); // Debug log

    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a prescription file');
    }

    // The file is already uploaded to Cloudinary by multer-storage-cloudinary
    const prescription = await Prescription.create({
      user: req.user._id,
      image: req.file.path, // This is the Cloudinary URL
      notes: req.body.notes || ''
    });

    console.log('Created prescription:', prescription); // Debug log

    res.status(201).json(prescription);
  } catch (error) {
    console.error('Prescription upload error:', error); // Debug log
    res.status(500).json({
      message: error.message || 'Error uploading prescription',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// @desc    Get user's prescriptions
// @route   GET /api/prescriptions
// @access  Private
const getUserPrescriptions = asyncHandler(async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user._id })
      .sort('-createdAt');
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({
      message: 'Error fetching prescriptions',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// @desc    Get all prescriptions (admin only)
// @route   GET /api/prescriptions/all
// @access  Private/Admin
const getAllPrescriptions = asyncHandler(async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('user', 'name email')
      .sort('-createdAt');
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching all prescriptions:', error);
    res.status(500).json({
      message: 'Error fetching all prescriptions',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// @desc    Update prescription status
// @route   PUT /api/prescriptions/:id
// @access  Private/Admin
const updatePrescriptionStatus = asyncHandler(async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      res.status(404);
      throw new Error('Prescription not found');
    }

    prescription.status = status;
    prescription.adminNotes = adminNotes;

    const updatedPrescription = await prescription.save();
    res.json(updatedPrescription);
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({
      message: 'Error updating prescription',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private
const deletePrescription = asyncHandler(async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      res.status(404);
      throw new Error('Prescription not found');
    }

    // Check if user is the prescription owner or admin
    if (prescription.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized');
    }

    // Delete prescription image from cloudinary
    if (prescription.image) {
      await deleteFromCloudinary(prescription.image);
    }

    await prescription.deleteOne();
    res.json({ message: 'Prescription removed' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({
      message: 'Error deleting prescription',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export {
  uploadPrescription,
  getUserPrescriptions,
  getAllPrescriptions,
  updatePrescriptionStatus,
  deletePrescription
}; 