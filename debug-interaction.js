const mongoose = require('mongoose');
const User = require('./models/User');
const Template = require('./models/Template');
require('dotenv').config();

async function debugInteraction() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all users to see their structure
    const users = await User.find({}).limit(5);
    console.log('\nFirst 5 users:');
    users.forEach(user => {
      console.log(`ID: ${user._id}, Username: ${user.username}, Email: ${user.email}`);
    });
    
    // Get all templates to see their structure
    const templates = await Template.find({}).limit(5);
    console.log('\nFirst 5 templates:');
    templates.forEach(template => {
      console.log(`ID: ${template._id}, Title: ${template.title}`);
    });
    
    // Test a specific user lookup
    if (users.length > 0) {
      const testUserId = users[0]._id;
      console.log(`\nTesting user lookup with ID: ${testUserId}`);
      
      const userExists = await User.exists({ _id: testUserId });
      console.log('User exists check:', userExists);
      
      const foundUser = await User.findById(testUserId);
      console.log('Found user:', foundUser ? foundUser.username : 'Not found');
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

debugInteraction();