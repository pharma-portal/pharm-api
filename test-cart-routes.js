import axios from 'axios';

// Test all cart routes to identify the issue
const testCartRoutes = async () => {
  const baseUrl = 'http://localhost:5000'; // Change this to your production IP
  const token = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual JWT token
  
  console.log('🧪 Testing Cart Routes...\n');
  
  if (token === 'YOUR_JWT_TOKEN_HERE') {
    console.log('❌ Please set a valid JWT token first!');
    return;
  }
  
  const routes = [
    {
      name: 'GET /api/cart',
      method: 'GET',
      url: `${baseUrl}/api/cart`,
      auth: true
    },
    {
      name: 'POST /api/cart/drug/prescription',
      method: 'POST',
      url: `${baseUrl}/api/cart/drug/prescription`,
      auth: true,
      data: {
        drugId: 'test_drug_id',
        quantity: 1
      }
    },
    {
      name: 'POST /api/cart/drug',
      method: 'POST',
      url: `${baseUrl}/api/cart/drug`,
      auth: true,
      data: {
        drugId: 'test_drug_id',
        quantity: 1
      }
    },
    {
      name: 'POST /api/cart/product',
      method: 'POST',
      url: `${baseUrl}/api/cart/product`,
      auth: true,
      data: {
        productId: 'test_product_id',
        quantity: 1
      }
    }
  ];
  
  for (const route of routes) {
    try {
      console.log(`🔍 Testing: ${route.name}`);
      
      const config = {
        method: route.method,
        url: route.url,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (route.auth) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      if (route.data) {
        config.data = route.data;
      }
      
      const response = await axios(config);
      
      console.log(`✅ ${route.name} - SUCCESS (${response.status})`);
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      
    } catch (error) {
      console.log(`❌ ${route.name} - FAILED`);
      console.log(`   Status: ${error.response?.status || 'No response'}`);
      console.log(`   Message: ${error.response?.data?.message || error.message}`);
      
      if (error.response?.status === 404) {
        console.log(`   💡 Route not found - Check if server is running and routes are loaded`);
      } else if (error.response?.status === 401) {
        console.log(`   💡 Authentication failed - Check your JWT token`);
      }
    }
    
    console.log('─'.repeat(50));
  }
  
  console.log('\n📋 Route Test Summary:');
  console.log('1. Check server logs for route registration');
  console.log('2. Verify server is running on correct port');
  console.log('3. Check if routes are properly mounted');
  console.log('4. Ensure server has restarted after route changes');
};

// Test route mounting
const testRouteMounting = async () => {
  try {
    console.log('\n🔍 Testing Route Mounting...');
    
    // Test if the base cart route is accessible
    const response = await axios.get('http://localhost:5000/api/cart');
    console.log('✅ Base cart route is accessible');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Base cart route failed:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
  }
};

// Main execution
const main = async () => {
  console.log('🚀 Cart Routes Debug Tool\n');
  
  await testCartRoutes();
  await testRouteMounting();
};

// Run the test
main();
