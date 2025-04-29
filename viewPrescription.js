import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/orderModel.js';
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

const viewPrescription = async () => {
  try {
    // Get the latest order
    const order = await Order.findOne({}).sort({ createdAt: -1 });
    if (!order) {
      console.error('No order found');
      process.exit(1);
    }
    
    console.log('Latest Order ID:', order._id);
    
    // Get the order items
    if (order.orderItems.length === 0) {
      console.error('No items in the order');
      process.exit(1);
    }
    
    // For each order item
    for (const item of order.orderItems) {
      console.log('\nOrder Item ID:', item._id);
      console.log('Item Name:', item.name);
      
      // Get the drug to check if it requires prescription
      const drug = await Drug.findById(item.drug);
      if (!drug) {
        console.log('Drug not found');
        continue;
      }
      
      console.log('Requires Prescription:', drug.requiresPrescription ? 'Yes' : 'No');
      
      if (drug.requiresPrescription) {
        if (item.prescriptionFile) {
          console.log('Prescription File:', item.prescriptionFile);
          console.log('Prescription Verified:', item.prescriptionVerified ? 'Yes' : 'No');
          
          console.log('\nTo view this prescription, use:');
          console.log(`GET http://localhost:5600/api/orders/${order._id}/prescription/${item._id}`);
          console.log('Authorization: Bearer YOUR_TOKEN');
        } else {
          console.log('No prescription file found for this item');
        }
      } else {
        console.log('This drug does not require a prescription');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

viewPrescription(); 