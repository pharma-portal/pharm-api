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
    const existingAdmin = await User.findOne({ email: 'admin@alleypharmacy.com' });
    if (existingAdmin) {
      // Force update password
      existingAdmin.password = 'admin123';
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin user updated with new password');
    } else {
      // Create new admin user
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@alleypharmacy.com',
        password: 'admin123',
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