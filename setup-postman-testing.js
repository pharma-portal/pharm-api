const axios = require('axios');

// Configuration - UPDATE THESE VALUES
const BASE_URL = 'http://localhost:5000/api';
const EMAIL = 'your_email@example.com'; // Replace with your email
const PASSWORD = 'your_password'; // Replace with your password

console.log('🚀 Postman Testing Setup Helper');
console.log('================================');

// Step 1: Login to get JWT token
const login = async () => {
  try {
    console.log('\n📝 Step 1: Logging in to get JWT token...');
    
    const response = await axios.post(`${BASE_URL}/users/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    
    const token = response.data.token;
    console.log('✅ Login successful!');
    console.log('🔑 JWT Token:', token);
    console.log('\n📋 Copy this token and update the "authToken" variable in Postman');
    
    return token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return null;
  }
};

// Step 2: Get available orders
const getOrders = async (token) => {
  try {
    console.log('\n📋 Step 2: Getting available orders...');
    
    const response = await axios.get(`${BASE_URL}/orders/myorders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const orders = response.data;
    console.log('✅ Orders retrieved successfully!');
    console.log(`📊 Found ${orders.length} orders`);
    
    if (orders.length > 0) {
      console.log('\n📋 Available Order IDs:');
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. Order ID: ${order._id}`);
        console.log(`      Total: $${order.totalPrice}`);
        console.log(`      Status: ${order.orderStatus}`);
        console.log(`      Date: ${new Date(order.createdAt).toLocaleDateString()}`);
        console.log('');
      });
      
      console.log('📋 Copy an Order ID and update the "orderId" variable in Postman');
    } else {
      console.log('⚠️  No orders found. You may need to create an order first.');
    }
    
    return orders;
  } catch (error) {
    console.error('❌ Failed to get orders:', error.response?.data?.message || error.message);
    return [];
  }
};

// Step 3: Show Postman setup instructions
const showPostmanInstructions = () => {
  console.log('\n📋 Step 3: Postman Setup Instructions');
  console.log('=====================================');
  console.log('1. Import the Hubtel_Testing_Collection.json into Postman');
  console.log('2. Click on the collection name "Hubtel Integration Testing"');
  console.log('3. Go to the "Variables" tab');
  console.log('4. Update these variables:');
  console.log('   - baseUrl: http://localhost:5000/api');
  console.log('   - authToken: [Your JWT token from Step 1]');
  console.log('   - orderId: [Order ID from Step 2]');
  console.log('   - transactionId: [Your Hubtel transaction ID]');
  console.log('   - clientReference: TEST_REF_123');
  console.log('\n5. Test the endpoints in order:');
  console.log('   - Get Available Orders');
  console.log('   - Check Order Hubtel Status');
  console.log('   - Update Order with Hubtel Transaction');
  console.log('   - Direct Transaction Status Check');
  console.log('   - Get All Orders with Hubtel Status (Admin)');
};

// Main execution
const main = async () => {
  if (EMAIL === 'your_email@example.com' || PASSWORD === 'your_password') {
    console.log('⚠️  Please update EMAIL and PASSWORD variables first!');
    return;
  }
  
  const token = await login();
  if (token) {
    await getOrders(token);
    showPostmanInstructions();
  }
  
  console.log('\n✨ Setup complete! Happy testing! 🎉');
};

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { login, getOrders, showPostmanInstructions }; 