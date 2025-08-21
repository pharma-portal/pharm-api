import axios from 'axios';

// Configuration
const BASE_URL = 'http://localhost:5600/api';
const USER_EMAIL = 'test@example.com';
const USER_PASSWORD = 'password123';

// Test data
const TEST_ORDER_ID = 'your_order_id_here'; // Replace with actual order ID
const TEST_TRANSACTION_ID = 'your_transaction_id_here'; // Replace with actual transaction ID

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

// Test 1: Check Order's Hubtel Status
const testOrderHubtelStatus = async (token, orderId) => {
  try {
    console.log(`\n🧪 Testing Order Hubtel Status...`);
    console.log(`📤 GET ${BASE_URL}/orders/${orderId}/hubtel-status`);
    
    const response = await axios.get(
      `${BASE_URL}/orders/${orderId}/hubtel-status`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    return true;
    
  } catch (error) {
    console.error('❌ FAILED:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
};

// Test 2: Check Hubtel Transaction Status
const testHubtelTransactionStatus = async (token, transactionId) => {
  try {
    console.log(`\n🧪 Testing Hubtel Transaction Status...`);
    console.log(`📤 GET ${BASE_URL}/orders/hubtel/status/${transactionId}`);
    
    const response = await axios.get(
      `${BASE_URL}/orders/hubtel/status/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    return true;
    
  } catch (error) {
    console.error('❌ FAILED:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
};

// Test 3: Get All Orders with Hubtel Status
const testAllOrdersHubtelStatus = async (token) => {
  try {
    console.log(`\n🧪 Testing All Orders Hubtel Status...`);
    console.log(`📤 GET ${BASE_URL}/orders/hubtel/all`);
    
    const response = await axios.get(
      `${BASE_URL}/orders/hubtel/all`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    return true;
    
  } catch (error) {
    console.error('❌ FAILED:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
};

// Main execution
const main = async () => {
  try {
    console.log('🚀 Testing Hubtel Status Check Endpoints...\n');
    
    // Check if test data is set
    if (TEST_ORDER_ID === 'your_order_id_here' || TEST_TRANSACTION_ID === 'your_transaction_id_here') {
      console.log('⚠️  IMPORTANT: Update the test data first!');
      console.log('📝 Update these values:');
      console.log('   - TEST_ORDER_ID: Your actual order ID');
      console.log('   - TEST_TRANSACTION_ID: Your actual Hubtel transaction ID');
      console.log('\n💡 You can get these from your database or from a successful checkout');
      return;
    }
    
    // Login
    const token = await loginUser();
    
    console.log('\n🔍 Testing different status check endpoints...');
    console.log('='.repeat(80));
    
    // Test each endpoint
    const results = [];
    
    results.push(await testOrderHubtelStatus(token, TEST_ORDER_ID));
    results.push(await testHubtelTransactionStatus(token, TEST_TRANSACTION_ID));
    results.push(await testAllOrdersHubtelStatus(token));
    
    // Summary
    console.log('\n🎯 TEST SUMMARY:');
    console.log('='.repeat(80));
    
    const endpoints = [
      'Order Hubtel Status',
      'Hubtel Transaction Status', 
      'All Orders Hubtel Status'
    ];
    
    results.forEach((success, index) => {
      const status = success ? '✅ PASSED' : '❌ FAILED';
      console.log(`${status}: ${endpoints[index]}`);
    });
    
    const passedCount = results.filter(r => r).length;
    console.log(`\n📊 Results: ${passedCount}/${results.length} endpoints working`);
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
};

// Run the test
main();
