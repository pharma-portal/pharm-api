import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'default-category.jpg'
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create index to enforce unique category names
categorySchema.index({ name: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);
export default Category; 