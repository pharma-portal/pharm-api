import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/orderModel.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

const updateExistingOrders = async () => {
  try {
    console.log('Updating existing orders...');
    
    // Find all orders
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders to update`);
    
    let updatedCount = 0;
    
    // Update each order
    for (const order of orders) {
      let needsUpdate = false;
      
      // Check each order item
      for (const item of order.orderItems) {
        // If the item has no itemType but has a drug reference, it's a drug item
        if (!item.itemType && item.drug) {
          item.itemType = 'drug';
          needsUpdate = true;
        }
      }
      
      // If the order was modified, save it
      if (needsUpdate) {
        await order.save();
        updatedCount++;
      }
    }
    
    console.log(`Successfully updated ${updatedCount} orders`);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the migration
updateExistingOrders(); 