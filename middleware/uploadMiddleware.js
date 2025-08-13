import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import fs from 'fs';

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

// Configure Cloudinary storage for mart product images
const productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mart/products',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
    }
});

// Configure Cloudinary storage for mart category images
const categoryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mart/categories',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 600, height: 400, crop: 'limit' }]
    }
});

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images and PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDFs are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
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

// Middleware for category image upload
export const uploadCategoryImage = multer({
    storage: categoryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Please upload an image file.'), false);
        }
    }
}).single('image');

// Middleware for prescription upload
export const uploadPrescription = multer({
    storage: prescriptionStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for prescriptions
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Please upload an image or PDF file.'), false);
        }
    }
}).single('prescriptionFile');

// Middleware for product images upload
export const uploadProductImages = multer({
    storage: productStorage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Please upload an image file.'), false);
        }
    }
}).array('images', 5); // Max 5 images per product

// Middleware for single product image upload
export const uploadProductImage = multer({
    storage: productStorage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Please upload an image file.'), false);
        }
    }
}).single('image');

export { 
    uploadDrugImage
}; 

export default upload; 