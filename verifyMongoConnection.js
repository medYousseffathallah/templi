const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Get MongoDB URI from environment variables or use default
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/templi";

console.log("Attempting to connect to MongoDB...");
console.log(`Connection URI: ${mongoURI}`);

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("✅ MongoDB connection successful!");
    console.log("Connection details:");
    console.log(`  - Database name: ${mongoose.connection.name}`);
    console.log(`  - Host: ${mongoose.connection.host}`);
    console.log(`  - Port: ${mongoose.connection.port}`);
    console.log("\nYour MongoDB connection is working correctly.");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed!");
    console.error("Error details:", err.message);
    console.log("\nPossible solutions:");
    console.log("1. Check if your MongoDB server is running");
    console.log("2. Verify the connection string in your .env file");
    console.log("3. Ensure network connectivity to your MongoDB server");
    console.log(
      "4. Check if authentication credentials are correct (if applicable)"
    );
  })
  .finally(() => {
    // Close the connection after verification
    setTimeout(() => {
      mongoose.connection.close();
      console.log("Connection closed.");
      process.exit(0);
    }, 1000);
  });
