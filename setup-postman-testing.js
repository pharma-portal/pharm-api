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
  console.log('3. Set up environment variables in Postman:');
  console.log('   - baseUrl: [Your API base URL]');
  console.log('   - authToken: [Your JWT token]');
  console.log('   - orderId: [Your order ID]');
  console.log('   - transactionId: [Your Hubtel transaction ID]');
  console.log('   - clientReference: [Your client reference]');

  console.log('\n4. Test the following endpoints:');
  console.log('   - Check Order Hubtel Status');
  console.log('   - Update Order with Hubtel Transaction');
  console.log('   - Get All Orders with Hubtel Status (Admin)');
  console.log('   - Create Hubtel Checkout URL');

  console.log('\n5. For the Create Hubtel Checkout URL endpoint:');
  console.log('   - This creates a checkout URL that redirects users to Hubtel payment');
  console.log('   - The response includes a checkoutUrl that can be opened in a browser');
  console.log('   - Use this for testing the complete payment flow');
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