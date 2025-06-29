const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
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
    
    // Generate JWT token for the new user
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Don't send password in response
    const userObject = newUser.toObject();
    delete userObject.password;
    res.status(201).json({
      user: userObject,
      token: token
    });
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

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    const userObject = user.toObject();
    delete userObject.password;
    res.json({
      user: userObject,
      token: token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile
router.patch("/:id", getUser, async (req, res) => {
  try {
    console.log('Updating profile for user:', res.user.username, 'with data:', req.body);
    
    if (req.body.username) res.user.username = req.body.username;
    if (req.body.email) res.user.email = req.body.email;
    if (req.body.password) res.user.password = req.body.password; // Would hash in real app
    if (req.body.bio) res.user.bio = req.body.bio;
    if (req.body.name) res.user.name = req.body.name;
    if (req.body.website) res.user.website = req.body.website;
    if (req.body.role) res.user.role = req.body.role;
    if (req.body.profilePicture) res.user.profilePicture = req.body.profilePicture;

    const updatedUser = await res.user.save();
    console.log('Profile updated successfully for user:', updatedUser.username);
    
    // Don't send password in response
    const userObject = updatedUser.toObject();
    delete userObject.password;
    res.json(userObject);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// Get user's favorite templates
router.get("/:id/favorites", getUser, async (req, res) => {
  try {
    console.log('Fetching favorites for user:', res.user.username, 'ID:', res.user._id);
    
    // Use the user from getUser middleware and populate favorites
    const userWithFavorites = await User.findOne({ _id: res.user._id }).populate("favorites");
    
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
    
    // First try to find by ObjectId (convert string to ObjectId if valid)
    templateObjectId = templateId;
    if (mongoose.Types.ObjectId.isValid(templateId)) {
      template = await Template.findOne({ _id: new mongoose.Types.ObjectId(templateId) });
    }
    
    // If not found by ObjectId, try to find by title
    if (!template) {
      console.log('Template not found with ObjectId, trying title lookup:', templateId);
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

// Get user's uploaded templates
router.get("/:id/templates", getUser, async (req, res) => {
  try {
    const Template = require('../models/Template');
    console.log('Fetching templates for user:', res.user.username, 'ID:', res.user._id);
    
    // Find all templates created by this user
    const userTemplates = await Template.find({ creator: res.user._id });
    
    console.log('Found', userTemplates.length, 'templates for user:', res.user.username);
    res.json(userTemplates);
  } catch (err) {
    console.error('Error fetching user templates:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: err.message });
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
    
    // First try to find by ObjectId (convert string to ObjectId if valid)
    templateObjectId = templateId;
    if (mongoose.Types.ObjectId.isValid(templateId)) {
      template = await Template.findOne({ _id: new mongoose.Types.ObjectId(templateId) });
    }
    
    // If not found by ObjectId, try to find by title
    if (!template) {
      console.log('Template not found with ObjectId for removal, trying title lookup:', templateId);
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
    const userId = req.params.id;
    
    console.log('getUser middleware - looking for user with ID:', userId);
    
    // Try to find by ObjectId first (convert string to ObjectId if valid)
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(new mongoose.Types.ObjectId(userId));
    }
    
    // If not found by ObjectId, try to find by username or email
    if (!user) {
      console.log('User not found with ObjectId, trying alternative lookup:', userId);
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
