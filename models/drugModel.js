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
  }
}, {
  timestamps: true
});

const drugSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter drug name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please enter drug description']
  },
  price: {
    type: Number,
    required: [true, 'Please enter drug price'],
    min: 0
  },
  brand: {
    type: String,
    required: [true, 'Please enter drug brand']
  },
  category: {
    type: String,
    required: [true, 'Please enter drug category']
  },
  requiresPrescription: {
    type: Boolean,
    default: false
  },
  inStock: {
    type: Number,
    required: [true, 'Please enter stock quantity'],
    min: 0,
    default: 0
  },
  dosageForm: {
    type: String,
    required: true,
    // enum: ['tablet', 'capsule', 'liquid', 'cream', 'ointment', 'injection', 'other']
  },
  strength: {
    type: String,
    required: true
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: '/uploads/default-drug.jpg'
  }
}, {
  timestamps: true
});

// Calculate average rating when reviews are modified
drugSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.rating = this.reviews.reduce((acc, review) => review.rating + acc, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
  next();
});

const Drug = mongoose.model('Drug', drugSchema);
export default Drug; 