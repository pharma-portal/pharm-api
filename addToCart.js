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
    console.log('🚀 Starting add to cart process...');
    
    // Find the drug
    const drug = await Drug.findOne({ name: 'Amoxicillin' });
    if (!drug) {
      console.error('❌ Drug not found');
      process.exit(1);
    }
    
    console.log('✅ Drug found:', {
      id: drug._id,
      name: drug.name,
      price: drug.price,
      requiresPrescription: drug.requiresPrescription,
      inStock: drug.inStock
    });
    
    // Get a user (assuming first user in DB)
    const user = await User.findOne({});
    if (!user) {
      console.error('❌ No user found');
      process.exit(1);
    }
    
    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      name: user.name
    });

    // Check if the user already has a cart
    let cart = await Cart.findOne({ user: user._id });
    console.log('📋 Existing cart:', cart ? 'Found' : 'Not found');
    
    // Handle prescription file
    let prescriptionFilePath = null;
    if (drug.requiresPrescription) {
      const prescriptionFilePath = path.join(process.cwd(), 'test-prescription.txt');
      
      if (!fs.existsSync(prescriptionFilePath)) {
        console.error('❌ Prescription file not found at:', prescriptionFilePath);
        process.exit(1);
      }
      
      // Move prescription to uploads folder
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const newFilePath = path.join(uploadDir, 'test-prescription.txt');
      fs.copyFileSync(prescriptionFilePath, newFilePath);
      prescriptionFilePath = newFilePath;
      
      console.log('✅ Prescription file handled:', prescriptionFilePath);
    }
    
    if (!cart) {
      // Create new cart with proper structure
      console.log('🆕 Creating new cart...');
      cart = new Cart({
        user: user._id,
        items: [{
          itemType: 'drug', // This was missing!
          drug: drug._id,
          quantity: 1,
          price: drug.price,
          prescriptionFile: prescriptionFilePath,
          requiresPrescription: drug.requiresPrescription
        }]
      });
    } else {
      console.log('📝 Updating existing cart...');
      // Check if the drug is already in the cart
      const existingItem = cart.items.find(
        item => item.itemType === 'drug' && item.drug && item.drug.toString() === drug._id.toString()
      );

      if (existingItem) {
        console.log('🔄 Updating existing item quantity...');
        existingItem.quantity += 1;
        if (prescriptionFilePath) {
          existingItem.prescriptionFile = prescriptionFilePath;
        }
      } else {
        console.log('➕ Adding new item to cart...');
        // Add new item to cart with proper structure
        cart.items.push({
          itemType: 'drug', // This was missing!
          drug: drug._id,
          quantity: 1,
          price: drug.price,
          prescriptionFile: prescriptionFilePath,
          requiresPrescription: drug.requiresPrescription
        });
      }
    }

    // Save the cart
    console.log('💾 Saving cart to database...');
    await cart.save();
    
    console.log('✅ Added to cart successfully!');
    console.log('📋 Cart details:');
    console.log({
      cartId: cart._id,
      userId: cart.user,
      totalAmount: cart.totalAmount,
      itemCount: cart.items.length,
      items: cart.items.map(item => ({
        itemType: item.itemType,
        drugId: item.drug,
        quantity: item.quantity,
        price: item.price,
        prescriptionFile: item.prescriptionFile,
        requiresPrescription: item.requiresPrescription
      }))
    });
    
    // Verify the cart was saved by fetching it again
    const savedCart = await Cart.findById(cart._id).populate('items.drug', 'name price');
    console.log('\n🔍 Verification - Retrieved cart from database:');
    console.log({
      cartId: savedCart._id,
      totalAmount: savedCart.totalAmount,
      items: savedCart.items.map(item => ({
        itemType: item.itemType,
        drugName: item.drug?.name || 'Unknown',
        quantity: item.quantity,
        price: item.price
      }))
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

addToCart(); 