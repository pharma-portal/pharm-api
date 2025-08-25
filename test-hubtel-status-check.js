import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test the Hubtel transaction status check step by step
const testHubtelStatusCheck = async () => {
  try {
    console.log('🧪 Testing Hubtel Transaction Status Check...\n');
    
    // Step 1: Check environment variables
    console.log('🔍 Step 1: Checking Environment Variables...');
    const clientId = process.env.HUBTEL_CLIENT_ID;
    const clientSecret = process.env.HUBTEL_CLIENT_SECRET;
    
    console.log('HUBTEL_CLIENT_ID:', clientId ? '✅ SET' : '❌ NOT SET');
    console.log('HUBTEL_CLIENT_SECRET:', clientSecret ? '✅ SET' : '❌ NOT SET');
    
    if (!clientId || !clientSecret) {
      console.log('\n❌ Missing Hubtel credentials!');
      console.log('💡 Set these environment variables:');
      console.log('   HUBTEL_CLIENT_ID=your_hubtel_username');
      console.log('   HUBTEL_CLIENT_SECRET=your_hubtel_api_key');
      return;
    }
    
    // Step 2: Test Basic Auth directly with transaction status endpoint
    console.log('\n🔍 Step 2: Testing Basic Auth with Transaction Status Endpoint...');
    
    // Test with a sample transaction ID
    const testTransactionId = 'test123';
    const testClientReference = 'test_ref_123';
    
    console.log('Testing with:');
    console.log('  Transaction ID:', testTransactionId);
    console.log('  Client Reference:', testClientReference);
    
    try {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      
      const statusResponse = await axios.get(
        `https://api-txnstatus.hubtel.com/transactions/${testTransactionId}/status`,
        {
          params: {
            clientReference: testClientReference
          },
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );
      
      console.log('✅ Transaction Status Check Successful!');
      console.log('Response:', JSON.stringify(statusResponse.data, null, 2));
      
    } catch (statusError) {
      console.log('⚠️  Transaction Status Check Failed (Expected for test ID):');
      console.log('Status:', statusError.response?.status);
      console.log('Message:', statusError.response?.data?.message || statusError.message);
      
      if (statusError.response?.status === 404) {
        console.log('✅ This is expected for a test transaction ID');
      } else if (statusError.response?.status === 401) {
        console.log('💡 Authentication failed. Check your Hubtel credentials.');
      } else if (statusError.response?.status === 403) {
        console.log('💡 Your IP might not be whitelisted.');
      }
    }
    
  } catch (error) {
    console.error('❌ General Error:', error.message);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

// Test the API endpoint directly
const testAPIEndpoint = async () => {
  try {
    console.log('\n' + '─'.repeat(50));
    console.log('🧪 Testing API Endpoint Directly...\n');
    
    const baseUrl = 'http://localhost:5000'; // Adjust to your server URL
    const token = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual JWT token
    
    if (token === 'YOUR_JWT_TOKEN_HERE') {
      console.log('❌ Please set a valid JWT token first!');
      console.log('💡 Update the token variable in this script');
      return;
    }
    
    console.log('Testing endpoint: GET /api/orders/hubtel/status/test123');
    
    const response = await axios.get(
      `${baseUrl}/api/orders/hubtel/status/test123?clientReference=test_ref_123`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ API Endpoint Test Successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ API Endpoint Test Failed:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Authentication failed. Check your JWT token.');
    } else if (error.response?.status === 500) {
      console.log('💡 Server error. Check the server logs for details.');
    }
  }
};

// Main execution
const main = async () => {
  console.log('🚀 Hubtel Status Check Debug Tool\n');
  
  // Test Hubtel service directly
  await testHubtelStatusCheck();
  
  // Test API endpoint
  await testAPIEndpoint();
  
  console.log('\n📋 Summary:');
  console.log('1. Check if HUBTEL_CLIENT_ID and HUBTEL_CLIENT_SECRET are set');
  console.log('2. Verify your Hubtel credentials are correct');
  console.log('3. Ensure your IP is whitelisted in Hubtel');
  console.log('4. The transaction status endpoint now uses Basic Auth (same as payment initiation)');
};

// Run the test
main();
