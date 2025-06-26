const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Interaction = require("../models/Interaction");
const Template = require("../models/Template");
const User = require("../models/User");

// Record a new interaction (like, dislike, favorite, view)
router.post("/", async (req, res) => {
  try {
    const { userId, templateId, interactionType } = req.body;
    
    console.log('Received interaction request:', { userId, templateId, interactionType });
    console.log('userId type:', typeof userId);
    
    // Convert userId to ObjectId if it's a valid string
    let userObjectId;
    try {
      // Check if userId is already a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(userId)) {
        userObjectId = new mongoose.Types.ObjectId(userId);
        console.log('User ID converted to ObjectId:', userId, '->', userObjectId);
        
        // Verify the user exists with this ObjectId
        const userExists = await User.exists({ _id: userObjectId });
        if (!userExists) {
          console.log('User not found with ObjectId, trying alternative lookup');
          throw new Error('User not found with ObjectId');
        }
      } else {
        throw new Error('Invalid ObjectId format');
      }
    } catch (err) {
      console.log('ObjectId conversion failed, trying alternative user lookup:', err.message);
      
      // Try to find the user by other means
      console.log('Attempting to find user by alternative means:', userId);
      
      // Check if username or email was provided in the request
      const { username, email } = req.body;
      let query = { $or: [{ username: userId }, { email: userId }] };
      
      // Add username and email to the query if they were provided
      if (username) query.$or.push({ username });
      if (email) query.$or.push({ email });
      
      console.log('User lookup query:', JSON.stringify(query));
      const user = await User.findOne(query);
      
      if (user) {
        console.log('Found user by alternative means:', user.username);
        userObjectId = user._id;
      } else {
        console.error('Invalid userId format or user not found:', userId);
        return res.status(400).json({ message: "Invalid user ID format or user not found" });
      }
    }
    
    // Convert templateId to ObjectId if it's a valid string
    let templateObjectId;
    try {
      if (mongoose.Types.ObjectId.isValid(templateId)) {
        templateObjectId = new mongoose.Types.ObjectId(templateId);
      } else {
        // Try to find the template by other means (e.g., title)
        console.log('Attempting to find template by alternative means:', templateId);
        const template = await Template.findOne({ title: templateId });
        if (template) {
          templateObjectId = template._id;
        } else {
          throw new Error('Template not found');
        }
      }
    } catch (err) {
      console.error('Invalid templateId format or template not found:', templateId);
      return res.status(400).json({ message: "Invalid template ID format or template not found" });
    }

    // Validate template exists
    const templateExists = await Template.exists({ _id: templateObjectId });

    if (!templateExists) {
      return res.status(404).json({
        message: "Template not found",
      });
    }

    // Check if any interaction already exists for this user and template
    const existingInteraction = await Interaction.findOne({
      user: userObjectId,
      template: templateObjectId,
    });

    let interaction;
    let isUpdate = false;

    if (existingInteraction) {
      // If interaction exists but with different type, update it
      if (existingInteraction.interactionType !== interactionType) {
        console.log(`Updating interaction from ${existingInteraction.interactionType} to ${interactionType}`);
        
        // Revert previous interaction stats
        if (existingInteraction.interactionType === "like") {
          await Template.findOneAndUpdate({ _id: templateObjectId }, { $inc: { likes: -1 } });
        } else if (existingInteraction.interactionType === "dislike") {
          await Template.findOneAndUpdate({ _id: templateObjectId }, { $inc: { dislikes: -1 } });
        } else if (existingInteraction.interactionType === "favorite") {
          await User.findOneAndUpdate({ _id: userObjectId }, {
            $pull: { favorites: templateObjectId },
          });
        }
        
        // Update the interaction type
        existingInteraction.interactionType = interactionType;
        existingInteraction.createdAt = new Date();
        interaction = await existingInteraction.save();
        isUpdate = true;
      } else {
        // Same interaction type already exists, just return it
        console.log(`Interaction of type ${interactionType} already exists, returning existing`);
        return res.status(200).json(existingInteraction);
      }
    } else {
      // Create new interaction
      console.log(`Creating new ${interactionType} interaction`);
      interaction = new Interaction({
        user: userObjectId,
        template: templateObjectId,
        interactionType,
      });
      interaction = await interaction.save();
    }

    // Update template stats based on new interaction type (only if new or updated)
    if (!isUpdate || existingInteraction.interactionType !== interactionType) {
      if (interactionType === "like") {
        await Template.findOneAndUpdate({ _id: templateObjectId }, { $inc: { likes: 1 } });
      } else if (interactionType === "dislike") {
        await Template.findOneAndUpdate({ _id: templateObjectId }, { $inc: { dislikes: 1 } });
      } else if (interactionType === "favorite") {
        // Add to user's favorites if not already there
        await User.findOneAndUpdate({ _id: userObjectId }, {
          $addToSet: { favorites: templateObjectId },
        });
      }
    }

    res.status(isUpdate ? 200 : 201).json(interaction);
  } catch (err) {
    // Handle MongoDB duplicate key error for view interactions
    if (err.code === 11000 && err.message.includes('interactionType: "view"')) {
      console.log('View interaction already exists, treating as success');
      // Find and return the existing view interaction
      const existingView = await Interaction.findOne({
        user: userObjectId,
        template: templateObjectId,
        interactionType: 'view'
      });
      return res.status(200).json(existingView);
    }
    
    console.error('Interaction error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Get all interactions for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    // Convert userId to ObjectId
    let userObjectId;
    try {
      // Check if userId is already a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(req.params.userId)) {
        userObjectId = new mongoose.Types.ObjectId(req.params.userId);
      } else {
        // Try to find the user by other means
        console.log('Attempting to find user by alternative means in GET request:', req.params.userId);
        
        // For GET requests, we can only search by username or email in the URL parameter
        const query = { $or: [{ username: req.params.userId }, { email: req.params.userId }] };
        
        console.log('User lookup query in GET request:', JSON.stringify(query));
        const user = await User.findOne(query);
        
        if (user) {
          console.log('Found user by alternative means in GET request:', user.username);
          userObjectId = user._id;
        } else {
          throw new Error('User not found');
        }
      }
    } catch (err) {
      console.error('Invalid userId format or user not found in GET request:', req.params.userId, err.message);
      return res.status(400).json({ message: "Invalid user ID format or user not found" });
    }
    
    // Build query with optional interaction type filter
    const query = { user: userObjectId };
    if (req.query.interactionType) {
      query.interactionType = req.query.interactionType;
    }
    
    const interactions = await Interaction.find(query)
      .populate("template")
      .sort({ createdAt: -1 });
    res.json(interactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all interactions for a specific template
router.get("/template/:templateId", async (req, res) => {
  try {
    // Convert templateId to ObjectId
    let templateObjectId;
    try {
      if (mongoose.Types.ObjectId.isValid(req.params.templateId)) {
        templateObjectId = new mongoose.Types.ObjectId(req.params.templateId);
      } else {
        // Try to find the template by other means (e.g., title)
        console.log('Attempting to find template by alternative means in GET request:', req.params.templateId);
        const template = await Template.findOne({ title: req.params.templateId });
        if (template) {
          templateObjectId = template._id;
        } else {
          throw new Error('Template not found');
        }
      }
    } catch (err) {
      console.error('Invalid templateId format or template not found in GET request:', req.params.templateId);
      return res.status(400).json({ message: "Invalid template ID format or template not found" });
    }
    
    const interactions = await Interaction.find({
      template: templateObjectId,
    })
      .populate("user", "-password")
      .sort({ createdAt: -1 });
    res.json(interactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get interaction stats for a template
router.get("/stats/template/:templateId", async (req, res) => {
  try {
    // Convert templateId to ObjectId
    let templateObjectId;
    try {
      if (mongoose.Types.ObjectId.isValid(req.params.templateId)) {
        templateObjectId = new mongoose.Types.ObjectId(req.params.templateId);
      } else {
        // Try to find the template by other means (e.g., title)
        console.log('Attempting to find template by alternative means in stats request:', req.params.templateId);
        const template = await Template.findOne({ title: req.params.templateId });
        if (template) {
          templateObjectId = template._id;
        } else {
          throw new Error('Template not found');
        }
      }
    } catch (err) {
      console.error('Invalid templateId format or template not found in stats request:', req.params.templateId);
      return res.status(400).json({ message: "Invalid template ID format or template not found" });
    }
    
    const stats = await Interaction.aggregate([
      {
        $match: {
          template: templateObjectId,
        },
      },
      {
        $group: {
          _id: "$interactionType",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the results
    const formattedStats = {};
    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
    });

    res.json(formattedStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an interaction
router.delete("/:id", async (req, res) => {
  try {
    // Convert id to ObjectId
    let interactionObjectId;
    try {
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        interactionObjectId = new mongoose.Types.ObjectId(req.params.id);
      } else {
        console.error('Invalid interaction ID format in delete request:', req.params.id);
        return res.status(400).json({ message: "Invalid interaction ID format" });
      }
    } catch (err) {
      console.error('Error processing interaction ID in delete request:', req.params.id, err);
      return res.status(400).json({ message: "Invalid interaction ID format" });
    }
    
    const interaction = await Interaction.findOne({ _id: interactionObjectId });

    if (!interaction) {
      return res.status(404).json({ message: "Interaction not found" });
    }

    // Update template stats based on interaction type
    if (interaction.interactionType === "like") {
      await Template.findOneAndUpdate({ _id: interaction.template }, {
        $inc: { likes: -1 },
      });
    } else if (interaction.interactionType === "dislike") {
      await Template.findOneAndUpdate({ _id: interaction.template }, {
        $inc: { dislikes: -1 },
      });
    } else if (interaction.interactionType === "favorite") {
      // Remove from user's favorites
      await User.findOneAndUpdate({ _id: interaction.user }, {
        $pull: { favorites: interaction.template },
      });
    }

    await interaction.deleteOne();
    res.json({ message: "Interaction deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
