const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Template = require("../models/Template");

// Get all templates
router.get("/", async (req, res) => {
  try {
    const templates = await Template.find()
      .populate('creator', 'name username email')
      .sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get templates with pagination and filtering
router.get("/discover", async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      category, 
      subCategory,
      tags,
      frameworkTools,
      pricingTier,
      colorScheme,
      responsive,
      accessibilityLevel,
      languageSupport,
      sort = 'createdAt'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { subCategory: searchRegex }
      ];
    }
    
    // Category filters (support multiple values)
    if (category) {
      const categoryArray = category.split(",");
      filter.category = categoryArray.length === 1 ? categoryArray[0] : { $in: categoryArray };
    }
    if (subCategory) filter.subCategory = subCategory;
    
    // Array filters
    if (tags) {
      const tagArray = tags.split(",");
      filter.tags = { $in: tagArray };
    }
    
    if (frameworkTools) {
      const toolsArray = frameworkTools.split(",");
      filter.frameworkTools = { $in: toolsArray };
    }
    
    // Pricing filter (support multiple values)
    if (pricingTier) {
      const pricingArray = pricingTier.split(",");
      filter.pricingTier = pricingArray.length === 1 ? pricingArray[0] : { $in: pricingArray };
    }
    
    // Design specification filters (support multiple values)
    if (colorScheme) {
      const colorArray = colorScheme.split(",");
      filter['designSpecs.colorScheme'] = colorArray.length === 1 ? colorArray[0] : { $in: colorArray };
    }
    if (responsive !== undefined) filter['designSpecs.responsive'] = responsive === 'true';
    if (accessibilityLevel) {
      const accessibilityArray = accessibilityLevel.split(",");
      filter['designSpecs.accessibilityLevel'] = accessibilityArray.length === 1 ? accessibilityArray[0] : { $in: accessibilityArray };
    }
    if (languageSupport) {
      const languageArray = languageSupport.split(",");
      filter['designSpecs.languageSupport'] = languageArray.length === 1 ? languageArray[0] : { $in: languageArray };
    }
    
    // Determine sort order
    let sortOption = { createdAt: -1 }; // Default sort by newest
    
    if (sort === 'likes') {
      sortOption = { likes: -1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    }

    // Execute query with pagination
    const templates = await Template.find(filter)
      .populate('creator', 'name username email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOption);

    // Get total documents count
    const count = await Template.countDocuments(filter);

    // Return templates with pagination metadata
    res.json({
      templates,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalTemplates: count
    });
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
  // Validate required fields
  const requiredFields = ['title', 'description', 'category', 'subCategory'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({ 
      message: `Missing required fields: ${missingFields.join(', ')}` 
    });
  }

  // Validate that at least one visual preview is provided
  if ((!req.body.imageUrls || req.body.imageUrls.length === 0) && !req.body.videoUrl) {
    return res.status(400).json({ 
      message: 'At least one image or video URL is required' 
    });
  }

  // Validate that at least one framework/tool is selected
  if (!req.body.frameworkTools || req.body.frameworkTools.length === 0) {
    return res.status(400).json({ 
      message: 'At least one framework or tool must be selected' 
    });
  }

  // Validate description length
  if (req.body.description.length < 100 || req.body.description.length > 500) {
    return res.status(400).json({ 
      message: 'Description must be between 100 and 500 characters' 
    });
  }

  // Validate title length
  if (req.body.title.length > 60) {
    return res.status(400).json({ 
      message: 'Title must be 60 characters or less' 
    });
  }

  // Validate tags (maximum 5)
  if (req.body.tags && req.body.tags.length > 5) {
    return res.status(400).json({ 
      message: 'Maximum of 5 tags allowed' 
    });
  }

  // Create the template with all fields
  const template = new Template({
    title: req.body.title,
    description: req.body.description,
    imageUrls: req.body.imageUrls || [],
    videoUrl: req.body.videoUrl,
    tags: req.body.tags || [],
    category: req.body.category,
    subCategory: req.body.subCategory,
    frameworkTools: req.body.frameworkTools,
    githubLink: req.body.githubLink,
    isPrivateRepo: req.body.isPrivateRepo || false,
    designSpecs: {
      colorScheme: req.body.colorScheme || 'Light',
      responsive: req.body.responsive !== undefined ? req.body.responsive : true,
      accessibilityLevel: req.body.accessibilityLevel || 'Not Tested',
      languageSupport: req.body.languageSupport || 'English',
    },
    pricingTier: req.body.pricingTier || 'Free',
    price: req.body.price || 0,
    creator: req.body.creator, // In a real app, this would come from authenticated user
  });

  try {
    const newTemplate = await template.save();
    
    // If successful, update the user's createdTemplates array
    // This would typically be handled with authentication middleware
    // but for this example, we'll assume the creator ID is valid
    
    res.status(201).json(newTemplate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a template
router.patch("/:id", getTemplate, async (req, res) => {
  // Validate fields if they are being updated
  if (req.body.title && req.body.title.length > 60) {
    return res.status(400).json({ message: 'Title must be 60 characters or less' });
  }
  
  if (req.body.description && (req.body.description.length < 100 || req.body.description.length > 500)) {
    return res.status(400).json({ message: 'Description must be between 100 and 500 characters' });
  }
  
  if (req.body.tags && req.body.tags.length > 5) {
    return res.status(400).json({ message: 'Maximum of 5 tags allowed' });
  }
  
  // Update basic fields
  if (req.body.title) res.template.title = req.body.title;
  if (req.body.description) res.template.description = req.body.description;
  if (req.body.imageUrls) res.template.imageUrls = req.body.imageUrls;
  if (req.body.videoUrl) res.template.videoUrl = req.body.videoUrl;
  if (req.body.tags) res.template.tags = req.body.tags;
  if (req.body.category) res.template.category = req.body.category;
  if (req.body.subCategory) res.template.subCategory = req.body.subCategory;
  if (req.body.frameworkTools) res.template.frameworkTools = req.body.frameworkTools;
  if (req.body.githubLink) res.template.githubLink = req.body.githubLink;
  if (req.body.isPrivateRepo !== undefined) res.template.isPrivateRepo = req.body.isPrivateRepo;
  
  // Update design specifications
  if (req.body.colorScheme) res.template.designSpecs.colorScheme = req.body.colorScheme;
  if (req.body.responsive !== undefined) res.template.designSpecs.responsive = req.body.responsive;
  if (req.body.accessibilityLevel) res.template.designSpecs.accessibilityLevel = req.body.accessibilityLevel;
  if (req.body.languageSupport) res.template.designSpecs.languageSupport = req.body.languageSupport;
  
  // Update pricing information
  if (req.body.pricingTier) res.template.pricingTier = req.body.pricingTier;
  if (req.body.price !== undefined) res.template.price = req.body.price;

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

// Get trending templates
router.get("/trending/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    // Validate interaction type
    if (!['like', 'favorite'].includes(type)) {
      return res.status(400).json({ message: "Invalid interaction type. Use 'like' or 'favorite'" });
    }
    
    // Calculate date for one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const Interaction = require("../models/Interaction");
    
    // Aggregate interactions to get trending templates
    const trendingTemplates = await Interaction.aggregate([
      {
        $match: {
          interactionType: type,
          createdAt: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: "$template",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: "templates",
          localField: "_id",
          foreignField: "_id",
          as: "template"
        }
      },
      {
        $unwind: "$template"
      },
      {
        $addFields: {
          "template.likeCount": {
            $cond: {
              if: { $eq: [type, "like"] },
              then: "$count",
              else: 0
            }
          },
          "template.favoriteCount": {
            $cond: {
              if: { $eq: [type, "favorite"] },
              then: "$count",
              else: 0
            }
          }
        }
      },
      {
        $replaceRoot: { newRoot: "$template" }
      }
    ]);
    
    // Get both weekly trending counts and total counts for each template
    const templatesWithCounts = await Promise.all(
      trendingTemplates.map(async (template) => {
        // Weekly counts (for trending)
        const weeklyLikeCount = await Interaction.countDocuments({
          template: template._id,
          interactionType: "like",
          createdAt: { $gte: oneWeekAgo }
        });
        
        const weeklyFavoriteCount = await Interaction.countDocuments({
          template: template._id,
          interactionType: "favorite",
          createdAt: { $gte: oneWeekAgo }
        });
        
        // Total counts (all time)
        const totalLikeCount = await Interaction.countDocuments({
          template: template._id,
          interactionType: "like"
        });
        
        const totalFavoriteCount = await Interaction.countDocuments({
          template: template._id,
          interactionType: "favorite"
        });
        
        return {
          ...template,
          // Weekly trending counts
          weeklyLikeCount,
          weeklyFavoriteCount,
          // Total counts (display these in UI)
          likeCount: totalLikeCount,
          favoriteCount: totalFavoriteCount,
          // Also include the static counts from template model for reference
          staticLikes: template.likes || 0,
          staticDislikes: template.dislikes || 0
        };
      })
    );
    
    res.json(templatesWithCounts);
  } catch (err) {
    console.error("Error fetching trending templates:", err);
    res.status(500).json({ message: err.message });
  }
});

// Debug endpoint to check interactions
router.get("/debug/interactions", async (req, res) => {
  try {
    const allInteractions = await Interaction.find()
      .populate('user', 'name email')
      .populate('template', 'title')
      .sort({ createdAt: -1 })
      .limit(20);
    
    const interactionStats = await Interaction.aggregate([
      {
        $group: {
          _id: '$interactionType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const favoriteInteractions = await Interaction.find({ interactionType: 'favorite' })
      .populate('user', 'name email')
      .populate('template', 'title');
    
    res.json({
      totalInteractions: allInteractions.length,
      interactionStats,
      recentInteractions: allInteractions.map(i => ({
        type: i.interactionType,
        user: i.user?.name || 'Unknown',
        template: i.template?.title || 'Unknown',
        createdAt: i.createdAt
      })),
      favoriteInteractions: favoriteInteractions.map(i => ({
        user: i.user?.name || 'Unknown',
        template: i.template?.title || 'Unknown',
        createdAt: i.createdAt
      }))
    });
  } catch (err) {
    console.error("Error in debug endpoint:", err);
    res.status(500).json({ message: err.message });
  }
});

// Middleware to get template by ID
async function getTemplate(req, res, next) {
  let template;
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      template = await Template.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    }
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
