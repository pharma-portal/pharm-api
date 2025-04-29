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

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  countInStock: {
    type: Number,
    required: true,
    default: 0
  },
  rating: {
    type: Number,
    required: true,
    default: 0
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0
  },
  image: {
    type: String,
    default: 'default-product.jpg'
  },
  reviews: [reviewSchema],
  featured: {
    type: Boolean,
    default: false
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  weight: {
    type: String
  },
  dimensions: {
    type: String
  },
  barcode: {
    type: String
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product; 