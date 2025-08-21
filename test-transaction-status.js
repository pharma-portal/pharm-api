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

// Test transaction status endpoint
const testTransactionStatus = async (token, transactionId) => {
  try {
    console.log(`\n🧪 Testing Transaction Status Endpoint...`);
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
      console.error('Full Error Response:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
};

// Test with different transaction IDs
const testDifferentTransactionIds = async (token) => {
  const testIds = [
    'test123',
    '33d4f2583e374165990f2a4397d922ea', // From the checkout URL
    'sample_transaction_id'
  ];

  for (const transactionId of testIds) {
    console.log(`\n🔍 Testing with transaction ID: ${transactionId}`);
    const success = await testTransactionStatus(token, transactionId);
    
    if (success) {
      console.log('✅ Found working transaction ID!');
      break;
    }
  }
};

// Main execution
const main = async () => {
  try {
    console.log('🚀 Testing Transaction Status Endpoint...\n');
    
    // Login
    const token = await loginUser();
    
    console.log('\n🔍 Testing with different transaction IDs...');
    console.log('='.repeat(80));
    
    // Test with different transaction IDs
    await testDifferentTransactionIds(token);
    
    console.log('\n🎯 SUMMARY:');
    console.log('='.repeat(80));
    console.log('💡 The endpoint is working if you see successful responses above.');
    console.log('💡 Real transaction IDs will return actual payment status.');
    console.log('💡 Test transaction IDs will return appropriate error messages.');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
};

// Run the test
main();
