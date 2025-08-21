import axios from 'axios';

// Test the callback endpoint directly
const testCallbackEndpoint = async () => {
  try {
    console.log('🧪 Testing Hubtel callback endpoint...');
    console.log('📤 Sending POST request to: http://localhost:5600/api/hubtel-callback');
    
    // Simulate a Hubtel callback payload
    const callbackPayload = {
      "clientReference": "test14082025",
      "status": "SUCCESS",
      "transactionId": "12345",
      "amount": 0.10
    };

    const response = await axios.post(
      'http://localhost:5600/api/hubtel-callback',
      callbackPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS! Callback endpoint is accessible');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ FAILED:', error.response?.data?.message || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Full Error Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

// Test with different URLs to see which one works
const testDifferentUrls = async () => {
  const urls = [
    'http://localhost:5600/api/hubtel-callback',
    'http://localhost:5600/api/hubtel-callback/',
    'http://localhost:5600/api/hubtel-callback/test'
  ];

  for (const url of urls) {
    try {
      console.log(`\n🧪 Testing URL: ${url}`);
      
      const response = await axios.post(url, { test: true });
      console.log('✅ SUCCESS!');
      console.log('Response:', response.data);
      break;
      
    } catch (error) {
      console.error('❌ FAILED:', error.response?.data?.message || error.message);
    }
  }
};

// Main execution
const main = async () => {
  console.log('🚀 Testing Hubtel Callback Endpoint Access...\n');
  
  // Test the main callback endpoint
  await testCallbackEndpoint();
  
  console.log('\n' + '─'.repeat(50));
  
  // Test different URL variations
  await testDifferentUrls();
};

// Run the test
main();
