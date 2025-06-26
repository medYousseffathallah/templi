const mongoose = require('mongoose');
const User = require('./models/User');
const Template = require('./models/Template');
const Interaction = require('./models/Interaction');
require('dotenv').config();

// Test the specific user ID from the error logs
const testUserId = '6856ee9dd42e05e4d4aa8b72';

async function testApiEndpoints() {
  try {
    console.log('🧪 Testing API Endpoints with ObjectId:', testUserId);
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/templi');
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Check if user exists
    console.log('\n📋 Test 1: User Existence Check');
    console.log('Testing user ID:', testUserId);
    console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(testUserId));
    
    const userExists = await User.exists({ _id: testUserId });
    console.log('User exists (direct lookup):', !!userExists);
    
    const user = await User.findById(testUserId);
    console.log('User found (findById):', user ? `${user.username} (${user.email})` : 'Not found');
    
    if (!user) {
      console.log('\n🔍 Searching for users with similar IDs...');
      const allUsers = await User.find({}, '_id username email').limit(10);
      console.log('Available users:');
      allUsers.forEach(u => {
        console.log(`  - ${u.username}: ${u._id}`);
      });
      
      console.log('\n❌ Test user not found. Please check if the user exists in the database.');
      return;
    }
    
    // Test 2: Favorites endpoint simulation
    console.log('\n📋 Test 2: Favorites Endpoint Logic');
    const userWithFavorites = await User.findById(testUserId).populate('favorites');
    console.log('Favorites count:', userWithFavorites.favorites?.length || 0);
    console.log('Favorites populated successfully:', !!userWithFavorites);
    
    // Test 3: Interactions endpoint simulation
    console.log('\n📋 Test 3: Interactions Endpoint Logic');
    const viewInteractions = await Interaction.find({ 
      user: testUserId, 
      interactionType: 'view' 
    }).populate('template');
    console.log('View interactions found:', viewInteractions.length);
    
    const downloadInteractions = await Interaction.find({ 
      user: testUserId, 
      interactionType: 'download' 
    }).populate('template');
    console.log('Download interactions found:', downloadInteractions.length);
    
    // Test 4: Template validation
    console.log('\n📋 Test 4: Template Validation');
    const templateCount = await Template.countDocuments();
    console.log('Total templates in database:', templateCount);
    
    if (viewInteractions.length > 0) {
      const sampleTemplate = viewInteractions[0].template;
      console.log('Sample template from interaction:', sampleTemplate ? sampleTemplate.title : 'Template not populated');
    }
    
    // Test 5: ObjectId conversion tests
    console.log('\n📋 Test 5: ObjectId Conversion Tests');
    const objectIdFromString = new mongoose.Types.ObjectId(testUserId);
    console.log('ObjectId from string:', objectIdFromString.toString());
    console.log('Matches original:', objectIdFromString.toString() === testUserId);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Additional function to test the getUser middleware logic
async function testGetUserLogic() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/templi');
    
    console.log('\n🔧 Testing getUser Middleware Logic');
    console.log('=' .repeat(40));
    
    const userId = testUserId;
    console.log('Input userId:', userId);
    
    // Simulate getUser middleware logic
    let user = await User.findById(userId);
    
    if (!user) {
      console.log('User not found with ObjectId, trying alternative lookup');
      user = await User.findOne({ $or: [{ username: userId }, { email: userId }] });
    }
    
    if (user) {
      console.log('✅ getUser would succeed:', user.username);
    } else {
      console.log('❌ getUser would fail: User not found');
    }
    
  } catch (error) {
    console.error('❌ getUser test failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Run tests
testApiEndpoints().then(() => {
  return testGetUserLogic();
});