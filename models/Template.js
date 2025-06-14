const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 100,
      maxlength: 500,
    },
    // Visual Preview
    imageUrls: [{
      type: String,
      trim: true,
    }],
    videoUrl: {
      type: String,
      trim: true,
    },
    // At least one of imageUrls or videoUrl is required
    // This will be validated in the API route
    
    tags: [{
      type: String,
      trim: true,
    }],
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'Web UI',
        'Mobile App UI',
        'Canva UI',
        'Presentation UI',
        'CV/Resume UI',
        'Dashboard UI',
        'E-commerce UI',
        'Admin Panel UI',
        'Landing Page UI',
        'Authentication UI',
        'Email Template UI',
        'Component Library',
        'Design System',
        'Other'
      ],
    },
    subCategory: {
      type: String,
      required: true,
      trim: true,
    },
    frameworkTools: [{
      type: String,
      trim: true,
      enum: [
        'Figma',
        'Sketch',
        'Adobe XD',
        'HTML/CSS',
        'React',
        'Vue',
        'Angular',
        'Tailwind',
        'Bootstrap',
        'Webflow',
        'Framer',
        'Canva',
        'PowerPoint',
        'Keynote',
        'Other'
      ],
    }],
    githubLink: {
      type: String,
      trim: true,
    },
    isPrivateRepo: {
      type: Boolean,
      default: false,
    },
    // Design Specifications
    designSpecs: {
      colorScheme: {
        type: String,
        enum: ['Light', 'Dark', 'Both', 'Custom'],
        default: 'Light',
      },
      responsive: {
        type: Boolean,
        default: true,
      },
      accessibilityLevel: {
        type: String,
        enum: ['WCAG AA', 'WCAG AAA', 'Not Tested'],
        default: 'Not Tested',
      },
      languageSupport: {
        type: String,
        enum: ['English', 'Multiple', 'RTL Support'],
        default: 'English',
      },
    },
    // Pricing
    pricingTier: {
      type: String,
      enum: ['Free', 'Premium', 'Freemium'],
      default: 'Free',
    },
    price: {
      type: Number,
      default: 0,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Template", templateSchema);
