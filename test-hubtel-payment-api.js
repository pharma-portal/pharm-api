import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const testHubtelPaymentAPI = async () => {
  try {
    console.log('🧪 Testing Hubtel Payment API...\n');
    
    // Check environment variables
    console.log('🔑 Environment Variables:');
    console.log('   HUBTEL_CLIENT_ID:', process.env.HUBTEL_CLIENT_ID ? '✅ Set' : '❌ Not Set');
    console.log('   HUBTEL_CLIENT_SECRET:', process.env.HUBTEL_CLIENT_SECRET ? '✅ Set' : '❌ Not Set');
    
    if (!process.env.HUBTEL_CLIENT_ID || !process.env.HUBTEL_CLIENT_SECRET) {
      console.log('\n⚠️  Environment variables not set. Please check your .env file.');
      return;
    }
    
    console.log('\n🔐 Testing Payment API Authentication...');
    
    // Create Basic Auth header
    const auth = Buffer.from(`${process.env.HUBTEL_CLIENT_ID}:${process.env.HUBTEL_CLIENT_SECRET}`).toString('base64');
    
    // Test the payment API endpoint (which was working)
    const paymentApiUrl = 'https://payproxyapi.hubtel.com/items/initiate';
    
    const testPayload = {
      "totalAmount": 0.10,
      "description": "Test Payment API",
      "callbackUrl": "http://13.62.90.17:5600/api/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app/order-confirmation",
      "merchantAccountNumber": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app/order-confirmation",
      "clientReference": `test_${Date.now()}`
    };
    
    try {
      const response = await axios.post(paymentApiUrl, testPayload, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('✅ Payment API Authentication Successful!');
      console.log('   Response Status:', response.status);
      console.log('   Response Data:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('❌ Payment API Authentication Failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data || error.message);
    }
    
    console.log('\n🔍 Summary:');
    console.log('   - If Payment API works but Transaction Status API doesn\'t:');
    console.log('     → IP whitelisting issue or different API permissions');
    console.log('   - If both fail:');
    console.log('     → Credential issue');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
};

// Run the test
testHubtelPaymentAPI();
