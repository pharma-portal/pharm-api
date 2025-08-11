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

const testCart = async () => {
  try {
    console.log('🧪 Testing Cart Functionality...\n');
    
    // Test 1: Check if users exist
    console.log('📋 Test 1: Checking users...');
    const users = await User.find({}).limit(3);
    console.log(`Found ${users.length} users`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user._id}`);
    });
    
    // Test 2: Check if drugs exist
    console.log('\n💊 Test 2: Checking drugs...');
    const drugs = await Drug.find({}).limit(3);
    console.log(`Found ${drugs.length} drugs`);
    drugs.forEach(drug => {
      console.log(`  - ${drug.name} - $${drug.price} - Prescription: ${drug.requiresPrescription}`);
    });
    
    // Test 3: Check existing carts
    console.log('\n🛒 Test 3: Checking existing carts...');
    const carts = await Cart.find({}).populate('user', 'name email').populate('items.drug', 'name price');
    console.log(`Found ${carts.length} carts`);
    
    if (carts.length > 0) {
      carts.forEach((cart, index) => {
        console.log(`\nCart ${index + 1}:`);
        console.log(`  User: ${cart.user?.name || 'Unknown'} (${cart.user?.email || 'Unknown'})`);
        console.log(`  Total Amount: $${cart.totalAmount}`);
        console.log(`  Items: ${cart.items.length}`);
        cart.items.forEach((item, itemIndex) => {
          console.log(`    Item ${itemIndex + 1}:`);
          console.log(`      Type: ${item.itemType}`);
          console.log(`      Drug: ${item.drug?.name || 'Unknown'}`);
          console.log(`      Quantity: ${item.quantity}`);
          console.log(`      Price: $${item.price}`);
          console.log(`      Requires Prescription: ${item.requiresPrescription}`);
        });
      });
    } else {
      console.log('  No carts found in database');
    }
    
    // Test 4: Check cart model structure
    console.log('\n🔍 Test 4: Cart Model Structure...');
    const cartSchema = Cart.schema.obj;
    console.log('Cart Schema fields:');
    Object.keys(cartSchema).forEach(field => {
      console.log(`  - ${field}: ${cartSchema[field].type}`);
    });
    
    // Test 5: Try to create a simple cart (without saving)
    console.log('\n🧪 Test 5: Testing cart creation (validation only)...');
    if (users.length > 0 && drugs.length > 0) {
      const testCart = new Cart({
        user: users[0]._id,
        items: [{
          itemType: 'drug',
          drug: drugs[0]._id,
          quantity: 1,
          price: drugs[0].price,
          requiresPrescription: drugs[0].requiresPrescription
        }]
      });
      
      // Validate without saving
      const validationError = testCart.validateSync();
      if (validationError) {
        console.log('❌ Cart validation failed:');
        console.log(validationError.message);
      } else {
        console.log('✅ Cart validation passed');
        console.log('  Sample cart structure is valid');
      }
    }
    
    console.log('\n✨ Cart testing completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during cart testing:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

testCart(); 