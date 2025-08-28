import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import drugRoutes from './routes/drugRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import hubtelCallbackRoutes from './routes/hubtelCallbackRoutes.js';
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

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`🌐 Incoming Request: ${req.method} ${req.originalUrl}`);
  console.log(`📍 Path: ${req.path}`);
  console.log(`🔗 Full URL: ${req.originalUrl}`);
  console.log(`📱 User Agent: ${req.get('User-Agent')}`);
  next();
});

// HTTP request logging
// Define tokens before using the middleware so we can include request body in logs
morgan.token('body', (req) => {
  try {
    const redactKeys = new Set(['password', 'confirmpassword', 'token', 'authorization', 'secret', 'clientsecret', 'apikey', 'api_key']);
    const safeBody = {};
    if (req && req.body && typeof req.body === 'object') {
      for (const key of Object.keys(req.body)) {
        if (redactKeys.has(String(key).toLowerCase())) {
          safeBody[key] = '[REDACTED]';
        } else {
          safeBody[key] = req.body[key];
        }
      }
    }
    const body = JSON.stringify(safeBody);
    return body && body.length > 500 ? body.slice(0, 500) + '…' : body;
  } catch (e) {
    return '-';
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  // Includes method, url, status, response time and a truncated body
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms body::body'));
}

// Pharmacy routes
app.use('/api/users', userRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/drugs', drugRoutes);

app.use('/api/cart', cartRoutes);

app.use('/api/orders', orderRoutes);

app.use('/api/hubtel-callback', hubtelCallbackRoutes);

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

const PORT = process.env.PORT;

// Function to list all registered routes
const listRoutes = () => {
  console.log('\n🚀 All Registered Routes:');
  console.log('='.repeat(50));
  
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the app
      const methods = Object.keys(middleware.route.methods);
      console.log(`${methods.join(',').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      // Router middleware
      const baseUrl = middleware.regexp.source.replace('^\\/','').replace('\\/?(?=\\/|$)','');
      if (baseUrl) {
        console.log(`📁 Router mounted at: /${baseUrl}`);
      }
    }
  });
  
  console.log('='.repeat(50));
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // List all routes after server starts
  setTimeout(listRoutes, 1000);
}); 