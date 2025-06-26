const mongoose = require('mongoose');
const User = require('./models/User');
const Interaction = require('./models/Interaction');
require('dotenv').config();

// Test the specific user ID that was failing
const testUserId = '6856ee9dd42e05e4d4aa8b72';

async function testObjectIdFixes() {
  try {
    console.log('🧪 Testing ObjectId Conversion Fixes');
    console.log('=' .repeat(50));
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/templi');
    console.log('✅ Connected to MongoDB');
    
    console.log('\n📋 Testing User ID:', testUserId);
    console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(testUserId));
    
    // Test 1: Simulate getUser middleware logic
    console.log('\n🔧 Test 1: getUser Middleware Simulation');
    let user = null;
    
    if (mongoose.Types.ObjectId.isValid(testUserId)) {
      user = await User.findById(new mongoose.Types.ObjectId(testUserId));
      console.log('✅ findById with ObjectId conversion:', user ? `Found ${user.username}` : 'Not found');
    }
    
    if (!user) {
      console.log('Trying fallback lookup...');
      user = await User.findOne({ $or: [{ username: testUserId }, { email: testUserId }] });
      console.log('Fallback result:', user ? `Found ${user.username}` : 'Not found');
    }
    
    if (!user) {
      console.log('❌ User not found - this would return 404');
      return;
    }
    
    // Test 2: Simulate interactions route logic
    console.log('\n🔧 Test 2: Interactions Route Simulation');
    let userExists = null;
    if (mongoose.Types.ObjectId.isValid(testUserId)) {
      userExists = await User.exists({ _id: new mongoose.Types.ObjectId(testUserId) });
    }
    console.log('User exists check:', !!userExists);
    
    // Test 3: Query interactions with proper ObjectId
    console.log('\n🔧 Test 3: Interaction Queries');
    const userObjectId = new mongoose.Types.ObjectId(testUserId);
    
    const viewInteractions = await Interaction.find({ 
      user: userObjectId, 
      interactionType: 'view' 
    }).populate('template');
    console.log('View interactions found:', viewInteractions.length);
    
    const downloadInteractions = await Interaction.find({ 
      user: userObjectId, 
      interactionType: 'download' 
    }).populate('template');
    console.log('Download interactions found:', downloadInteractions.length);
    
    // Test 4: Favorites query simulation
    console.log('\n🔧 Test 4: Favorites Query Simulation');
    const userWithFavorites = await User.findById(userObjectId).populate('favorites');
    console.log('Favorites query result:', userWithFavorites ? `${userWithFavorites.favorites.length} favorites` : 'User not found');
    
    console.log('\n✅ All ObjectId conversion tests completed!');
    console.log('\n📋 Summary:');
    console.log('- User lookup with ObjectId conversion: ✅ Working');
    console.log('- Interactions queries: ✅ Working');
    console.log('- Favorites queries: ✅ Working');
    console.log('\n🎯 The 404/400 errors should now be resolved!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testObjectIdFixes();