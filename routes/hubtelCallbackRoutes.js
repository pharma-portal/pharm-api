import express from 'express';
import { handleHubtelCallback } from '../controllers/orderController.js';

const router = express.Router();

// Hubtel callback endpoint (public - no authentication required)
router.post('/', (req, res, next) => {
  console.log('📞 POST request received at /api/hubtel-callback');
  console.log('📤 Request body:', req.body);
  console.log('🔍 Calling handleHubtelCallback...');
  
  // Call the actual handler
  handleHubtelCallback(req, res, next);
});

// Add a simple test POST route to verify POST routing works
router.post('/test-post', (req, res) => {
  res.json({ 
    message: 'POST route is working!', 
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString() 
  });
});

// Add a simple test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Hubtel callback router is working!', timestamp: new Date().toISOString() });
});

// Add debug logging
console.log('🔧 Hubtel callback routes loaded successfully');
console.log('📍 Route: POST /api/hubtel-callback');
console.log('📍 Route: GET /api/hubtel-callback/test');

export default router;
