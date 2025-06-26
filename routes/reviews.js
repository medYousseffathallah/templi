const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get reviews for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewedUser: userId })
      .populate('reviewer', 'name username profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new review
router.post('/', auth, async (req, res) => {
  try {
    const { reviewedUser, rating, comment } = req.body;
    const reviewer = req.user.id;

    // Check if user is trying to review themselves
    if (reviewer === reviewedUser) {
      return res.status(400).json({ message: 'You cannot review yourself' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ reviewer, reviewedUser });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this user' });
    }

    // Create new review
    const review = new Review({
      reviewer,
      reviewedUser,
      rating,
      comment
    });

    await review.save();

    // Add review to user's reviews array
    await User.findOneAndUpdate(
      { _id: reviewedUser },
      { $push: { reviews: review._id } }
    );

    // Populate reviewer info before sending response
    await review.populate('reviewer', 'name username profilePicture');
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a review
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findOne({ _id: reviewId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.reviewer !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    await review.populate('reviewer', 'name username profilePicture');
    
    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a review
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({ _id: reviewId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.reviewer !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    // Remove review from user's reviews array
    await User.findOneAndUpdate(
      { _id: review.reviewedUser },
      { $pull: { reviews: reviewId } }
    );

    await Review.findOneAndDelete({ _id: reviewId });
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;