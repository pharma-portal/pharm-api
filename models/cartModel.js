import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  // Common fields for both drug and product
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  
  // Fields for drugs (pharmacy)
  drug: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drug'
  },
  prescriptionFile: {
    type: String,
    required: false
  },
  requiresPrescription: {
    type: Boolean,
    default: false
  },
  
  // Fields for products (mart)
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  
  // Either drug or product must be present
  itemType: {
    type: String,
    enum: ['drug', 'product'],
    required: true
  }
});

// Validate that either drug or product is provided, but not both
cartItemSchema.pre('validate', function(next) {
  if ((this.drug && this.product) || (!this.drug && !this.product)) {
    const error = new Error('Cart item must have either a drug or a product reference, but not both');
    return next(error);
  }
  
  if ((this.itemType === 'drug' && !this.drug) || (this.itemType === 'product' && !this.product)) {
    const error = new Error('Item type does not match the provided reference');
    return next(error);
  }
  
  next();
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart; 