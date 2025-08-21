import axios from 'axios';

// Configuration - UPDATE THESE WITH YOUR ACTUAL HUBTEL CREDENTIALS
const BASE_URL = 'http://localhost:5000/api';
const USER_EMAIL = 'test@example.com';
const USER_PASSWORD = 'password123';

// Your Hubtel Developer Portal Credentials
const HUBTEL_CREDENTIALS = {
  apiUsername: 'YOUR_API_USERNAME_FROM_HUBTEL_PORTAL', // Replace with actual
  apiKey: 'YOUR_API_PASSWORD_FROM_HUBTEL_PORTAL'       // Replace with actual
};

// Test different payload formats
const testPayloads = [
  {
    name: 'Minimal Payload',
    data: {
      "totalAmount": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchantAccountNumber": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025"
    }
  },
  {
    name: 'Extended Payload',
    data: {
      "totalAmount": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchantAccountNumber": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025",
      "apiUsername": HUBTEL_CREDENTIALS.apiUsername,
      "apiKey": HUBTEL_CREDENTIALS.apiKey
    }
  }
];

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

// Test a specific payload
const testPayload = async (token, payload, payloadName) => {
  try {
    console.log(`\n🧪 Testing: ${payloadName}`);
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `${BASE_URL}/orders/checkout-url`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Success!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.checkoutUrl) {
      console.log('🔗 Checkout URL:', response.data.checkoutUrl);
    }
    
    return true;

  } catch (error) {
    console.error(`❌ Failed: ${error.response?.data?.message || error.message}`);
    
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
    console.log('🚀 Testing Different Hubtel Payload Formats...\n');
    
    // Check if credentials are set
    if (HUBTEL_CREDENTIALS.apiUsername === 'YOUR_API_USERNAME_FROM_HUBTEL_PORTAL') {
      console.log('⚠️  IMPORTANT: Update your Hubtel credentials in the script first!');
      return;
    }
    
    // Login
    const token = await loginUser();
    
    // Test each payload format
    for (const payload of testPayloads) {
      const success = await testPayload(token, payload.data, payload.name);
      if (success) {
        console.log(`\n🎉 ${payload.name} worked! Use this format.`);
        break;
      }
      console.log('\n' + '─'.repeat(50));
    }
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
};

// Run the test
main();
