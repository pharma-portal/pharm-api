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

// Test multiple payload formats to find what Hubtel expects
const testPayloads = [
  {
    name: 'Format 1: Minimal (Original)',
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
    name: 'Format 2: Using "amount" instead of "totalAmount"',
    data: {
      "amount": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchantAccountNumber": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025"
    }
  },
  {
    name: 'Format 3: Using "price" instead of "amount"',
    data: {
      "price": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchantAccountNumber": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025"
    }
  },
  {
    name: 'Format 4: Using "value" instead of "amount"',
    data: {
      "value": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchantAccountNumber": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025"
    }
  },
  {
    name: 'Format 5: Using "callback_url" instead of "callbackUrl"',
    data: {
      "totalAmount": 0.10,
      "description": "Online Checkout Test",
      "callback_url": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "return_url": "https://alleypharmacy.netlify.app",
      "merchantAccountNumber": "2030840",
      "cancellation_url": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025"
    }
  },
  {
    name: 'Format 6: Using "client_reference" instead of "clientReference"',
    data: {
      "totalAmount": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchantAccountNumber": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "client_reference": "test14082025"
    }
  },
  {
    name: 'Format 7: Using "merchant_account_number" instead of "merchantAccountNumber"',
    data: {
      "totalAmount": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchant_account_number": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025"
    }
  },
  {
    name: 'Format 8: Using "merchant_id" instead of "merchantAccountNumber"',
    data: {
      "totalAmount": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchant_id": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025"
    }
  },
  {
    name: 'Format 9: Using "merchantId" instead of "merchantAccountNumber"',
    data: {
      "totalAmount": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchantId": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025"
    }
  },
  {
    name: 'Format 10: Using "merchantNumber" instead of "merchantAccountNumber"',
    data: {
      "totalAmount": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchantNumber": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025"
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

    console.log('✅ SUCCESS!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.checkoutUrl) {
      console.log('🔗 Checkout URL:', response.data.checkoutUrl);
    }
    
    return { success: true, response: response.data };

  } catch (error) {
    console.error(`❌ FAILED: ${error.response?.data?.message || error.message}`);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Full Error Response:', JSON.stringify(error.response.data, null, 2));
      
      // Try to extract more specific error information
      if (error.response.data && error.response.data.errors) {
        console.error('Field Errors:', error.response.data.errors);
      }
      if (error.response.data && error.response.data.message) {
        console.error('Error Message:', error.response.data.message);
      }
    }
    
    return { success: false, error: error.response?.data || error.message };
  }
};

// Main execution
const main = async () => {
  try {
    console.log('🚀 Comprehensive Hubtel API Payload Testing...\n');
    
    // Check if credentials are set
    if (HUBTEL_CREDENTIALS.apiUsername === 'YOUR_API_USERNAME_FROM_HUBTEL_PORTAL') {
      console.log('⚠️  IMPORTANT: Update your Hubtel credentials in the script first!');
      console.log('📝 Update these values:');
      console.log('   - HUBTEL_CREDENTIALS.apiUsername: Your Hubtel API username');
      console.log('   - HUBTEL_CREDENTIALS.apiKey: Your Hubtel API password');
      console.log('\n💡 Get these from your Hubtel Developer Portal');
      return;
    }
    
    // Login
    const token = await loginUser();
    
    console.log('\n🔍 Testing different payload formats to find what Hubtel expects...');
    console.log('='.repeat(80));
    
    // Test each payload format
    let successfulFormat = null;
    
    for (const payload of testPayloads) {
      const result = await testPayload(token, payload.data, payload.name);
      
      if (result.success) {
        console.log(`\n🎉 ${payload.name} WORKED! This is the correct format.`);
        successfulFormat = payload;
        break;
      }
      
      console.log('\n' + '─'.repeat(80));
    }
    
    // Summary
    if (successfulFormat) {
      console.log('\n🎯 SUCCESS SUMMARY:');
      console.log(`✅ Working Format: ${successfulFormat.name}`);
      console.log('📤 Working Payload:', JSON.stringify(successfulFormat.data, null, 2));
      console.log('\n💡 Use this payload format in your production code!');
    } else {
      console.log('\n💥 ALL FORMATS FAILED');
      console.log('🔍 Check the error messages above to understand what Hubtel expects.');
      console.log('📚 You may need to check Hubtel\'s official API documentation.');
    }
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
};

// Run the test
main();
