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
      // Check existing interactions
      console.log('\n=== CHECKING EXISTING INTERACTIONS ===');
      const allInteractions = await Interaction.find().populate('user', 'name email').populate('template', 'title');
      console.log(`Total interactions found: ${allInteractions.length}`);
      
      if (allInteractions.length > 0) {
        console.log('\nInteraction breakdown:');
        const interactionTypes = {};
        allInteractions.forEach(interaction => {
          interactionTypes[interaction.interactionType] = (interactionTypes[interaction.interactionType] || 0) + 1;
        });
        console.log(interactionTypes);
        
        console.log('\nSample interactions:');
        allInteractions.slice(0, 5).forEach(interaction => {
          console.log(`- ${interaction.interactionType}: User "${interaction.user?.name || 'Unknown'}" -> Template "${interaction.template?.title || 'Unknown'}"`);
        });
      }
      
      // Check favorite interactions specifically
      console.log('\n=== CHECKING FAVORITE INTERACTIONS ===');
      const favoriteInteractions = await Interaction.find({ interactionType: 'favorite' })
        .populate('user', 'name email')
        .populate('template', 'title');
      console.log(`Favorite interactions found: ${favoriteInteractions.length}`);
      
      if (favoriteInteractions.length > 0) {
        favoriteInteractions.forEach(interaction => {
          console.log(`- User "${interaction.user?.name || 'Unknown'}" favorited "${interaction.template?.title || 'Unknown'}"`);
        });
      }
      
      // Check users with favorites in their profile
      console.log('\n=== CHECKING USER FAVORITES ARRAYS ===');
      const usersWithFavorites = await User.find({ favorites: { $exists: true, $ne: [] } })
        .populate('favorites', 'title');
      console.log(`Users with favorites: ${usersWithFavorites.length}`);
      
      if (usersWithFavorites.length > 0) {
        usersWithFavorites.forEach(user => {
          console.log(`- User "${user.name}": ${user.favorites.length} favorites`);
          user.favorites.forEach(template => {
            console.log(`  * ${template.title}`);
          });
        });
      }
      
      // Test trending query for favorites
      console.log('\n=== TESTING TRENDING FAVORITES QUERY ===');
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const trendingFavorites = await Interaction.aggregate([
        {
          $match: {
            interactionType: 'favorite',
            createdAt: { $gte: oneWeekAgo }
          }
        },
        {
          $group: {
            _id: '$template',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        },
        {
          $lookup: {
            from: 'templates',
            localField: '_id',
            foreignField: '_id',
            as: 'template'
          }
        },
        {
          $unwind: '$template'
        },
        {
          $addFields: {
            favoriteCount: '$count'
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: ['$template', { favoriteCount: '$favoriteCount' }]
            }
          }
        }
      ]);
      
      console.log(`Trending favorites this week: ${trendingFavorites.length}`);
      if (trendingFavorites.length > 0) {
        trendingFavorites.forEach((template, index) => {
          console.log(`${index + 1}. "${template.title}" - ${template.favoriteCount} favorites`);
        });
      } else {
        console.log('No favorite interactions found in the last week.');
      }
      
    } catch (error) {
      console.error('Error during testing:', error);
    } finally {
      mongoose.disconnect();
      console.log('\nDisconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });