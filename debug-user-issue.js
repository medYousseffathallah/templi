// Debug script to identify the user ID issue
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function debugUserIssue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if we have any users
    const userCount = await User.countDocuments();
    console.log(`Total users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('\n❌ NO USERS FOUND IN DATABASE!');
      console.log('This is likely the root cause of the issue.');
      console.log('You need to create a user first.');
      
      // Create a test user
      const testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      
      await testUser.save();
      console.log('\n✅ Created test user:');
      console.log(`ID: ${testUser._id}`);
      console.log(`Username: ${testUser.username}`);
      console.log(`Email: ${testUser.email}`);
      
    } else {
      // Show existing users
      const users = await User.find({}).limit(3);
      console.log('\n📋 Existing users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user._id} (${typeof user._id})`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   ID Length: ${user._id.length}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Instructions for the user
console.log('🔍 USER ID DEBUG SCRIPT');
console.log('This script will help identify why user IDs are not being found.');
console.log('Run this with: node debug-user-issue.js\n');

if (require.main === module) {
  debugUserIssue();
}

module.exports = debugUserIssue;