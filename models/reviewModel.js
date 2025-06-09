import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    enum: ['drug', 'product'],
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemType'
  }
}, {
  timestamps: true
});

// Create compound index to ensure one review per user per item
reviewSchema.index({ user: 1, item: 1, itemType: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review; 