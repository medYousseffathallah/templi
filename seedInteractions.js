const mongoose = require('mongoose');
const Interaction = require('./models/Interaction');
const Template = require('./models/Template');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/templi')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Get existing users and templates
      const users = await User.find().limit(5);
      const templates = await Template.find().limit(10);
      
      if (users.length === 0 || templates.length === 0) {
        console.log('No users or templates found. Please run the seed script first.');
        return;
      }
      
      console.log(`Found ${users.length} users and ${templates.length} templates`);
      
      // Clear existing interactions
      await Interaction.deleteMany({});
      console.log('Cleared existing interactions');
      
      const interactions = [];
      
      // Create some like interactions
      for (let i = 0; i < 20; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        // Create interaction within the last week
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 7));
        
        interactions.push({
          user: user._id,
          template: template._id,
          interactionType: 'like',
          createdAt
        });
      }
      
      // Create some favorite interactions
      for (let i = 0; i < 15; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        // Create interaction within the last week
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 7));
        
        interactions.push({
          user: user._id,
          template: template._id,
          interactionType: 'favorite',
          createdAt
        });
      }
      
      // Create some older interactions (outside the week)
      for (let i = 0; i < 10; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        // Create interaction older than a week
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - (8 + Math.floor(Math.random() * 30)));
        
        interactions.push({
          user: user._id,
          template: template._id,
          interactionType: Math.random() > 0.5 ? 'like' : 'favorite',
          createdAt
        });
      }
      
      // Insert all interactions
      const createdInteractions = await Interaction.insertMany(interactions);
      console.log(`Created ${createdInteractions.length} interactions`);
      
      // Show summary
      const likeCount = await Interaction.countDocuments({ interactionType: 'like' });
      const favoriteCount = await Interaction.countDocuments({ interactionType: 'favorite' });
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyLikes = await Interaction.countDocuments({ 
        interactionType: 'like', 
        createdAt: { $gte: oneWeekAgo } 
      });
      
      const weeklyFavorites = await Interaction.countDocuments({ 
        interactionType: 'favorite', 
        createdAt: { $gte: oneWeekAgo } 
      });
      
      console.log('\n=== INTERACTION SUMMARY ===');
      console.log(`Total likes: ${likeCount}`);
      console.log(`Total favorites: ${favoriteCount}`);
      console.log(`Likes this week: ${weeklyLikes}`);
      console.log(`Favorites this week: ${weeklyFavorites}`);
      
      // Update user favorites arrays
      console.log('\n=== UPDATING USER FAVORITES ===');
      const favoriteInteractions = await Interaction.find({ interactionType: 'favorite' })
        .populate('user')
        .populate('template');
      
      for (const interaction of favoriteInteractions) {
        await User.findByIdAndUpdate(
          interaction.user._id,
          { $addToSet: { favorites: interaction.template._id } }
        );
      }
      
      console.log(`Updated favorites for ${favoriteInteractions.length} interactions`);
      
      console.log('\n✅ Interaction seeding completed successfully!');
      console.log('You can now test the trending endpoints:');
      console.log('- GET /api/templates/trending/like');
      console.log('- GET /api/templates/trending/favorite');
      
    } catch (error) {
      console.error('Error during seeding:', error);
    } finally {
      mongoose.disconnect();
      console.log('\nDisconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });