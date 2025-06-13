const express = require("express");
const router = express.Router();
const Template = require("../models/Template");

// Get all templates
router.get("/", async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get templates with pagination and filtering
router.get("/discover", async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tags } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (tags) {
      const tagArray = tags.split(",");
      filter.tags = { $in: tagArray };
    }

    // Execute query with pagination
    const templates = await Template.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Get total documents count
    const count = await Template.countDocuments(filter);

    // Return just the templates array to match what the frontend expects
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single template
router.get("/:id", getTemplate, (req, res) => {
  res.json(res.template);
});

// Create a template
router.post("/", async (req, res) => {
  const template = new Template({
    title: req.body.title,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
    tags: req.body.tags,
    category: req.body.category,
    creator: req.body.creator, // In a real app, this would come from authenticated user
  });

  try {
    const newTemplate = await template.save();
    res.status(201).json(newTemplate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a template
router.patch("/:id", getTemplate, async (req, res) => {
  if (req.body.title) res.template.title = req.body.title;
  if (req.body.description) res.template.description = req.body.description;
  if (req.body.imageUrl) res.template.imageUrl = req.body.imageUrl;
  if (req.body.tags) res.template.tags = req.body.tags;
  if (req.body.category) res.template.category = req.body.category;

  try {
    const updatedTemplate = await res.template.save();
    res.json(updatedTemplate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a template
router.delete("/:id", getTemplate, async (req, res) => {
  try {
    await res.template.deleteOne();
    res.json({ message: "Template deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware to get template by ID
async function getTemplate(req, res, next) {
  let template;
  try {
    template = await Template.findById(req.params.id);
    if (template == null) {
      return res.status(404).json({ message: "Template not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.template = template;
  next();
}

module.exports = router;
