import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import connectDB from './config/db.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@pharmacy.com' });
    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log('Admin user already exists');
      } else {
        // Update to admin if user exists but is not admin
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('User updated to admin role');
      }
    } else {
      // Create new admin user
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@pharmacy.com',
        password: 'admin123', // Will be hashed by the pre-save middleware
        phone: '1234567890',
        role: 'admin'
      });
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdminUser(); 