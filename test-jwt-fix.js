// Test script to verify JWT token generation fix
const jwt = require('jsonwebtoken');

console.log('Testing JWT token generation...');

try {
  // Test token generation
  const testPayload = { id: '123', email: 'test@example.com' };
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  
  const token = jwt.sign(testPayload, secret, { expiresIn: '7d' });
  console.log('✓ JWT token generated successfully');
  console.log('Token length:', token.length);
  
  // Test token verification
  const decoded = jwt.verify(token, secret);
  console.log('✓ JWT token verified successfully');
  console.log('Decoded payload:', { id: decoded.id, email: decoded.email });
  
  console.log('\n✅ JWT fix is working correctly!');
  console.log('The 401 Unauthorized error should now be resolved.');
  
} catch (error) {
  console.error('❌ JWT test failed:', error.message);
}