const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/templi')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function checkDatabase() {
  try {
    console.log('Checking current database state...');
    
    // Check users collection
    const users = await mongoose.connection.collection('users').find({}).limit(5).toArray();
    console.log('\n=== USERS COLLECTION ===');
    console.log(`Total users: ${await mongoose.connection.collection('users').countDocuments()}`);
    console.log('Sample users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id} (Type: ${typeof user._id}, Length: ${user._id.toString().length})`);
      console.log(`   Username: ${user.username || 'N/A'}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   ID Format: ${mongoose.Types.ObjectId.isValid(user._id) ? 'ObjectId' : 'UUID/String'}`);
      console.log('');
    });
    
    // Check templates collection
    const templates = await mongoose.connection.collection('templates').find({}).limit(3).toArray();
    console.log('\n=== TEMPLATES COLLECTION ===');
    console.log(`Total templates: ${await mongoose.connection.collection('templates').countDocuments()}`);
    console.log('Sample templates:');
    templates.forEach((template, index) => {
      console.log(`${index + 1}. ID: ${template._id} (Type: ${typeof template._id})`);
      console.log(`   Title: ${template.title || 'N/A'}`);
      console.log(`   Creator: ${template.creator} (Type: ${typeof template.creator})`);
      console.log(`   Template ID Format: ${mongoose.Types.ObjectId.isValid(template._id) ? 'ObjectId' : 'UUID/String'}`);
      console.log(`   Creator ID Format: ${mongoose.Types.ObjectId.isValid(template.creator) ? 'ObjectId' : 'UUID/String'}`);
      console.log('');
    });
    
    // Check interactions collection
    const interactions = await mongoose.connection.collection('interactions').find({}).limit(3).toArray();
    console.log('\n=== INTERACTIONS COLLECTION ===');
    console.log(`Total interactions: ${await mongoose.connection.collection('interactions').countDocuments()}`);
    console.log('Sample interactions:');
    interactions.forEach((interaction, index) => {
      console.log(`${index + 1}. ID: ${interaction._id}`);
      console.log(`   User: ${interaction.user} (Format: ${mongoose.Types.ObjectId.isValid(interaction.user) ? 'ObjectId' : 'UUID/String'})`);
      console.log(`   Template: ${interaction.template} (Format: ${mongoose.Types.ObjectId.isValid(interaction.template) ? 'ObjectId' : 'UUID/String'})`);
      console.log(`   Type: ${interaction.type}`);
      console.log('');
    });
    
    // Check reviews collection
    const reviews = await mongoose.connection.collection('reviews').find({}).limit(3).toArray();
    console.log('\n=== REVIEWS COLLECTION ===');
    console.log(`Total reviews: ${await mongoose.connection.collection('reviews').countDocuments()}`);
    if (reviews.length > 0) {
      console.log('Sample reviews:');
      reviews.forEach((review, index) => {
        console.log(`${index + 1}. ID: ${review._id}`);
        console.log(`   Reviewer: ${review.reviewer}`);
        console.log(`   Reviewed User: ${review.reviewedUser}`);
        console.log(`   Rating: ${review.rating}`);
        console.log('');
      });
    } else {
      console.log('No reviews found in database.');
    }
    
    console.log('\n=== SUMMARY ===');
    const userIdFormats = users.map(u => mongoose.Types.ObjectId.isValid(u._id) ? 'ObjectId' : 'UUID');
    const templateIdFormats = templates.map(t => mongoose.Types.ObjectId.isValid(t._id) ? 'ObjectId' : 'UUID');
    
    console.log(`User ID formats: ${[...new Set(userIdFormats)].join(', ')}`);
    console.log(`Template ID formats: ${[...new Set(templateIdFormats)].join(', ')}`);
    
    if (userIdFormats.includes('ObjectId') || templateIdFormats.includes('ObjectId')) {
      console.log('\n⚠️  WARNING: Found ObjectId format IDs in database!');
      console.log('   This means the migration to UUID has not been completed.');
      console.log('   Run the migration script: node migrate-to-uuid.js');
    } else {
      console.log('\n✅ All IDs are in UUID format!');
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkDatabase();