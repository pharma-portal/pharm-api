import axios from 'axios';

// Test the Hubtel checkout URL endpoint
const testHubtelCheckout = async () => {
  try {
    const baseUrl = 'http://localhost:5000'; // Adjust this to your server URL
    const token = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual JWT token

    console.log('🚀 Testing Hubtel Checkout URL endpoint...');
    console.log('⚠️  IMPORTANT: You need a valid JWT token to test this endpoint!');
    console.log('\n💡 To get a token:');
    console.log('1. First run: node create-test-user.js (to create a test user)');
    console.log('2. Then run: node get-token-and-test-checkout.js (to login and test)');
    console.log('3. Or manually login at: POST /api/users/login');
    console.log('\n📝 Current token:', token === 'YOUR_JWT_TOKEN_HERE' ? 'NOT SET' : 'SET');

    if (token === 'YOUR_JWT_TOKEN_HERE') {
      console.log('\n❌ Please set a valid JWT token before testing!');
      console.log('💡 Use one of the methods above to get a token.');
      return;
    }

    // Method 1: Using environment variables (HUBTEL_CLIENT_ID and HUBTEL_CLIENT_SECRET)
    console.log('\n🔑 Method 1: Using environment variables...');
    const checkoutData1 = {
      "totalAmount": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchantAccountNumber": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025"
    };

    console.log('Request data (Method 1):', JSON.stringify(checkoutData1, null, 2));

    try {
      const response1 = await axios.post(
        `${baseUrl}/api/orders/checkout-url`,
        checkoutData1,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('\n✅ Method 1 Success!');
      console.log('Response:', JSON.stringify(response1.data, null, 2));
      
      if (response1.data.checkoutUrl) {
        console.log('\n🔗 Checkout URL (Method 1):');
        console.log(response1.data.checkoutUrl);
      }
    } catch (error) {
      console.log('❌ Method 1 failed:', error.response?.data?.message || error.message);
      
      if (error.response?.status === 401) {
        console.log('💡 Authentication failed. Check your token.');
      }
    }

    // Method 2: Using API credentials in request body
    console.log('\n\n🔑 Method 2: Using API credentials in request...');
    const checkoutData2 = {
      "totalAmount": 0.10,
      "description": "Online Checkout Test with API Credentials",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchantAccountNumber": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025_creds",
      "apiUsername": "YOUR_API_USERNAME_HERE", // Replace with your Hubtel API username
      "apiKey": "YOUR_API_KEY_HERE" // Replace with your Hubtel API key
    };

    console.log('Request data (Method 2):', JSON.stringify(checkoutData2, null, 2));

    try {
      const response2 = await axios.post(
        `${baseUrl}/api/orders/checkout-url`,
        checkoutData2,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('\n✅ Method 2 Success!');
      console.log('Response:', JSON.stringify(response2.data, null, 2));
      
      if (response2.data.checkoutUrl) {
        console.log('\n🔗 Checkout URL (Method 2):');
        console.log(response2.data.checkoutUrl);
      }
    } catch (error) {
      console.log('❌ Method 2 failed:', error.response?.data?.message || error.message);
      
      if (error.response?.status === 401) {
        console.log('💡 Authentication failed. Check your token.');
      }
    }

    console.log('\n📋 Instructions:');
    console.log('1. Replace YOUR_JWT_TOKEN_HERE with your actual JWT token');
    console.log('2. Replace YOUR_API_USERNAME_HERE and YOUR_API_KEY_HERE with your Hubtel API credentials');
    console.log('3. Or set HUBTEL_CLIENT_ID and HUBTEL_CLIENT_SECRET environment variables');
    console.log('4. The checkout URL can be opened in a browser to test the payment flow');

  } catch (error) {
    console.error('\n❌ General Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Run the test
testHubtelCheckout();
