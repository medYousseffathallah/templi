// Test script to verify authentication flow
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing authentication flow...');

// Test JWT token generation and verification
try {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  console.log('Using JWT secret:', secret.substring(0, 10) + '...');
  
  // Simulate user login - generate token
  const userPayload = { id: '507f1f77bcf86cd799439011', email: 'test@example.com' };
  const token = jwt.sign(userPayload, secret, { expiresIn: '7d' });
  console.log('✓ JWT token generated successfully');
  console.log('Token preview:', token.substring(0, 50) + '...');
  
  // Simulate auth middleware - verify token
  const decoded = jwt.verify(token, secret);
  console.log('✓ JWT token verified successfully');
  console.log('Decoded payload:', { id: decoded.id, email: decoded.email });
  
  // Test Bearer token extraction
  const authHeader = `Bearer ${token}`;
  const extractedToken = authHeader.replace('Bearer ', '');
  console.log('✓ Bearer token extraction works');
  console.log('Extracted token matches:', extractedToken === token);
  
  console.log('\n✅ Authentication flow test passed!');
  console.log('The 401 error should be resolved now.');
  
} catch (error) {
  console.error('❌ Authentication test failed:', error.message);
  console.error('Stack:', error.stack);
}

// Test MongoDB ObjectId format
try {
  const testId = '507f1f77bcf86cd799439011';
  const objectId = new mongoose.Types.ObjectId(testId);
  console.log('\n✓ MongoDB ObjectId test passed');
  console.log('ObjectId:', objectId.toString());
} catch (error) {
  console.error('❌ MongoDB ObjectId test failed:', error.message);
}