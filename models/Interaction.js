const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },
    interactionType: {
      type: String,
      enum: ["like", "dislike", "favorite", "view"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure a user can only have one interaction type per template
interactionSchema.index(
  { user: 1, template: 1, interactionType: 1 },
  { unique: true }
);

module.exports = mongoose.model("Interaction", interactionSchema);
