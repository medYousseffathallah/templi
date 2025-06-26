const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const interactionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    template: {
      type: String,
      ref: "Template",
      required: true,
    },
    interactionType: {
      type: String,
      enum: ["like", "dislike", "favorite", "view", "download"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    _id: false, // Disable automatic ObjectId generation
  }
);

// Create a compound index to ensure a user can only have one like/dislike/favorite per template
// But allow multiple view and download interactions
interactionSchema.index(
  { user: 1, template: 1, interactionType: 1 },
  { 
    unique: true,
    partialFilterExpression: { interactionType: { $in: ["like", "dislike", "favorite"] } }
  }
);

module.exports = mongoose.model("Interaction", interactionSchema);
