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
    const user = await User.findById(req.params.id).populate("favorites");
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add template to favorites
router.post("/:id/favorites/:templateId", getUser, async (req, res) => {
  try {
    if (!res.user.favorites.includes(req.params.templateId)) {
      res.user.favorites.push(req.params.templateId);
      await res.user.save();
    }
    res.json({ message: "Template added to favorites" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove template from favorites
router.delete("/:id/favorites/:templateId", getUser, async (req, res) => {
  try {
    res.user.favorites = res.user.favorites.filter(
      (template) => template.toString() !== req.params.templateId
    );
    await res.user.save();
    res.json({ message: "Template removed from favorites" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Middleware to get user by ID
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.user = user;
  next();
}

module.exports = router;
