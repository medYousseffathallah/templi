const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Interaction = require("../models/Interaction");
const Template = require("../models/Template");
const User = require("../models/User");

// Record a new interaction (like, dislike, favorite, view)
router.post("/", async (req, res) => {
  try {
    let { userId, templateId, interactionType } = req.body;
    
    console.log('Received interaction request:', { userId, templateId, interactionType });
    console.log('userId type:', typeof userId);
    console.log('userId value:', JSON.stringify(userId));
    console.log('userId length:', userId ? userId.length : 'null/undefined');
    
    // Validate user exists (convert string to ObjectId if valid)
    console.log('Checking user existence with _id:', userId);
    let userExists = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userExists = await User.exists({ _id: new mongoose.Types.ObjectId(userId) });
    }
    console.log('User exists result:', userExists);
    
    if (!userExists) {
      console.log('User not found with ObjectId, trying alternative lookup');
      
      // Try to find the user by username or email
      const { username, email } = req.body;
      let query = { $or: [{ username: userId }, { email: userId }] };
      
      // Add username and email to the query if they were provided
      if (username) query.$or.push({ username });
      if (email) query.$or.push({ email });
      
      console.log('User lookup query:', JSON.stringify(query));
      const user = await User.findOne(query);
      
      if (user) {
        console.log('Found user by alternative means:', user.username);
        userId = new mongoose.Types.ObjectId(user._id);
      } else {
        console.error('User not found:', userId);
        return res.status(404).json({ message: "User not found" });
      }
    }
    
    // Validate template exists (convert string to ObjectId if valid)
    console.log('Checking template existence with _id:', templateId);
    let templateObjectId = templateId;
    let templateExists = null;
    if (mongoose.Types.ObjectId.isValid(templateId)) {
      templateExists = await Template.exists({ _id: new mongoose.Types.ObjectId(templateId) });
    }
    console.log('Template exists result:', templateExists);
    
    if (!templateExists) {
      // Try to find the template by title as fallback
      console.log('Template not found with ObjectId, trying title lookup:', templateId);
      const template = await Template.findOne({ title: templateId });
      if (template) {
        templateObjectId = new mongoose.Types.ObjectId(template._id);
        console.log('Found template by title:', template.title, 'with ID:', templateObjectId);
      } else {
        console.error('Template not found:', templateId);
        return res.status(400).json({ message: "Template not found" });
      }
    } else {
      templateObjectId = new mongoose.Types.ObjectId(templateId);
    }

    // Check if any interaction already exists for this user and template
    const existingInteraction = await Interaction.findOne({
      user: userId,
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
          await User.findOneAndUpdate({ _id: userId }, {
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
        user: userId,
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
        await User.findOneAndUpdate({ _id: userId }, {
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
        user: userId,
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
    // Validate user exists
    let userId = req.params.userId;
    
    console.log('GET interactions - checking user existence with _id:', userId);
    let userExists = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userExists = await User.exists({ _id: new mongoose.Types.ObjectId(userId) });
    }
    console.log('GET interactions - user exists result:', userExists);
    
    if (!userExists) {
      // Try to find the user by username or email
      console.log('GET interactions - user not found with ObjectId, trying alternative lookup:', userId);
      
      const query = { $or: [{ username: req.params.userId }, { email: req.params.userId }] };
      console.log('User lookup query in GET request:', JSON.stringify(query));
      const user = await User.findOne(query);
      
      if (user) {
        console.log('Found user by alternative means in GET request:', user.username);
        userId = new mongoose.Types.ObjectId(user._id);
      } else {
        console.error('User not found in GET request:', req.params.userId);
        return res.status(404).json({ message: "User not found" });
      }
    }
    
    // Build query with optional interaction type filter
    const query = { user: userId };
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
    // Validate template exists (convert string to ObjectId if valid)
    console.log('GET interactions - checking template existence with _id:', req.params.templateId);
    let templateObjectId = req.params.templateId;
    let templateExists = null;
    if (mongoose.Types.ObjectId.isValid(req.params.templateId)) {
      templateExists = await Template.exists({ _id: new mongoose.Types.ObjectId(req.params.templateId) });
    }
    console.log('GET interactions - template exists result:', templateExists);
    
    if (!templateExists) {
      // Try to find the template by title as fallback
      console.log('Template not found with ObjectId in GET request, trying title lookup:', req.params.templateId);
      const template = await Template.findOne({ title: req.params.templateId });
      if (template) {
        templateObjectId = new mongoose.Types.ObjectId(template._id);
        console.log('Found template by title in GET request:', template.title, 'with ID:', templateObjectId);
      } else {
        console.error('Template not found in GET request:', req.params.templateId);
        return res.status(400).json({ message: "Template not found" });
      }
    } else {
      templateObjectId = new mongoose.Types.ObjectId(req.params.templateId);
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
    // Validate template exists (convert string to ObjectId if valid)
    console.log('GET stats - checking template existence with _id:', req.params.templateId);
    let templateObjectId = req.params.templateId;
    let templateExists = null;
    if (mongoose.Types.ObjectId.isValid(req.params.templateId)) {
      templateExists = await Template.exists({ _id: new mongoose.Types.ObjectId(req.params.templateId) });
    }
    console.log('GET stats - template exists result:', templateExists);
    
    if (!templateExists) {
      // Try to find the template by title as fallback
      console.log('Template not found with ObjectId in stats request, trying title lookup:', req.params.templateId);
      const template = await Template.findOne({ title: req.params.templateId });
      if (template) {
        templateObjectId = new mongoose.Types.ObjectId(template._id);
        console.log('Found template by title in stats request:', template.title, 'with ID:', templateObjectId);
      } else {
        console.error('Template not found in stats request:', req.params.templateId);
        return res.status(400).json({ message: "Template not found" });
      }
    } else {
      templateObjectId = new mongoose.Types.ObjectId(req.params.templateId);
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
    // Validate interaction exists (ObjectId-based lookup)
    let interactionObjectId = req.params.id;
    const interactionExists = await Interaction.exists({ _id: req.params.id });
    
    if (!interactionExists) {
      console.error('Interaction not found in delete request:', req.params.id);
      return res.status(404).json({ message: "Interaction not found" });
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
