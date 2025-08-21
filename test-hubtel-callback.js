import axios from 'axios';

// Test the Hubtel callback endpoint
const testHubtelCallback = async () => {
  try {
    const baseUrl = 'http://localhost:5000'; // Adjust this to your server URL
    
    console.log('📞 Testing Hubtel callback endpoint...');
    
    // Simulate Hubtel callback data
    const callbackData = {
      "transactionId": "HUBTEL_TXN_TEST_123",
      "clientReference": "test14082025",
      "status": "SUCCESS",
      "amount": 0.10,
      "currency": "GHS",
      "networkTransactionId": "NETWORK_TXN_TEST_789",
      "description": "Online Checkout Test",
      "responseCode": "0000",
      "responseMessage": "Transaction successful",
      "hubtelTransactionId": "HUBTEL_TXN_TEST_123",
      "merchantAccountNumber": "2030840"
    };

    console.log('📤 Callback data:', JSON.stringify(callbackData, null, 2));

    const response = await axios.post(
      `${baseUrl}/api/orders/hubtel-callback`,
      callbackData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Callback endpoint test successful!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    
    console.log('\n💡 This endpoint is now ready to receive callbacks from Hubtel!');
    console.log('🔗 URL: http://13.62.90.17:5600/api/orders/hubtel-callback');

  } catch (error) {
    console.error('\n❌ Callback endpoint test failed:', error.response?.data?.message || error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      if (error.response.status === 404) {
        console.log('\n💡 The callback endpoint might not be properly configured.');
        console.log('💡 Make sure the route is added to orderRoutes.js');
      } else if (error.response.status === 400) {
        console.log('\n💡 Check the callback data format and required fields.');
      }
    }
  }
};

// Run the test
testHubtelCallback();
