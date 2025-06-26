const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testUserId = '6856ee9dd42e05e4d4aa8b72';

async function debugUserLookup() {
  try {
    console.log('🔍 Debugging user lookup for ID:', testUserId);
    console.log('ID type:', typeof testUserId);
    console.log('ID length:', testUserId.length);
    console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(testUserId));
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/templi');
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Direct findById
    console.log('\n📋 Test 1: Direct findById');
    const userById = await User.findById(testUserId);
    console.log('Result:', userById ? `Found user: ${userById.username}` : 'User not found');
    
    // Test 2: Find with _id query
    console.log('\n📋 Test 2: Find with _id query');
    const userByQuery = await User.findOne({ _id: testUserId });
    console.log('Result:', userByQuery ? `Found user: ${userByQuery.username}` : 'User not found');
    
    // Test 3: Find with ObjectId conversion
    console.log('\n📋 Test 3: Find with ObjectId conversion');
    const userByObjectId = await User.findOne({ _id: new mongoose.Types.ObjectId(testUserId) });
    console.log('Result:', userByObjectId ? `Found user: ${userByObjectId.username}` : 'User not found');
    
    // Test 4: List all users to see what IDs exist
    console.log('\n📋 Test 4: List all users');
    const allUsers = await User.find({}, '_id username email').limit(5);
    console.log('Found users:');
    allUsers.forEach(user => {
      console.log(`  - ${user.username}: ${user._id} (type: ${typeof user._id})`);
    });
    
    // Test 5: Check if the specific ID exists in any format
    console.log('\n📋 Test 5: Search by username/email fallback');
    const userByFallback = await User.findOne({ 
      $or: [{ username: testUserId }, { email: testUserId }] 
    });
    console.log('Fallback result:', userByFallback ? `Found user: ${userByFallback.username}` : 'User not found');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugUserLookup();