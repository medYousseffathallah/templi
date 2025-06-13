const mongoose = require("mongoose");
const Template = require("./models/Template");
const User = require("./models/User");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/templi")
  .then(async () => {
    console.log("Connected to MongoDB");

    // Check if we already have templates
    const existingTemplates = await Template.find();
    if (existingTemplates.length > 0) {
      console.log(
        "Templates already exist in the database:",
        existingTemplates.length
      );
      mongoose.disconnect();
      return;
    }

    // Create a sample user if none exists
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: "Sample User",
        email: "sample@example.com",
        password: "password123",
      });
      console.log("Created sample user:", user._id);
    }

    // Sample templates
    const templates = [
      {
        title: "Modern Landing Page",
        description:
          "A beautiful landing page template with modern design and responsive layout. Perfect for landing page projects.",
        imageUrl: "https://picsum.photos/id/30/800/600",
        tags: ["Shopify", "Bootstrap"],
        category: "Landing Page",
        creator: user._id,
        likes: 40,
        dislikes: 13,
      },
      {
        title: "E-commerce Dashboard",
        description:
          "Complete dashboard for e-commerce websites with analytics, inventory management, and order processing.",
        imageUrl: "https://picsum.photos/id/60/800/600",
        tags: ["React", "Dashboard", "E-commerce"],
        category: "Dashboard",
        creator: user._id,
        likes: 85,
        dislikes: 5,
      },
      {
        title: "Portfolio Template",
        description:
          "Showcase your work with this elegant portfolio template. Includes project gallery and contact form.",
        imageUrl: "https://picsum.photos/id/42/800/600",
        tags: ["Portfolio", "Creative"],
        category: "Portfolio",
        creator: user._id,
        likes: 120,
        dislikes: 8,
      },
      {
        title: "Blog Theme",
        description:
          "Clean and minimal blog theme with excellent typography and reading experience.",
        imageUrl: "https://picsum.photos/id/24/800/600",
        tags: ["Blog", "WordPress"],
        category: "Blog",
        creator: user._id,
        likes: 65,
        dislikes: 3,
      },
      {
        title: "Admin Panel",
        description:
          "Fully featured admin panel template with dark mode support and multiple dashboard views.",
        imageUrl: "https://picsum.photos/id/48/800/600",
        tags: ["Admin", "Dashboard"],
        category: "Admin",
        creator: user._id,
        likes: 92,
        dislikes: 7,
      },
    ];

    // Insert templates
    const result = await Template.insertMany(templates);
    console.log("Templates added to database:", result.length);

    mongoose.disconnect();
  })
  .catch((err) => console.error("Error:", err));
