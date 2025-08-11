import axios from 'axios';

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const EMAIL = 'your_email@example.com'; // Replace with your email
const PASSWORD = 'your_password'; // Replace with your password

console.log('🧪 Testing Cart API Endpoints...\n');

// Helper function to make requests
const makeRequest = async (method, url, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    console.log(`🌐 ${method} ${config.url}`);
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method} ${url} failed:`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Test functions
const testLogin = async () => {
  console.log('📝 Test 1: Login to get JWT token...');
  try {
    const response = await makeRequest('POST', '/users/login', {
      email: EMAIL,
      password: PASSWORD
    });
    
    console.log('✅ Login successful');
    console.log('🔑 Token received');
    return response.token;
  } catch (error) {
    console.log('❌ Login failed');
    return null;
  }
};

const testGetCart = async (token) => {
  console.log('\n📋 Test 2: Get user cart...');
  try {
    const cart = await makeRequest('GET', '/cart', null, token);
    console.log('✅ Cart retrieved successfully');
    console.log('📊 Cart details:', {
      items: cart.items?.length || 0,
      totalAmount: cart.totalAmount || 0
    });
    return cart;
  } catch (error) {
    console.log('❌ Failed to get cart');
    return null;
  }
};

const testAddDrugToCart = async (token) => {
  console.log('\n💊 Test 3: Add drug to cart...');
  try {
    // First, let's get available drugs
    const drugs = await makeRequest('GET', '/drugs', null, token);
    if (drugs.length === 0) {
      console.log('⚠️  No drugs available to test with');
      return null;
    }
    
    const drug = drugs[0];
    console.log(`📝 Using drug: ${drug.name} (ID: ${drug._id})`);
    
    const cartData = {
      drugId: drug._id,
      quantity: 1
    };
    
    const cart = await makeRequest('POST', '/cart/drug', cartData, token);
    console.log('✅ Drug added to cart successfully');
    console.log('📊 Updated cart:', {
      items: cart.items?.length || 0,
      totalAmount: cart.totalAmount || 0
    });
    return cart;
  } catch (error) {
    console.log('❌ Failed to add drug to cart');
    return null;
  }
};

const testAddProductToCart = async (token) => {
  console.log('\n🛍️  Test 4: Add product to cart...');
  try {
    // First, let's get available products
    const products = await makeRequest('GET', '/products', null, token);
    if (products.length === 0) {
      console.log('⚠️  No products available to test with');
      return null;
    }
    
    const product = products[0];
    console.log(`📝 Using product: ${product.name} (ID: ${product._id})`);
    
    const cartData = {
      productId: product._id,
      quantity: 2
    };
    
    const cart = await makeRequest('POST', '/cart/product', cartData, token);
    console.log('✅ Product added to cart successfully');
    console.log('📊 Updated cart:', {
      items: cart.items?.length || 0,
      totalAmount: cart.totalAmount || 0
    });
    return cart;
  } catch (error) {
    console.log('❌ Failed to add product to cart');
    return null;
  }
};

const testUpdateCartItem = async (token, cart) => {
  console.log('\n✏️  Test 5: Update cart item...');
  if (!cart || !cart.items || cart.items.length === 0) {
    console.log('⚠️  No cart items to update');
    return null;
  }
  
  try {
    const item = cart.items[0];
    const updateData = {
      quantity: item.quantity + 1
    };
    
    const updatedCart = await makeRequest('PUT', `/cart/${item._id}`, updateData, token);
    console.log('✅ Cart item updated successfully');
    console.log('📊 Updated quantity:', updateData.quantity);
    return updatedCart;
  } catch (error) {
    console.log('❌ Failed to update cart item');
    return null;
  }
};

const testRemoveFromCart = async (token, cart) => {
  console.log('\n🗑️  Test 6: Remove item from cart...');
  if (!cart || !cart.items || cart.items.length === 0) {
    console.log('⚠️  No cart items to remove');
    return null;
  }
  
  try {
    const item = cart.items[0];
    const updatedCart = await makeRequest('DELETE', `/cart/${item._id}`, null, token);
    console.log('✅ Item removed from cart successfully');
    console.log('📊 Updated cart:', {
      items: updatedCart.items?.length || 0,
      totalAmount: updatedCart.totalAmount || 0
    });
    return updatedCart;
  } catch (error) {
    console.log('❌ Failed to remove item from cart');
    return null;
  }
};

const testClearCart = async (token) => {
  console.log('\n🧹 Test 7: Clear cart...');
  try {
    const result = await makeRequest('DELETE', '/cart', null, token);
    console.log('✅ Cart cleared successfully');
    console.log('📊 Result:', result.message);
    return result;
  } catch (error) {
    console.log('❌ Failed to clear cart');
    return null;
  }
};

// Main test runner
const runTests = async () => {
  if (EMAIL === 'your_email@example.com' || PASSWORD === 'your_password') {
    console.log('⚠️  Please update EMAIL and PASSWORD variables first!');
    return;
  }
  
  try {
    // Test 1: Login
    const token = await testLogin();
    if (!token) {
      console.log('❌ Cannot proceed without authentication token');
      return;
    }
    
    // Test 2: Get initial cart
    let cart = await testGetCart(token);
    
    // Test 3: Add drug to cart
    cart = await testAddDrugToCart(token);
    
    // Test 4: Add product to cart
    cart = await testAddProductToCart(token);
    
    // Test 5: Update cart item
    cart = await testUpdateCartItem(token, cart);
    
    // Test 6: Remove item from cart
    cart = await testRemoveFromCart(token, cart);
    
    // Test 7: Clear cart
    await testClearCart(token);
    
    console.log('\n✨ All cart API tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export {
  testLogin,
  testGetCart,
  testAddDrugToCart,
  testAddProductToCart,
  testUpdateCartItem,
  testRemoveFromCart,
  testClearCart,
  runTests
}; 