const mongoose = require('mongoose');
const User = require('./models/User');
const Template = require('./models/Template');
const Interaction = require('./models/Interaction');

async function testObjectIdFix() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/templi', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Test the specific user ID that was causing issues
    const testUserId = '6856ee9dd42e05e4d4aa8b72';
    console.log('\nTesting user ID:', testUserId);
    console.log('ID type:', typeof testUserId);
    console.log('ID length:', testUserId.length);
    console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(testUserId));

    // Try to find the user
    const user = await User.findById(testUserId);
    console.log('\nUser found by findById:', user ? user.username : 'not found');

    if (user) {
      console.log('User details:');
      console.log('- ID:', user._id);
      console.log('- Username:', user.username);
      console.log('- Email:', user.email);
      console.log('- Favorites count:', user.favorites ? user.favorites.length : 0);

      // Test favorites lookup
      console.log('\nTesting favorites lookup...');
      const userWithFavorites = await User.findById(testUserId).populate('favorites');
      console.log('Favorites populated:', userWithFavorites.favorites.length);

      // Test interactions lookup
      console.log('\nTesting interactions lookup...');
      const interactions = await Interaction.find({ user: testUserId });
      console.log('Interactions found:', interactions.length);

      if (interactions.length > 0) {
        console.log('Sample interaction types:', interactions.map(i => i.interactionType));
      }
    }

    // Test template lookup
    console.log('\nTesting template count...');
    const templateCount = await Template.countDocuments();
    console.log('Total templates:', templateCount);

    console.log('\n✅ ObjectId fix test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testObjectIdFix();