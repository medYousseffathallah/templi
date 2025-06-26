// Quick test to verify ObjectId handling
const mongoose = require('mongoose');

// Test ObjectId validation
const testId = '6856ee9dd42e05e4d4aa8b72';
console.log('Testing ID:', testId);
console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(testId));
console.log('ID length:', testId.length);
console.log('ID type:', typeof testId);

// Test ObjectId creation
try {
  const objectId = new mongoose.Types.ObjectId(testId);
  console.log('ObjectId created successfully:', objectId.toString());
  console.log('ObjectId equals original:', objectId.toString() === testId);
} catch (error) {
  console.error('ObjectId creation failed:', error.message);
}

console.log('✅ Quick test completed');