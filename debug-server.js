// Simple debug script to test server components
console.log('Starting debug script...');

try {
  console.log('Testing express import...');
  const express = require('express');
  console.log('✓ Express imported successfully');
  
  console.log('Testing mongoose import...');
  const mongoose = require('mongoose');
  console.log('✓ Mongoose imported successfully');
  
  console.log('Testing cors import...');
  const cors = require('cors');
  console.log('✓ CORS imported successfully');
  
  console.log('Testing dotenv import...');
  const dotenv = require('dotenv');
  console.log('✓ Dotenv imported successfully');
  
  console.log('Testing jsonwebtoken import...');
  const jwt = require('jsonwebtoken');
  console.log('✓ JWT imported successfully');
  
  console.log('Testing uuid import...');
  const { v4: uuidv4 } = require('uuid');
  console.log('✓ UUID imported successfully');
  
  console.log('Loading environment variables...');
  dotenv.config();
  console.log('✓ Environment variables loaded');
  
  console.log('Testing express app creation...');
  const app = express();
  console.log('✓ Express app created successfully');
  
  console.log('Testing middleware setup...');
  app.use(cors());
  app.use(express.json());
  console.log('✓ Middleware setup successful');
  
  console.log('Testing route imports...');
  const userRoutes = require('./routes/users');
  console.log('✓ User routes imported');
  
  const reviewRoutes = require('./routes/reviews');
  console.log('✓ Review routes imported');
  
  const templateRoutes = require('./routes/templates');
  console.log('✓ Template routes imported');
  
  const interactionRoutes = require('./routes/interactions');
  console.log('✓ Interaction routes imported');
  
  console.log('\n🎉 All components loaded successfully!');
  console.log('The server should be able to start now.');
  
} catch (error) {
  console.error('❌ Error occurred:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}