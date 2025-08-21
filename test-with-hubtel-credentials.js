import axios from 'axios';

// Configuration - UPDATE THESE WITH YOUR ACTUAL HUBTEL CREDENTIALS
const BASE_URL = 'http://localhost:5000/api'; // Adjust this to your server URL
const USER_EMAIL = 'test@example.com'; // Replace with an existing user's email
const USER_PASSWORD = 'password123'; // Replace with the user's password

// Your Hubtel Developer Portal Credentials
const HUBTEL_CREDENTIALS = {
  apiUsername: 'YOUR_API_USERNAME_FROM_HUBTEL_PORTAL', // Replace with actual
  apiKey: 'YOUR_API_PASSWORD_FROM_HUBTEL_PORTAL'       // Replace with actual
};

// Step 1: Login to get JWT token
const loginUser = async () => {
  try {
    console.log('🔑 Step 1: Logging in to get JWT token...');
    
    const response = await axios.post(`${BASE_URL}/users/login`, {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });

    const token = response.data.token;
    console.log('✅ Login successful!');
    console.log('📝 User:', response.data.name, `(${response.data.email})`);
    console.log('🔑 Token received');
    
    return token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

// Step 2: Test checkout with Hubtel credentials
const testCheckoutWithHubtelCredentials = async (token) => {
  try {
    console.log('\n🔑 Step 2: Testing checkout with Hubtel developer portal credentials...');
    
    const checkoutData = {
      "totalAmount": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchantAccountNumber": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025",
      // Your Hubtel credentials from developer portal
      "apiUsername": HUBTEL_CREDENTIALS.apiUsername,
      "apiKey": HUBTEL_CREDENTIALS.apiKey
    };

    console.log('📤 Request data:', JSON.stringify(checkoutData, null, 2));
    console.log('🔑 Using Hubtel credentials from developer portal');

    const response = await axios.post(
      `${BASE_URL}/orders/checkout-url`,
      checkoutData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('\n✅ Checkout endpoint test successful!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.checkoutUrl) {
      console.log('\n🔗 Checkout URL:');
      console.log(response.data.checkoutUrl);
      console.log('\n📋 You can copy this URL and open it in a browser to test the checkout flow.');
      console.log('🌐 Frontend Integration: Use this URL to redirect users to Hubtel payment.');
      
      if (response.data.paymentId) {
        console.log('\n🆔 Payment ID:', response.data.paymentId);
      }
      if (response.data.status) {
        console.log('📊 Status:', response.data.status);
      }
    } else {
      console.log('\n⚠️  No checkout URL received. Check the Hubtel API response.');
    }

  } catch (error) {
    console.error('\n❌ Checkout endpoint test failed:', error.response?.data?.message || error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n💡 Authentication failed. Check your Hubtel API credentials.');
        console.log('💡 Verify your apiUsername and apiKey are correct.');
      } else if (error.response.status === 400) {
        console.log('\n💡 Check the request data format and required fields.');
      } else if (error.response.status === 500) {
        console.log('\n💡 Hubtel API server error. Check your credentials and try again.');
      }
    }
  }
};

// Main execution
const main = async () => {
  try {
    console.log('🚀 Starting Hubtel Checkout Test with Developer Portal Credentials...\n');
    
    // Check if credentials are set
    if (HUBTEL_CREDENTIALS.apiUsername === 'YOUR_API_USERNAME_FROM_HUBTEL_PORTAL') {
      console.log('⚠️  IMPORTANT: You need to update the credentials in this script!');
      console.log('\n📝 Update these values in the script:');
      console.log('   - HUBTEL_CREDENTIALS.apiUsername: Your Hubtel API username');
      console.log('   - HUBTEL_CREDENTIALS.apiKey: Your Hubtel API password');
      console.log('\n💡 Get these from your Hubtel Developer Portal');
      return;
    }
    
    // Step 1: Get token
    const token = await loginUser();
    
    // Step 2: Test checkout with Hubtel credentials
    await testCheckoutWithHubtelCredentials(token);
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
};

// Run the test
main();
