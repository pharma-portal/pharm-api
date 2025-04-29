import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Cart from './models/cartModel.js';
import User from './models/userModel.js';
import Drug from './models/drugModel.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

const checkCart = async () => {
  try {
    // Find all carts
    const carts = await Cart.find({});
    
    console.log(`Found ${carts.length} carts in the database`);
    
    if (carts.length === 0) {
      console.log('No carts found in the database');
      
      // Find a user to check their ID
      const user = await User.findOne({});
      if (user) {
        console.log(`Sample user ID to check for cart: ${user._id}`);
      }
    } else {
      // Display cart details
      for (const cart of carts) {
        console.log(`\nCart ID: ${cart._id}`);
        console.log(`User ID: ${cart.user}`);
        console.log(`Items: ${cart.items.length}`);
        console.log(`Total Amount: ${cart.totalAmount}`);
        
        // Display items details
        if (cart.items.length > 0) {
          console.log('\nItems in cart:');
          for (const item of cart.items) {
            console.log(`\nItem ID: ${item._id}`);
            console.log(`Drug ID: ${item.drug}`);
            console.log(`Quantity: ${item.quantity}`);
            console.log(`Price: ${item.price}`);
            console.log(`Requires Prescription: ${item.requiresPrescription}`);
            console.log(`Prescription File: ${item.prescriptionFile || 'None'}`);
          }
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

checkCart(); 