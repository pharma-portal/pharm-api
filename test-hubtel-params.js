import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

console.log('🔍 Hubtel API Debug Test');
console.log('========================');

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('HUBTEL_CLIENT_ID:', process.env.HUBTEL_CLIENT_ID ? '✅ Set' : '❌ Not Set');
console.log('HUBTEL_CLIENT_SECRET:', process.env.HUBTEL_CLIENT_SECRET ? '✅ Set' : '❌ Not Set');
console.log('HUBTEL_MERCHANT_ACCOUNT:', process.env.HUBTEL_MERCHANT_ACCOUNT ? '✅ Set' : '❌ Not Set');

if (!process.env.HUBTEL_CLIENT_ID || !process.env.HUBTEL_CLIENT_SECRET) {
  console.log('\n❌ Missing Hubtel credentials. Please check your .env file.');
  process.exit(1);
}

// Test parameters
const testParams = {
  totalAmount: 100,
  description: "Test Payment",
  callbackUrl: "https://example.com/api/hubtel-callback",
  returnUrl: "https://example.com/order-confirmation",
  merchantAccountNumber: process.env.HUBTEL_MERCHANT_ACCOUNT || "TEST_ACCOUNT",
  clientReference: "TEST_" + Date.now()
};

console.log('\n📤 Test Parameters:');
console.log(JSON.stringify(testParams, null, 2));

// Test Basic Auth creation
const auth = Buffer.from(`${process.env.HUBTEL_CLIENT_ID}:${process.env.HUBTEL_CLIENT_SECRET}`).toString('base64');
console.log('\n🔐 Basic Auth Header:');
console.log(`Basic ${auth}`);

// Test Hubtel API call
async function testHubtelAPI() {
  try {
    console.log('\n🚀 Testing Hubtel API call...');
    
    const response = await axios.post(
      'https://payproxyapi.hubtel.com/items/initiate',
      testParams,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ Hubtel API Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\n❌ Hubtel API Error:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.message);
    console.log('Response Data:', error.response?.data);
    
    if (error.response?.data) {
      console.log('\n🔍 Error Details:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
}

testHubtelAPI();
