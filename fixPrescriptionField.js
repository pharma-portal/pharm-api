import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/orderModel.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  });

const fixPrescriptionField = async () => {
  try {
    // Order ID from your data
    const orderId = '6810a2517d901330d266b6d7';
    
    console.log('Looking for order with ID:', orderId);
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.error('Order not found');
      process.exit(1);
    }
    
    console.log('Found order:', order._id);
    console.log('Order items count:', order.orderItems.length);
    
    // Debug full order data
    console.log('Order data:', JSON.stringify(order, null, 2));
    
    // Check each order item and update prescription field if needed
    let updated = false;
    order.orderItems.forEach(item => {
      console.log('Item:', item._id);
      console.log('Item data:', JSON.stringify(item, null, 2));
      
      if (item.prescription && !item.prescriptionFile) {
        console.log('Updating prescription field for item:', item._id);
        item.prescriptionFile = item.prescription;
        updated = true;
      }
    });
    
    if (updated) {
      // Save the updated order
      await order.save();
      console.log('Order updated successfully with prescriptionFile field');
    } else {
      console.log('No updates needed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

fixPrescriptionField(); 