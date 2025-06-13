const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import models
const Template = require("./models/Template");
const User = require("./models/User");
const Interaction = require("./models/Interaction");

// Get MongoDB URI from environment variables or use default
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/templi";

console.log("🔍 Verifying MongoDB database setup...");
console.log(`Connection URI: ${mongoURI}`);

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(async () => {
    console.log("✅ MongoDB connection successful!");
    console.log("Connection details:");
    console.log(`  - Database name: ${mongoose.connection.name}`);
    console.log(`  - Host: ${mongoose.connection.host}`);
    console.log(`  - Port: ${mongoose.connection.port}`);

    // Check collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const collectionNames = collections.map((c) => c.name);

    console.log("\n📊 Database Collections:");
    console.log(collectionNames);

    // Check if our model collections exist
    const expectedCollections = ["templates", "users", "interactions"];
    const missingCollections = expectedCollections.filter(
      (name) => !collectionNames.includes(name)
    );

    if (missingCollections.length > 0) {
      console.log("\n⚠️ Missing collections:", missingCollections);
      console.log(
        "You may need to run the seed script to populate the database."
      );
      console.log("Run: node seed/seedTemplates.js");
    } else {
      console.log("\n✅ All expected collections exist!");
    }

    // Count documents in each collection
    console.log("\n📝 Collection Statistics:");

    try {
      const templateCount = await Template.countDocuments();
      console.log(`  - Templates: ${templateCount} documents`);
    } catch (err) {
      console.log(`  - Templates: Error counting - ${err.message}`);
    }

    try {
      const userCount = await User.countDocuments();
      console.log(`  - Users: ${userCount} documents`);
    } catch (err) {
      console.log(`  - Users: Error counting - ${err.message}`);
    }

    try {
      const interactionCount = await Interaction.countDocuments();
      console.log(`  - Interactions: ${interactionCount} documents`);
    } catch (err) {
      console.log(`  - Interactions: Error counting - ${err.message}`);
    }

    console.log("\n🔍 Database Verification Summary:");
    if (missingCollections.length === 0) {
      console.log("✅ Your database structure is correctly set up!");
    } else {
      console.log(
        "⚠️ Some collections are missing. Run the seed script to set up your database."
      );
    }
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
      console.log("\nConnection closed.");
      process.exit(0);
    }, 1000);
  });
