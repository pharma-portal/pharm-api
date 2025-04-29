import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Drug from './models/drugModel.js';
import Cart from './models/cartModel.js';
import User from './models/userModel.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

const addToCart = async () => {
  try {
    // Find the drug
    const drug = await Drug.findOne({ name: 'Amoxicillin' });
    if (!drug) {
      console.error('Drug not found');
      process.exit(1);
    }
    
    // Get a user (assuming first user in DB)
    const user = await User.findOne({});
    if (!user) {
      console.error('No user found');
      process.exit(1);
    }

    // Check if the user already has a cart
    let cart = await Cart.findOne({ user: user._id });
    
    const prescriptionFilePath = path.join(process.cwd(), 'test-prescription.txt');
    
    if (!fs.existsSync(prescriptionFilePath)) {
      console.error('Prescription file not found at:', prescriptionFilePath);
      process.exit(1);
    }
    
    // Move prescription to uploads folder
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const newFilePath = path.join(uploadDir, 'test-prescription.txt');
    fs.copyFileSync(prescriptionFilePath, newFilePath);
    
    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: user._id,
        items: [{
          drug: drug._id,
          quantity: 1,
          price: drug.price,
          prescriptionFile: newFilePath,
          requiresPrescription: drug.requiresPrescription
        }]
      });
    } else {
      // Check if the drug is already in the cart
      const existingItem = cart.items.find(
        item => item.drug.toString() === drug._id.toString()
      );

      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.prescriptionFile = newFilePath;
      } else {
        // Add new item to cart
        cart.items.push({
          drug: drug._id,
          quantity: 1,
          price: drug.price,
          prescriptionFile: newFilePath,
          requiresPrescription: drug.requiresPrescription
        });
      }
    }

    await cart.save();
    
    console.log('Added to cart successfully!');
    console.log('Cart details:');
    console.log({
      userId: cart.user,
      items: cart.items.map(item => ({
        drugId: item.drug,
        quantity: item.quantity,
        price: item.price,
        prescriptionFile: item.prescriptionFile,
        requiresPrescription: item.requiresPrescription
      })),
      totalAmount: cart.totalAmount
    });
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

addToCart(); 