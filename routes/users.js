const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get all users (admin only in a real app)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user profile
router.get("/:id", getUser, (req, res) => {
  // Don't send password in response
  const userObject = res.user.toObject();
  delete userObject.password;
  res.json(userObject);
});

// Register a new user
router.post("/register", async (req, res) => {
  // In a real app, you would hash the password before saving
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    bio: req.body.bio,
    profilePicture: req.body.profilePicture,
  });

  try {
    const newUser = await user.save();
    // Don't send password in response
    const userObject = newUser.toObject();
    delete userObject.password;
    res.status(201).json(userObject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    // In a real app, you would verify the hashed password
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.password !== req.body.password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // In a real app, you would generate and return a JWT token here
    const userObject = user.toObject();
    delete userObject.password;
    res.json({
      user: userObject,
      token: "sample-jwt-token", // This would be a real JWT in production
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile
router.patch("/:id", getUser, async (req, res) => {
  if (req.body.username) res.user.username = req.body.username;
  if (req.body.email) res.user.email = req.body.email;
  if (req.body.password) res.user.password = req.body.password; // Would hash in real app
  if (req.body.bio) res.user.bio = req.body.bio;
  if (req.body.profilePicture)
    res.user.profilePicture = req.body.profilePicture;

  try {
    const updatedUser = await res.user.save();
    // Don't send password in response
    const userObject = updatedUser.toObject();
    delete userObject.password;
    res.json(userObject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get user's favorite templates
router.get("/:id/favorites", getUser, async (req, res) => {
  try {
    console.log('Fetching favorites for user:', res.user.username, 'ID:', res.user._id);
    
    // Use the user from getUser middleware and populate favorites
    const userWithFavorites = await User.findById(res.user._id).populate("favorites");
    
    if (!userWithFavorites) {
      console.error('User not found when fetching favorites:', res.user._id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Found', userWithFavorites.favorites?.length || 0, 'favorites for user:', userWithFavorites.username);
    res.json(userWithFavorites.favorites || []);
  } catch (err) {
    console.error('Error fetching user favorites:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: err.message });
  }
});

// Add template to favorites
router.post("/:id/favorites/:templateId", getUser, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const Template = require('../models/Template');
    const Interaction = require('../models/Interaction');
    const templateId = req.params.templateId;
    let templateObjectId;
    let template;
    
    // First try to find by ObjectId if it's valid
    if (mongoose.Types.ObjectId.isValid(templateId)) {
      templateObjectId = new mongoose.Types.ObjectId(templateId);
      console.log('Template ID converted to ObjectId:', templateId, '->', templateObjectId);
      template = await Template.findById(templateObjectId);
    }
    
    // If not found by ObjectId, try to find by title
    if (!template) {
      console.log('Attempting to find template by title:', templateId);
      template = await Template.findOne({ title: templateId });
      
      if (template) {
        templateObjectId = template._id;
        console.log('Found template by title:', template.title, 'with ID:', templateObjectId);
      } else {
        console.error('Template not found with ID or title:', templateId);
        return res.status(404).json({ message: "Template not found" });
      }
    }
    
    // Check if template exists in favorites using ObjectId comparison
    const templateExists = res.user.favorites.some(id => id.toString() === templateObjectId.toString());
    
    if (!templateExists) {
      res.user.favorites.push(templateObjectId);
      await res.user.save();
      console.log('Template added to favorites successfully');
      
      // Create or update interaction record for trending
      const existingInteraction = await Interaction.findOne({
        user: res.user._id,
        template: templateObjectId,
      });
      
      if (existingInteraction) {
        // Update existing interaction to favorite
        existingInteraction.interactionType = 'favorite';
        existingInteraction.createdAt = new Date();
        await existingInteraction.save();
        console.log('Updated existing interaction to favorite');
      } else {
        // Create new favorite interaction
        const interaction = new Interaction({
          user: res.user._id,
          template: templateObjectId,
          interactionType: 'favorite',
        });
        await interaction.save();
        console.log('Created new favorite interaction');
      }
    } else {
      console.log('Template already in favorites');
    }
    
    res.json({ message: "Template added to favorites" });
  } catch (err) {
    console.error('Error adding template to favorites:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// Remove template from favorites
router.delete("/:id/favorites/:templateId", getUser, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const Template = require('../models/Template');
    const Interaction = require('../models/Interaction');
    const templateId = req.params.templateId;
    let templateObjectId;
    let template;
    
    // First try to find by ObjectId if it's valid
    if (mongoose.Types.ObjectId.isValid(templateId)) {
      templateObjectId = new mongoose.Types.ObjectId(templateId);
      console.log('Template ID converted to ObjectId for removal:', templateId, '->', templateObjectId);
      template = await Template.findById(templateObjectId);
    }
    
    // If not found by ObjectId, try to find by title
    if (!template) {
      console.log('Attempting to find template by title for removal:', templateId);
      template = await Template.findOne({ title: templateId });
      
      if (template) {
        templateObjectId = template._id;
        console.log('Found template by title for removal:', template.title, 'with ID:', templateObjectId);
      } else {
        console.error('Template not found with ID or title for removal:', templateId);
        return res.status(404).json({ message: "Template not found" });
      }
    }
    
    // Filter out the template using ObjectId string comparison
    const initialCount = res.user.favorites.length;
    res.user.favorites = res.user.favorites.filter(
      (template) => template.toString() !== templateObjectId.toString()
    );
    
    // Check if anything was removed
    if (initialCount > res.user.favorites.length) {
      console.log('Template removed from favorites');
      
      // Remove the favorite interaction record
      const deletedInteraction = await Interaction.findOneAndDelete({
        user: res.user._id,
        template: templateObjectId,
        interactionType: 'favorite'
      });
      
      if (deletedInteraction) {
        console.log('Removed favorite interaction record');
      } else {
        console.log('No favorite interaction record found to remove');
      }
    } else {
      console.log('Template was not in favorites');
    }
    
    await res.user.save();
    res.json({ message: "Template removed from favorites" });
  } catch (err) {
    console.error('Error removing template from favorites:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// Middleware to get user by ID, username, or email
async function getUser(req, res, next) {
  let user;
  try {
    const mongoose = require('mongoose');
    const userId = req.params.id;
    
    // First try to find by ObjectId if it's valid
    if (mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        console.log('User ID converted to ObjectId:', userId, '->', userObjectId);
        user = await User.findById(userObjectId);
        console.log('User found by ObjectId:', user ? user.username : 'not found');
      } catch (err) {
        console.log('Error converting to ObjectId or finding user:', err.message);
        // Continue to alternative lookup
      }
    }
    
    // If not found by ObjectId, try to find by username or email
    if (!user) {
      console.log('Attempting to find user by alternative means:', userId);
      user = await User.findOne({ $or: [{ username: userId }, { email: userId }] });
    }
    
    if (!user) {
      console.error('User not found with ID, username, or email:', userId);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log('Found user:', user.username, 'with ID:', user._id);
  } catch (err) {
    console.error('Error finding user:', err.message);
    return res.status(500).json({ message: err.message });
  }

  res.user = user;
  next();
}

module.exports = router;
