import asyncHandler from 'express-async-handler';
import Review from '../models/reviewModel.js';
import Drug from '../models/drugModel.js';
import Product from '../models/productModel.js';

// @desc    Create a review
// @route   POST /api/reviews/:itemType/:itemId
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { itemType, itemId } = req.params;
  const { rating, comment } = req.body;

  // Check if item exists
  let item;
  if (itemType === 'drug') {
    item = await Drug.findById(itemId);
  } else if (itemType === 'product') {
    item = await Product.findById(itemId);
  } else {
    res.status(400);
    throw new Error('Invalid item type');
  }

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  // Check if user already reviewed this item
  const existingReview = await Review.findOne({
    user: req.user._id,
    item: itemId,
    itemType
  });

  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this item');
  }

  // Create review
  const review = await Review.create({
    user: req.user._id,
    name: req.user.name,
    rating,
    comment,
    itemType,
    item: itemId
  });

  // Update item's rating
  const reviews = await Review.find({ item: itemId, itemType });
  const avgRating = reviews.reduce((acc, review) => review.rating + acc, 0) / reviews.length;

  if (itemType === 'drug') {
    item.rating = avgRating;
    item.numReviews = reviews.length;
    await item.save();
  } else {
    item.rating = avgRating;
    item.numReviews = reviews.length;
    await item.save();
  }

  res.status(201).json(review);
});

// @desc    Get reviews for an item
// @route   GET /api/reviews/:itemType/:itemId
// @access  Public
const getItemReviews = asyncHandler(async (req, res) => {
  const { itemType, itemId } = req.params;

  const reviews = await Review.find({ item: itemId, itemType })
    .populate('user', 'name')
    .sort('-createdAt');

  res.json(reviews);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user is the review owner or admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Update item's rating
  const item = await (review.itemType === 'drug' ? Drug : Product).findById(review.item);
  if (item) {
    const reviews = await Review.find({ item: review.item, itemType: review.itemType });
    if (reviews.length > 1) {
      const avgRating = reviews
        .filter(r => r._id.toString() !== review._id.toString())
        .reduce((acc, r) => r.rating + acc, 0) / (reviews.length - 1);
      item.rating = avgRating;
      item.numReviews = reviews.length - 1;
    } else {
      item.rating = 0;
      item.numReviews = 0;
    }
    await item.save();
  }

  await review.deleteOne();
  res.json({ message: 'Review removed' });
});

export {
  createReview,
  getItemReviews,
  deleteReview
}; 