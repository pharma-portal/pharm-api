import axios from 'axios';

// Configuration - UPDATE THESE VALUES
const BASE_URL = 'http://localhost:5000/api';
const AUTH_TOKEN = 'your_jwt_token_here'; // Replace with actual token from login

// Test data - UPDATE THESE VALUES
const TEST_ORDER_ID = 'your_order_id_here'; // Get from your database
const TEST_TRANSACTION_ID = 'your_hubtel_transaction_id_here'; // From Hubtel
const TEST_CLIENT_REFERENCE = 'TEST_REF_123';
const TEST_NETWORK_TRANSACTION_ID = 'NETWORK_TXN_456';

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    console.log(`🌐 Making ${method} request to: ${config.url}`);
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('❌ Request failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    throw error;
  }
};

// Test 1: Check Hubtel status for an order
const testCheckOrderHubtelStatus = async () => {
  console.log('\n=== Test 1: Check Order Hubtel Status ===');
  
  try {
    const result = await makeRequest('GET', `/orders/${TEST_ORDER_ID}/hubtel-status?clientReference=${TEST_CLIENT_REFERENCE}`);
    console.log('✅ Success:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
};

// Test 2: Update order with Hubtel transaction
const testUpdateOrderWithHubtelTransaction = async () => {
  console.log('\n=== Test 2: Update Order with Hubtel Transaction ===');
  
  try {
    const data = {
      transactionId: TEST_TRANSACTION_ID,
      clientReference: TEST_CLIENT_REFERENCE,
      networkTransactionId: TEST_NETWORK_TRANSACTION_ID
    };
    
    const result = await makeRequest('PUT', `/orders/${TEST_ORDER_ID}/hubtel-transaction`, data);
    console.log('✅ Success:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
};

// Test 3: Direct transaction status check
const testDirectTransactionStatusCheck = async () => {
  console.log('\n=== Test 3: Direct Transaction Status Check ===');
  
  try {
    const result = await makeRequest('GET', `/orders/hubtel/status/${TEST_TRANSACTION_ID}?clientReference=${TEST_CLIENT_REFERENCE}`);
    console.log('✅ Success:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
};

// Test 4: Get all orders with Hubtel status (Admin only)
const testGetOrdersWithHubtelStatus = async () => {
  console.log('\n=== Test 4: Get All Orders with Hubtel Status ===');
  
  try {
    const result = await makeRequest('GET', '/orders/hubtel/all?page=1&limit=5');
    console.log('✅ Success:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
};

// Test 5: Simulate different error scenarios
const testErrorScenarios = async () => {
  console.log('\n=== Test 5: Error Scenarios ===');
  
  // Test with invalid order ID
  try {
    await makeRequest('GET', '/orders/invalid_order_id/hubtel-status');
  } catch (error) {
    console.log('✅ Expected error for invalid order ID:', error.response?.status);
  }
  
  // Test with invalid transaction ID
  try {
    await makeRequest('GET', '/orders/hubtel/status/invalid_transaction_id');
  } catch (error) {
    console.log('✅ Expected error for invalid transaction ID:', error.response?.status);
  }
};

// Test 6: Get available orders (to help you find order IDs)
const testGetAvailableOrders = async () => {
  console.log('\n=== Test 6: Get Available Orders ===');
  
  try {
    const result = await makeRequest('GET', '/orders/myorders');
    console.log('✅ Available orders:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Hubtel Integration Tests...');
  console.log('📝 Note: Update the test data variables with actual values');
  console.log('🔧 Current configuration:');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Auth Token: ${AUTH_TOKEN ? '✅ Set' : '❌ Not set'}`);
  console.log(`   Order ID: ${TEST_ORDER_ID !== 'your_order_id_here' ? '✅ Set' : '❌ Not set'}`);
  console.log(`   Transaction ID: ${TEST_TRANSACTION_ID !== 'your_hubtel_transaction_id_here' ? '✅ Set' : '❌ Not set'}`);
  
  await testGetAvailableOrders();
  await testCheckOrderHubtelStatus();
  await testUpdateOrderWithHubtelTransaction();
  await testDirectTransactionStatusCheck();
  await testGetOrdersWithHubtelStatus();
  await testErrorScenarios();
  
  console.log('\n✨ All tests completed!');
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export {
  testCheckOrderHubtelStatus,
  testUpdateOrderWithHubtelTransaction,
  testDirectTransactionStatusCheck,
  testGetOrdersWithHubtelStatus,
  testErrorScenarios,
  testGetAvailableOrders,
  runTests
}; 