const mongoose = require('mongoose');
const User = require('./models/User');
const Template = require('./models/Template');
const Interaction = require('./models/Interaction');

async function testStats() {
  try {
    await mongoose.connect('mongodb://localhost:27017/templi');
    
    const user = await User.findOne({username: 'salmen'});
    console.log('Testing stats for user:', user.username, 'ID:', user._id);
    
    const userTemplates = await Template.find({ creator: user._id });
    const templateIds = userTemplates.map(template => template._id);
    console.log('User templates:', templateIds);
    
    const favoriteInteractions = await Interaction.countDocuments({
      template: { $in: templateIds },
      interactionType: 'favorite'
    });
    
    console.log('Favorite interactions count:', favoriteInteractions);
    
    // Check specific interactions for this template
    const interactions = await Interaction.find({
      template: { $in: templateIds },
      interactionType: 'favorite'
    });
    
    console.log('Actual favorite interactions:', interactions);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testStats();