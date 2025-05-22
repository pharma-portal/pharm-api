import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB:', conn.connection.host);

    // First, find the user
    const existingUser = await User.findOne({ email: 'admin@alleypharmacy.com' });
    
    if (!existingUser) {
      console.log('User not found. Creating new admin user...');
      
      // Create new admin user
      const newAdmin = await User.create({
        name: 'Admin User',
        email: 'admin@alleypharmacy.com',
        password: 'admin123',
        phone: '1234567890',
        role: 'admin'
      });
      
      console.log('New admin user created:', {
        id: newAdmin._id,
        email: newAdmin.email,
        role: newAdmin.role
      });
    } else {
      console.log('User found. Updating to admin role...');
      
      // Update to admin role
      existingUser.role = 'admin';
      await existingUser.save();
      
      console.log('User updated successfully:', {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

makeAdmin(); 