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

    // Validate user and template exist
    const userExists = await User.exists({ _id: userId });
    const templateExists = await Template.exists({ _id: templateId });

    if (!userExists || !templateExists) {
      return res.status(404).json({
        message: !userExists ? "User not found" : "Template not found",
      });
    }

    // Check if interaction already exists
    const existingInteraction = await Interaction.findOne({
      user: userId,
      template: templateId,
      interactionType,
    });

    if (existingInteraction) {
      return res.status(400).json({ message: "Interaction already exists" });
    }

    // Create new interaction
    const interaction = new Interaction({
      user: userId,
      template: templateId,
      interactionType,
    });

    const newInteraction = await interaction.save();

    // Update template stats based on interaction type
    if (interactionType === "like") {
      await Template.findByIdAndUpdate(templateId, { $inc: { likes: 1 } });
    } else if (interactionType === "dislike") {
      await Template.findByIdAndUpdate(templateId, { $inc: { dislikes: 1 } });
    } else if (interactionType === "favorite") {
      // Add to user's favorites if not already there
      await User.findByIdAndUpdate(userId, {
        $addToSet: { favorites: templateId },
      });
    }

    res.status(201).json(newInteraction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all interactions for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const interactions = await Interaction.find({ user: req.params.userId })
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
    const interactions = await Interaction.find({
      template: req.params.templateId,
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
    const stats = await Interaction.aggregate([
      {
        $match: {
          template: new mongoose.Types.ObjectId(req.params.templateId),
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
    const interaction = await Interaction.findById(req.params.id);

    if (!interaction) {
      return res.status(404).json({ message: "Interaction not found" });
    }

    // Update template stats based on interaction type
    if (interaction.interactionType === "like") {
      await Template.findByIdAndUpdate(interaction.template, {
        $inc: { likes: -1 },
      });
    } else if (interaction.interactionType === "dislike") {
      await Template.findByIdAndUpdate(interaction.template, {
        $inc: { dislikes: -1 },
      });
    } else if (interaction.interactionType === "favorite") {
      // Remove from user's favorites
      await User.findByIdAndUpdate(interaction.user, {
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
