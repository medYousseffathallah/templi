const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Test if all required modules can be loaded
try {
  console.log('✓ Express loaded');
  console.log('✓ Mongoose loaded');
  console.log('✓ CORS loaded');
  console.log('✓ Dotenv loaded');
  
  // Test JWT
  const jwt = require('jsonwebtoken');
  console.log('✓ JWT loaded');
  
  // Test if models can be loaded
  const Review = require('./models/Review');
  console.log('✓ Review model loaded');
  
  const User = require('./models/User');
  console.log('✓ User model loaded');
  
  // Test if routes can be loaded
  const reviewRoutes = require('./routes/reviews');
  console.log('✓ Review routes loaded');
  
  console.log('\n🎉 All dependencies loaded successfully!');
  console.log('The server should be able to start without issues.');
  
} catch (error) {
  console.error('❌ Error loading dependencies:', error.message);
  console.error('Stack trace:', error.stack);
}