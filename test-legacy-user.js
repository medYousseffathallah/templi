const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testLegacyUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const legacyUserId = '6856ee9dd42e05e4d4aa8b72';
    console.log('\n🔍 Testing legacy user ID:', legacyUserId);
    console.log('ID type:', typeof legacyUserId);
    console.log('ID length:', legacyUserId.length);
    console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(legacyUserId));
    
    // Test 1: Direct string lookup
    console.log('\n📋 Test 1: Direct string lookup');
    const userByString = await User.findOne({ _id: legacyUserId });
    console.log('Found by string:', userByString ? userByString.username : 'Not found');
    
    // Test 2: ObjectId conversion lookup
    console.log('\n📋 Test 2: ObjectId conversion lookup');
    if (mongoose.Types.ObjectId.isValid(legacyUserId)) {
      try {
        const objectId = new mongoose.Types.ObjectId(legacyUserId);
        console.log('Converted ObjectId:', objectId);
        const userByObjectId = await User.findOne({ _id: objectId });
        console.log('Found by ObjectId:', userByObjectId ? userByObjectId.username : 'Not found');
        
        if (userByObjectId) {
          console.log('\n✅ User details:');
          console.log('- ID:', userByObjectId._id);
          console.log('- Username:', userByObjectId.username);
          console.log('- Email:', userByObjectId.email);
          console.log('- Favorites count:', userByObjectId.favorites ? userByObjectId.favorites.length : 0);
        }
      } catch (conversionError) {
        console.log('ObjectId conversion failed:', conversionError.message);
      }
    }
    
    // Test 3: exists() method
    console.log('\n📋 Test 3: User.exists() method');
    const existsByString = await User.exists({ _id: legacyUserId });
    console.log('Exists by string:', existsByString);
    
    if (mongoose.Types.ObjectId.isValid(legacyUserId)) {
      const objectId = new mongoose.Types.ObjectId(legacyUserId);
      const existsByObjectId = await User.exists({ _id: objectId });
      console.log('Exists by ObjectId:', existsByObjectId);
    }
    
    // Test 4: Check all users to see ID formats
    console.log('\n📋 Test 4: Sample of all users in database');
    const allUsers = await User.find({}).limit(5);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id} (${typeof user._id}, length: ${user._id.toString().length})`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Is ObjectId format: ${mongoose.Types.ObjectId.isValid(user._id.toString())}`);
    });
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🧪 LEGACY USER ID TEST');
console.log('This script tests if the legacy ObjectId user can be found.');
console.log('Run this with: node test-legacy-user.js\n');

if (require.main === module) {
  testLegacyUser();
}

module.exports = testLegacyUser;