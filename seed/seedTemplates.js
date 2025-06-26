const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Template = require("../models/Template");
const User = require("../models/User");

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/templi")
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Sample user data
const sampleUsers = [
  {
    username: "admin",
    email: "admin@templi.com",
    password: "password123",
    bio: "Templi administrator",
    profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
    role: "admin",
  },
  {
    username: "designer1",
    email: "designer1@templi.com",
    password: "password123",
    bio: "UI/UX Designer with 5 years of experience",
    profilePicture: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    username: "developer1",
    email: "developer1@templi.com",
    password: "password123",
    bio: "Full-stack developer specializing in React and Node.js",
    profilePicture: "https://randomuser.me/api/portraits/men/3.jpg",
  },
];

// Sample template categories
const categories = [
  "Web UI",
  "Mobile App UI",
  "Dashboard UI",
  "Landing Page UI",
  "E-commerce UI",
  "Other",
];

// Sample template tags
const tags = [
  "Minimalist",
  "Dark Mode",
  "Colorful",
  "Modern",
  "Retro",
  "Corporate",
  "Creative",
  "Responsive",
  "Material Design",
  "Bootstrap",
  "Tailwind CSS",
  "React",
  "Angular",
  "Vue",
  "WordPress",
  "Shopify",
  "Wix",
];

// Function to get random items from an array
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Function to seed the database
async function seedDatabase() {
  try {
    // Clear existing data
    await Template.deleteMany({});
    await User.deleteMany({});

    console.log("Previous data cleared");

    // Create users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`${createdUsers.length} users created`);

    // Sample template data
    const sampleTemplates = [];

    // Create 20 sample templates
    for (let i = 1; i <= 20; i++) {
      const randomUser =
        createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];
      const randomTags = getRandomItems(
        tags,
        Math.floor(Math.random() * 5) + 1
      );

      sampleTemplates.push({
        title: `${randomCategory} Template ${i}`,
        description: `This modern and responsive template is designed to meet the needs of developers and designers seeking a clean, user-friendly layout. Ideal for ${randomCategory.toLowerCase()} projects, it features modular components, intuitive navigation, and seamless mobile compatibility.`,
        imageUrls: [`https://picsum.photos/id/${i + 10}/800/600`],
        tags: randomTags,
        category: randomCategory,
        subCategory: 'General',
        frameworkTools: ['HTML/CSS', 'React'],
        creator: randomUser._id,
        likes: Math.floor(Math.random() * 100),
        dislikes: Math.floor(Math.random() * 20),
      });
    }

    // Insert templates
    const createdTemplates = await Template.insertMany(sampleTemplates);
    console.log(`${createdTemplates.length} templates created`);

    // Update users with created templates
    const templatesByUser = {};
    createdTemplates.forEach((template) => {
      const creatorId = template.creator.toString();
      if (!templatesByUser[creatorId]) {
        templatesByUser[creatorId] = [];
      }
      templatesByUser[creatorId].push(template._id);
    });

    // Update each user's createdTemplates array
    for (const userId in templatesByUser) {
      await User.findByIdAndUpdate(userId, {
        $set: { createdTemplates: templatesByUser[userId] },
      });
    }

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
