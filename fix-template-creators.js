const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('./models/Template');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/templi')
  .then(() => console.log('MongoDB connected for template creator fix'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function fixTemplateCreators() {
  try {
    console.log('Checking templates with invalid creator references...');
    
    // Find all templates
    const templates = await Template.find({}).populate('creator');
    console.log(`Found ${templates.length} templates`);
    
    let fixedCount = 0;
    const users = await User.find({});
    
    for (const template of templates) {
      // Check if creator is populated correctly
      if (!template.creator || !template.creator.username) {
        console.log(`Template "${template.title}" has invalid creator reference`);
        
        // Assign to first available user as fallback
        if (users.length > 0) {
          template.creator = users[0]._id;
          await template.save();
          fixedCount++;
          console.log(`Fixed template "${template.title}" - assigned to user: ${users[0].username}`);
        }
      } else {
        console.log(`Template "${template.title}" has valid creator: ${template.creator.username}`);
      }
    }
    
    console.log(`\nFixed ${fixedCount} templates with invalid creator references`);
    
    // Verify the fix
    console.log('\nVerifying fix...');
    const verifyTemplates = await Template.find({}).populate('creator', 'name username email');
    
    for (const template of verifyTemplates) {
      if (template.creator && template.creator.username) {
        console.log(`✓ Template "${template.title}" -> Creator: ${template.creator.username}`);
      } else {
        console.log(`✗ Template "${template.title}" -> Creator: STILL INVALID`);
      }
    }
    
  } catch (error) {
    console.error('Error fixing template creators:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixTemplateCreators();