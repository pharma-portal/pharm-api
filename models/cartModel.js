import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  drug: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Drug'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  prescription: {
    type: String,
    required: function() {
      return this.requiresPrescription;
    }
  },
  requiresPrescription: {
    type: Boolean,
    default: false
  }
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