import axios from 'axios';

// Configuration
const BASE_URL = 'http://localhost:5600/api';
const USER_EMAIL = 'test@example.com';
const USER_PASSWORD = 'password123';

// Login to get JWT token
const loginUser = async () => {
  try {
    console.log('🔑 Logging in to get JWT token...');
    
    const response = await axios.post(`${BASE_URL}/users/login`, {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });

    const token = response.data.token;
    console.log('✅ Login successful!');
    return token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

// Method 1: Create a checkout URL and get transaction ID
const createCheckoutAndGetTransactionId = async (token) => {
  try {
    console.log('\n🧪 Method 1: Creating checkout URL to get transaction ID...');
    
    const checkoutPayload = {
      "totalAmount": 0.10,
      "description": "Test Payment for Transaction ID",
      "callbackUrl": "http://13.62.90.17:5600/api/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app/order-confirmation",
      "merchantAccountNumber": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app/order-confirmation",
      "clientReference": `test_${Date.now()}`
    };

    const response = await axios.post(
      `${BASE_URL}/orders/checkout-url`,
      checkoutPayload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Checkout URL created successfully!');
    console.log('🔗 Checkout URL:', response.data.checkoutUrl);
    
    // Extract transaction ID from response
    const transactionId = response.data.paymentId || 
                         response.data.hubtelResponse?.paymentId ||
                         response.data.hubtelResponse?.id;
    
    if (transactionId) {
      console.log('🎯 Transaction ID found:', transactionId);
      return transactionId;
    } else {
      console.log('⚠️  No transaction ID found in response');
      console.log('📥 Full response:', JSON.stringify(response.data, null, 2));
      return null;
    }
    
  } catch (error) {
    console.error('❌ Failed to create checkout URL:', error.response?.data?.message || error.message);
    return null;
  }
};

// Method 2: Check database for existing orders with transaction IDs
const checkDatabaseForTransactionIds = async (token) => {
  try {
    console.log('\n🧪 Method 2: Checking database for existing transaction IDs...');
    
    const response = await axios.get(
      `${BASE_URL}/orders/hubtel/all`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Database query successful!');
    
    if (response.data && response.data.length > 0) {
      const ordersWithTransactionIds = response.data.filter(order => 
        order.hubtelTransactionId || order.paymentResult?.id
      );
      
      if (ordersWithTransactionIds.length > 0) {
        console.log('🎯 Found orders with transaction IDs:');
        ordersWithTransactionIds.forEach((order, index) => {
          const transactionId = order.hubtelTransactionId || order.paymentResult?.id;
          console.log(`   ${index + 1}. Order ID: ${order._id}`);
          console.log(`      Transaction ID: ${transactionId}`);
          console.log(`      Status: ${order.hubtelStatus || 'unknown'}`);
          console.log(`      Is Paid: ${order.isPaid}`);
        });
        
        return ordersWithTransactionIds[0].hubtelTransactionId || ordersWithTransactionIds[0].paymentResult?.id;
      } else {
        console.log('⚠️  No orders with transaction IDs found');
        return null;
      }
    } else {
      console.log('⚠️  No orders found in database');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Failed to query database:', error.response?.data?.message || error.message);
    return null;
  }
};

// Method 3: Check specific order by ID
const checkSpecificOrder = async (token, orderId) => {
  try {
    console.log(`\n🧪 Method 3: Checking specific order ${orderId}...`);
    
    const response = await axios.get(
      `${BASE_URL}/orders/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Order retrieved successfully!');
    
    const order = response.data;
    const transactionId = order.hubtelTransactionId || order.paymentResult?.id;
    
    if (transactionId) {
      console.log('🎯 Transaction ID found:', transactionId);
      console.log('📊 Order details:');
      console.log(`   - Status: ${order.hubtelStatus || 'unknown'}`);
      console.log(`   - Is Paid: ${order.isPaid}`);
      console.log(`   - Payment Result:`, order.paymentResult);
      return transactionId;
    } else {
      console.log('⚠️  No transaction ID found for this order');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Failed to retrieve order:', error.response?.data?.message || error.message);
    return null;
  }
};

// Main execution
const main = async () => {
  try {
    console.log('🚀 Getting Transaction ID from Different Sources...\n');
    
    // Login
    const token = await loginUser();
    
    console.log('\n🔍 Trying different methods to get transaction ID...');
    console.log('='.repeat(80));
    
    let transactionId = null;
    
    // Try Method 1: Create new checkout
    transactionId = await createCheckoutAndGetTransactionId(token);
    
    // If Method 1 failed, try Method 2: Check database
    if (!transactionId) {
      transactionId = await checkDatabaseForTransactionIds(token);
    }
    
    // If still no transaction ID, try Method 3: Check specific order
    if (!transactionId) {
      console.log('\n💡 You can also check a specific order by ID:');
      console.log('   - Update the orderId in the script');
      console.log('   - Or run: node get-transaction-id.js <orderId>');
      
      // Check if order ID was passed as command line argument
      const orderId = process.argv[2];
      if (orderId) {
        transactionId = await checkSpecificOrder(token, orderId);
      }
    }
    
    // Summary
    console.log('\n🎯 SUMMARY:');
    console.log('='.repeat(80));
    
    if (transactionId) {
      console.log('✅ Transaction ID found:', transactionId);
      console.log('\n💡 You can now use this ID to test the status endpoints:');
      console.log(`   - Update TEST_TRANSACTION_ID in test-hubtel-status-endpoints.js`);
      console.log(`   - Or test directly: GET /api/orders/hubtel/status/${transactionId}`);
    } else {
      console.log('❌ No transaction ID found');
      console.log('\n💡 To get a transaction ID:');
      console.log('   1. Complete a payment through Hubtel');
      console.log('   2. Check the callback endpoint for transaction details');
      console.log('   3. Look in your database for orders with hubtelTransactionId');
    }
    
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
  }
};

// Run the script
main();
