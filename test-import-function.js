// Test importing the handleHubtelCallback function
console.log('🧪 Testing handleHubtelCallback import...');

try {
  // Import the function
  const { handleHubtelCallback } = await import('./controllers/orderController.js');
  
  console.log('✅ handleHubtelCallback imported successfully');
  console.log('🔍 Function type:', typeof handleHubtelCallback);
  console.log('🔍 Function name:', handleHubtelCallback.name);
  
  // Test if it's a function we can call
  if (typeof handleHubtelCallback === 'function') {
    console.log('✅ handleHubtelCallback is a callable function');
  } else {
    console.log('❌ handleHubtelCallback is not a function');
  }
  
} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('Stack:', error.stack);
}
