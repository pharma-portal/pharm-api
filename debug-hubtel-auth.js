import dotenv from 'dotenv';
import hubtelService from './utils/hubtelService.js';

// Load environment variables
dotenv.config();

const debugHubtelAuth = async () => {
  try {
    console.log('🔍 Debugging Hubtel Authentication...\n');
    
    // Check environment variables
    console.log('🔑 Environment Variables:');
    console.log('   HUBTEL_CLIENT_ID:', process.env.HUBTEL_CLIENT_ID ? '✅ Set' : '❌ Not Set');
    console.log('   HUBTEL_CLIENT_SECRET:', process.env.HUBTEL_CLIENT_SECRET ? '✅ Set' : '❌ Not Set');
    
    if (!process.env.HUBTEL_CLIENT_ID || !process.env.HUBTEL_CLIENT_SECRET) {
      console.log('\n⚠️  Environment variables not set. Please check your .env file.');
      return;
    }
    
    console.log('\n🔐 Step 1: Testing getAuthToken()...');
    
    try {
      const authToken = await hubtelService.getAuthToken();
      console.log('✅ getAuthToken() successful!');
      console.log('   Token length:', authToken.length);
      console.log('   Token preview:', authToken.substring(0, 20) + '...');
      
      console.log('\n🔍 Step 2: Testing checkTransactionStatus()...');
      
      try {
        const status = await hubtelService.checkTransactionStatus('test123');
        console.log('✅ checkTransactionStatus() successful!');
        console.log('   Response:', status);
        
      } catch (statusError) {
        console.log('❌ checkTransactionStatus() failed (expected for test ID):');
        console.log('   Error:', statusError.message);
        
        // This is expected for a test transaction ID
        if (statusError.message.includes('Transaction not found') || 
            statusError.message.includes('Invalid parameters') ||
            statusError.message.includes('Authentication failed')) {
          console.log('   ✅ This is expected behavior for a test transaction ID');
        }
      }
      
    } catch (authError) {
      console.log('❌ getAuthToken() failed:');
      console.log('   Error:', authError.message);
      
      if (authError.message.includes('Failed to authenticate with Hubtel')) {
        console.log('\n🔍 Possible causes:');
        console.log('   1. Invalid Hubtel credentials');
        console.log('   2. IP address not whitelisted');
        console.log('   3. Hubtel API endpoint down');
        console.log('   4. Network connectivity issues');
      }
    }
    
  } catch (error) {
    console.error('\n💥 Debug failed:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Run the debug
debugHubtelAuth();
