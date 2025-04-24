import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary storage for drug images
const drugStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pharmacy/drugs',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

// Configure Cloudinary storage for prescriptions
const prescriptionStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pharmacy/prescriptions',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        resource_type: 'auto'
    }
});

// Multer upload configuration for drug images
const uploadDrugImage = multer({
    storage: drugStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload only images.'), false);
        }
    }
}).single('image');

// Multer upload configuration for prescriptions
const uploadPrescription = multer({
    storage: prescriptionStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Please upload an image or PDF file.'), false);
        }
    }
}).single('prescription');

export { uploadDrugImage, uploadPrescription }; 