const axios = require('axios');

// Test the backend API endpoints
async function testBackend() {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // Test if server is running
    console.log('Testing server connection...');
    const response = await axios.get(`${baseURL}/users`);
    console.log('✅ Server is running');
    
    // Test a specific user ID (you'll need to replace with a real user ID)
    const testUserId = '507f1f77bcf86cd799439011'; // Example ObjectId
    
    try {
      console.log(`Testing user templates endpoint for user: ${testUserId}`);
      const templatesResponse = await axios.get(`${baseURL}/users/${testUserId}/templates`);
      console.log('✅ Templates endpoint working:', templatesResponse.data.length, 'templates found');
    } catch (err) {
      console.log('❌ Templates endpoint error:', err.response?.status, err.response?.data?.message);
    }
    
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
    console.log('Make sure to start the backend server with: node server.js');
  }
}

testBackend();