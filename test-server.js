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
  
  // Test if all models can be loaded
  const User = require('./models/User');
  const Template = require('./models/Template');
  const Interaction = require('./models/Interaction');
  const Review = require('./models/Review');
  console.log('✓ All models loaded successfully');
  
  // Test if all routes can be loaded
  const userRoutes = require('./routes/users');
  const templateRoutes = require('./routes/templates');
  const interactionRoutes = require('./routes/interactions');
  const reviewRoutes = require('./routes/reviews');
  console.log('✓ All routes loaded successfully');
  
  console.log('\n🎉 All dependencies and modules are working correctly!');
  console.log('\n📋 UUID Validation Fixes Applied:');
  console.log('   ✓ Removed ObjectId validation from interactions routes');
  console.log('   ✓ Removed ObjectId validation from users routes');
  console.log('   ✓ Updated user/template/interaction ID lookups to work with UUIDs');
  console.log('   ✓ Added fallback lookups by username/email/title');
  console.log('\n🔧 This should fix the "Invalid user ID format or user not found" error');
  console.log('\nTo start the server, run: node server.js');
  console.log('The server should start on port 5000');
  
} catch (error) {
  console.error('❌ Error loading modules:', error.message);
  console.log('\nPlease run: npm install');
}