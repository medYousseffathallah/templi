const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('./models/Template');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/templi')
  .then(() => console.log('MongoDB connected for fixing validation issues'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function fixValidationIssues() {
  try {
    console.log('Starting validation fixes...');
    
    // Get all templates
    const templates = await Template.find({});
    console.log(`Found ${templates.length} templates to check`);
    
    let fixedCount = 0;
    
    for (const template of templates) {
      let needsUpdate = false;
      const updates = {};
      
      // Fix category issues
      if (template.category === 'Mobile App') {
        updates.category = 'Mobile App UI';
        needsUpdate = true;
      }
      if (template.category === 'Website') {
        updates.category = 'Web UI';
        needsUpdate = true;
      }
      if (template.category === 'Dashboard') {
        updates.category = 'Dashboard UI';
        needsUpdate = true;
      }
      if (template.category === 'Landing Page') {
        updates.category = 'Landing Page UI';
        needsUpdate = true;
      }
      if (template.category === 'E-commerce') {
        updates.category = 'E-commerce UI';
        needsUpdate = true;
      }
      if (['Portfolio', 'Blog'].includes(template.category)) {
        updates.category = 'Other';
        needsUpdate = true;
      }
      
      // Fix description length issues
      if (template.description && template.description.length > 500) {
        updates.description = template.description.substring(0, 497) + '...';
        needsUpdate = true;
      }
      if (template.description && template.description.length < 100) {
        updates.description = 'This modern and responsive template is designed to meet the needs of developers and designers seeking a clean, user-friendly layout. Perfect for various projects.';
        needsUpdate = true;
      }
      
      // Add missing required fields
      if (!template.subCategory) {
        updates.subCategory = 'General';
        needsUpdate = true;
      }
      
      // Fix imageUrl to imageUrls if needed
      if (template.imageUrl && !template.imageUrls) {
        updates.imageUrls = [template.imageUrl];
        updates.$unset = { imageUrl: 1 };
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await Template.findByIdAndUpdate(template._id, updates);
        fixedCount++;
        console.log(`Fixed template: ${template.title}`);
      }
    }
    
    console.log(`\nFixed ${fixedCount} templates`);
    console.log('Validation fixes completed successfully!');
    
  } catch (error) {
    console.error('Error fixing validation issues:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the fix
fixValidationIssues();