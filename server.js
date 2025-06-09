import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import drugRoutes from './routes/drugRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import guestOrderRoutes from './routes/guestOrderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import scheduleStatusUpdates from './utils/orderStatusUpdater.js';

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Pharmacy routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/drugs', drugRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/guest/orders', guestOrderRoutes);

// Product routes (unified)
app.use('/api/products', productRoutes);

// Mart routes
app.use('/api/mart/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start automated order status updates
scheduleStatusUpdates();

const PORT = process.env.PORT || 5600;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 