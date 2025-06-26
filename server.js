const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/templi")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import routes
const templateRoutes = require("./routes/templates");
const userRoutes = require("./routes/users");
const interactionRoutes = require("./routes/interactions");
const reviewRoutes = require("./routes/reviews");

// Use routes
app.use("/api/templates", templateRoutes);
app.use("/api/users", userRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/reviews", reviewRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Templi API is running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
