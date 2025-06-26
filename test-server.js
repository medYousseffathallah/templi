const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Test if all required modules can be loaded
try {
  console.log('✓ Express loaded successfully');
  console.log('✓ Mongoose loaded successfully');
  console.log('✓ CORS loaded successfully');
  console.log('✓ Dotenv loaded successfully');
  
  // Test JWT
  const jwt = require('jsonwebtoken');
  console.log('✓ JWT loaded successfully');
  
  // Test if models can be loaded
  const User = require('./models/User');
  const Review = require('./models/Review');
  console.log('✓ Models loaded successfully');
  
  // Test if routes can be loaded
  const reviewRoutes = require('./routes/reviews');
  console.log('✓ Routes loaded successfully');
  
  console.log('\n🎉 All dependencies and modules are working correctly!');
  console.log('\nTo start the server, run: node server.js');
  console.log('The server should start on port 5000');
  
} catch (error) {
  console.error('❌ Error loading modules:', error.message);
  console.log('\nPlease run: npm install');
}