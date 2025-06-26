const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/templi')
  .then(() => console.log('Connected to MongoDB for migration'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define old schemas (with ObjectId)
const oldUserSchema = new mongoose.Schema({}, { strict: false });
const oldTemplateSchema = new mongoose.Schema({}, { strict: false });
const oldInteractionSchema = new mongoose.Schema({}, { strict: false });

const OldUser = mongoose.model('OldUser', oldUserSchema, 'users');
const OldTemplate = mongoose.model('OldTemplate', oldTemplateSchema, 'templates');
const OldInteraction = mongoose.model('OldInteraction', oldInteractionSchema, 'interactions');

async function migrateToUUID() {
  try {
    console.log('Starting migration to UUID...');
    
    // Create mapping for old ObjectId to new UUID
    const userIdMapping = new Map();
    const templateIdMapping = new Map();
    
    // Step 1: Migrate Users
    console.log('Migrating users...');
    const users = await OldUser.find({});
    
    for (const user of users) {
      const newUUID = uuidv4();
      userIdMapping.set(user._id.toString(), newUUID);
      
      // Create new user document with UUID
      const newUserData = {
        ...user.toObject(),
        _id: newUUID,
        favorites: [], // Will be updated later
        createdTemplates: [], // Will be updated later
        reviews: [] // New field
      };
      
      // Remove old _id and __v
      delete newUserData.__v;
      
      await mongoose.connection.collection('users_new').insertOne(newUserData);
      console.log(`Migrated user: ${user.username || user.email} -> ${newUUID}`);
    }
    
    // Step 2: Migrate Templates
    console.log('Migrating templates...');
    const templates = await OldTemplate.find({});
    
    for (const template of templates) {
      const newUUID = uuidv4();
      templateIdMapping.set(template._id.toString(), newUUID);
      
      // Update creator reference
      const newCreatorId = userIdMapping.get(template.creator?.toString());
      
      const newTemplateData = {
        ...template.toObject(),
        _id: newUUID,
        creator: newCreatorId || template.creator
      };
      
      delete newTemplateData.__v;
      
      await mongoose.connection.collection('templates_new').insertOne(newTemplateData);
      console.log(`Migrated template: ${template.title} -> ${newUUID}`);
    }
    
    // Step 3: Update user favorites and createdTemplates
    console.log('Updating user references...');
    const newUsers = await mongoose.connection.collection('users_new').find({}).toArray();
    
    for (const user of newUsers) {
      const updates = {};
      
      // Update favorites
      if (user.favorites && user.favorites.length > 0) {
        const newFavorites = user.favorites
          .map(fav => templateIdMapping.get(fav.toString()))
          .filter(Boolean);
        updates.favorites = newFavorites;
      }
      
      // Update createdTemplates
      if (user.createdTemplates && user.createdTemplates.length > 0) {
        const newCreatedTemplates = user.createdTemplates
          .map(temp => templateIdMapping.get(temp.toString()))
          .filter(Boolean);
        updates.createdTemplates = newCreatedTemplates;
      }
      
      if (Object.keys(updates).length > 0) {
        await mongoose.connection.collection('users_new').updateOne(
          { _id: user._id },
          { $set: updates }
        );
      }
    }
    
    // Step 4: Migrate Interactions
    console.log('Migrating interactions...');
    const interactions = await OldInteraction.find({});
    
    for (const interaction of interactions) {
      const newUserId = userIdMapping.get(interaction.user?.toString());
      const newTemplateId = templateIdMapping.get(interaction.template?.toString());
      
      if (newUserId && newTemplateId) {
        const newInteractionData = {
          ...interaction.toObject(),
          _id: uuidv4(),
          user: newUserId,
          template: newTemplateId
        };
        
        delete newInteractionData.__v;
        
        await mongoose.connection.collection('interactions_new').insertOne(newInteractionData);
      }
    }
    
    console.log('Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Backup your current collections');
    console.log('2. Replace old collections with new ones:');
    console.log('   - Rename users to users_backup');
    console.log('   - Rename users_new to users');
    console.log('   - Rename templates to templates_backup');
    console.log('   - Rename templates_new to templates');
    console.log('   - Rename interactions to interactions_backup');
    console.log('   - Rename interactions_new to interactions');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

migrateToUUID();