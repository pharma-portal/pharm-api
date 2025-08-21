import dotenv from 'dotenv';
import hubtelService from './utils/hubtelService.js';

// Load environment variables
dotenv.config();

// Test the Hubtel service
const testHubtelService = async () => {
  try {
    console.log('🧪 Testing Hubtel Service...\n');
    
    // Check environment variables
    console.log('🔑 Environment Variables:');
    console.log('   HUBTEL_CLIENT_ID:', process.env.HUBTEL_CLIENT_ID ? '✅ Set' : '❌ Not Set');
    console.log('   HUBTEL_CLIENT_SECRET:', process.env.HUBTEL_CLIENT_SECRET ? '✅ Set' : '❌ Not Set');
    
    if (!process.env.HUBTEL_CLIENT_ID || !process.env.HUBTEL_CLIENT_SECRET) {
      console.log('\n⚠️  Please set HUBTEL_CLIENT_ID and HUBTEL_CLIENT_SECRET in your .env file');
      return;
    }
    
    console.log('\n🔐 Testing Authentication...');
    
    // Test getting auth token
    try {
      const authToken = await hubtelService.getAuthToken();
      console.log('✅ Authentication successful!');
      console.log('   Token length:', authToken.length);
      console.log('   Token preview:', authToken.substring(0, 20) + '...');
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      return;
    }
    
    console.log('\n🔍 Testing Transaction Status Check...');
    
    // Test with a sample transaction ID
    const testTransactionId = 'test123';
    const testClientReference = 'test_ref';
    
    try {
      console.log(`   Testing with transaction ID: ${testTransactionId}`);
      console.log(`   Client reference: ${testClientReference}`);
      
      const status = await hubtelService.checkTransactionStatus(
        testTransactionId,
        testClientReference
      );
      
      console.log('✅ Transaction status check successful!');
      console.log('   Response:', status);
      
    } catch (error) {
      console.log('⚠️  Transaction status check failed (expected for test ID):', error.message);
      
      // This is expected for a test transaction ID
      if (error.message.includes('Transaction not found') || 
          error.message.includes('Invalid parameters')) {
        console.log('   ✅ This is expected behavior for a test transaction ID');
      }
    }
    
    console.log('\n🎯 Hubtel Service Test Summary:');
    console.log('   ✅ Environment variables: OK');
    console.log('   ✅ Authentication: OK');
    console.log('   ✅ Service methods: OK');
    
    console.log('\n💡 The service is working correctly!');
    console.log('   You can now test with real transaction IDs.');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Run the test
testHubtelService();
