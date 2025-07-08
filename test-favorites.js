const mongoose = require('mongoose');
const User = require('./models/User');
const Template = require('./models/Template');
const Interaction = require('./models/Interaction');

async function testFavorites() {
  try {
    await mongoose.connect('mongodb://localhost:27017/templi');
    
    const user = await User.findOne({username: 'salmen'});
    console.log('User salmen ID:', user._id);
    console.log('User salmen favorites array:', user.favorites);
    
    // Check if user has favorited any templates
    const favoriteTemplates = await Template.find({_id: {$in: user.favorites}});
    console.log('Templates in salmen favorites:', favoriteTemplates.map(t => ({id: t._id, title: t.title})));
    
    // Check all templates by salmen
    const userTemplates = await Template.find({creator: user._id});
    console.log('All templates by salmen:', userTemplates.map(t => ({id: t._id, title: t.title})));
    
    // Check if any of salmen's templates have favorites from other users
    for (const template of userTemplates) {
      const favorites = await Interaction.find({
        template: template._id,
        interactionType: 'favorite'
      });
      console.log(`Template "${template.title}" has ${favorites.length} favorites:`, favorites.map(f => f.user));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testFavorites();