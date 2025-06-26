// Simple syntax check for interactions.js
try {
  require('./routes/interactions.js');
  console.log('✅ interactions.js syntax is correct');
} catch (error) {
  console.error('❌ Syntax error in interactions.js:', error.message);
  console.error('Stack:', error.stack);
}

// Check other route files too
const routeFiles = ['users.js', 'templates.js', 'reviews.js'];

routeFiles.forEach(file => {
  try {
    require(`./routes/${file}`);
    console.log(`✅ ${file} syntax is correct`);
  } catch (error) {
    console.error(`❌ Syntax error in ${file}:`, error.message);
  }
});

console.log('\n🔧 Syntax check complete!');