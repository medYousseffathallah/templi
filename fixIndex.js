const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/templi');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('interactions');
    
    // Drop the old unique index
    try {
      await collection.dropIndex('user_1_template_1_interactionType_1');
      console.log('Old index dropped successfully');
    } catch (err) {
      console.log('Index may not exist or already dropped:', err.message);
    }
    
    // Create new partial index
    await collection.createIndex(
      { user: 1, template: 1, interactionType: 1 },
      { 
        unique: true,
        partialFilterExpression: { interactionType: { $in: ["like", "dislike", "favorite"] } },
        name: 'user_template_interactionType_partial'
      }
    );
    console.log('New partial index created successfully');
    
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('Error fixing index:', error);
    process.exit(1);
  }
}

fixIndex();