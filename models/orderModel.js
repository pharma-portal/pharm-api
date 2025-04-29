import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  
  // Fields for drugs (pharmacy)
  drug: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drug'
  },
  prescriptionVerified: {
    type: Boolean,
    default: false
  },
  prescriptionFile: {
    type: String
  },
  
  // Fields for products (mart)
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  
  // Item type field to distinguish between drug and product
  itemType: {
    type: String,
    enum: ['drug', 'product'],
    required: true
  }
});

// Validate that either drug or product is provided, but not both
orderItemSchema.pre('validate', function(next) {
  if ((this.drug && this.product) || (!this.drug && !this.product)) {
    const error = new Error('Order item must have either a drug or a product reference, but not both');
    return next(error);
  }
  
  if ((this.itemType === 'drug' && !this.drug) || (this.itemType === 'product' && !this.product)) {
    const error = new Error('Item type does not match the provided reference');
    return next(error);
  }
  
  next();
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String
  },
  estimatedDelivery: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order; 