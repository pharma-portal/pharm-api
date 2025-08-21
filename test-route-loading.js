// Test if the route files can be imported without errors
console.log('🧪 Testing route file imports...');

try {
  console.log('📁 Importing hubtelCallbackRoutes...');
  const hubtelCallbackRoutes = await import('./routes/hubtelCallbackRoutes.js');
  console.log('✅ hubtelCallbackRoutes imported successfully');
  console.log('🔍 Route object:', hubtelCallbackRoutes.default);
  
  console.log('\n📁 Importing orderController...');
  const orderController = await import('./controllers/orderController.js');
  console.log('✅ orderController imported successfully');
  console.log('🔍 handleHubtelCallback function:', typeof orderController.handleHubtelCallback);
  
} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('Stack:', error.stack);
}
