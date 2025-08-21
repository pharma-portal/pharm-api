import axios from 'axios';

// Configuration - UPDATE THESE WITH YOUR ACTUAL HUBTEL CREDENTIALS
const HUBTEL_CREDENTIALS = {
  apiUsername: 'YOUR_API_USERNAME_FROM_HUBTEL_PORTAL', // Replace with actual
  apiKey: 'YOUR_API_PASSWORD_FROM_HUBTEL_PORTAL'       // Replace with actual
};

// Test different payload formats directly with Hubtel
const testPayloads = [
  {
    name: 'Format 1: Using "amount"',
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
    name: 'Format 2: Using "totalAmount"',
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
    name: 'Format 3: Using "price"',
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
    name: 'Format 4: Using "callback_url" (snake_case)',
    data: {
      "amount": 0.10,
      "description": "Online Checkout Test",
      "callback_url": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "return_url": "https://alleypharmacy.netlify.app",
      "merchantAccountNumber": "2030840",
      "cancellation_url": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025"
    }
  },
  {
    name: 'Format 5: Using "merchant_id"',
    data: {
      "amount": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchant_id": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025"
    }
  },
  {
    name: 'Format 6: Using "merchantId"',
    data: {
      "amount": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchantId": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "clientReference": "test14082025"
    }
  },
  {
    name: 'Format 7: Using "client_reference"',
    data: {
      "amount": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app",
      "merchantAccountNumber": "2030840",
      "cancellationUrl": "https://alleypharmacy.netlify.app",
      "client_reference": "test14082025"
    }
  },
  {
    name: 'Format 8: Minimal with only required fields',
    data: {
      "amount": 0.10,
      "description": "Online Checkout Test",
      "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
      "returnUrl": "https://alleypharmacy.netlify.app"
    }
  }
];

// Test a specific payload directly with Hubtel
const testPayloadDirectly = async (payload, payloadName) => {
  try {
    console.log(`\n🧪 Testing: ${payloadName}`);
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));

    // Create Basic Auth header
    const auth = Buffer.from(`${HUBTEL_CREDENTIALS.apiUsername}:${HUBTEL_CREDENTIALS.apiKey}`).toString('base64');

    // Test directly with Hubtel API
    const response = await axios.post('https://payproxyapi.hubtel.com/items/initiate', payload, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    console.log('✅ SUCCESS!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.checkoutUrl || response.data.url || response.data.paymentUrl) {
      console.log('🔗 Checkout URL found in response');
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
      if (error.response.data && error.response.data.error) {
        console.error('Error Details:', error.response.data.error);
      }
    }
    
    return { success: false, error: error.response?.data || error.message };
  }
};

// Main execution
const main = async () => {
  try {
    console.log('🚀 Testing Hubtel API Directly (Bypassing Your API)...\n');
    
    // Check if credentials are set
    if (HUBTEL_CREDENTIALS.apiUsername === 'YOUR_API_USERNAME_FROM_HUBTEL_PORTAL') {
      console.log('⚠️  IMPORTANT: Update your Hubtel credentials in the script first!');
      console.log('📝 Update these values:');
      console.log('   - HUBTEL_CREDENTIALS.apiUsername: Your Hubtel API username');
      console.log('   - HUBTEL_CREDENTIALS.apiKey: Your Hubtel API password');
      console.log('\n💡 Get these from your Hubtel Developer Portal');
      return;
    }
    
    console.log('🔍 Testing different payload formats directly with Hubtel...');
    console.log('='.repeat(80));
    
    // Test each payload format
    let successfulFormat = null;
    
    for (const payload of testPayloads) {
      const result = await testPayloadDirectly(payload.data, payload.name);
      
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
      console.log('🔧 Update your hubtelService.js to use this exact format.');
    } else {
      console.log('\n💥 ALL FORMATS FAILED');
      console.log('🔍 Check the error messages above to understand what Hubtel expects.');
      console.log('📚 You may need to check Hubtel\'s official API documentation.');
      console.log('📞 Contact Hubtel support with the error details.');
    }
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
};

// Run the test
main();
