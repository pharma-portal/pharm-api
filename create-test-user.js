import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import connectDB from './config/db.js';

dotenv.config();

const createTestUser = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      // Force update password
      existingUser.password = 'password123';
      existingUser.role = 'user';
      await existingUser.save();
      console.log('Test user updated with new password');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    } else {
      // Create new test user
      const testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        role: 'user'
      });
      console.log('Test user created successfully');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createTestUser();
