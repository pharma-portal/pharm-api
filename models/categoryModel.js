import mongoose from 'mongoose';

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['drug', 'mart'],
    default: 'mart'
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

// Prevent circular references
categorySchema.pre('save', async function(next) {
  if (this.parent && this.parent.toString() === this._id.toString()) {
    throw new Error('Category cannot be its own parent');
  }
  next();
});

// Create index to enforce unique category names
categorySchema.index({ name: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);
export default Category; 