import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/orderModel.js';
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

const createOrder = async () => {
  try {
    // Get a user
    const user = await User.findOne({});
    if (!user) {
      console.error('No user found');
      process.exit(1);
    }
    
    // Check if the user has a cart
    const cart = await Cart.findOne({ user: user._id }).populate('items.drug');
    if (!cart || cart.items.length === 0) {
      console.error('No items in cart');
      process.exit(1);
    }
    
    // Create order items from cart items
    const orderItems = cart.items.map(item => {
      return {
        name: item.drug.name,
        qty: item.quantity,
        image: item.drug.image || 'default-image.jpg',
        price: item.price,
        drug: item.drug._id,
        prescriptionFile: item.prescriptionFile,
        prescriptionVerified: false
      };
    });
    
    // Create a new order
    const order = new Order({
      user: user._id,
      orderItems: orderItems,
      shippingAddress: {
        address: '123 Test Street',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: 'credit_card',
      totalPrice: cart.totalAmount,
      status: 'pending',
      isPaid: false,
      isDelivered: false
    });
    
    const createdOrder = await order.save();
    
    console.log('Order created successfully!');
    console.log('Order details:');
    console.log({
      _id: createdOrder._id,
      user: createdOrder.user,
      orderItems: createdOrder.orderItems.map(item => ({
        _id: item._id,
        name: item.name,
        qty: item.qty,
        price: item.price,
        drug: item.drug,
        prescriptionFile: item.prescriptionFile,
        prescriptionVerified: item.prescriptionVerified
      })),
      totalPrice: createdOrder.totalPrice,
      status: createdOrder.status
    });
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createOrder(); 