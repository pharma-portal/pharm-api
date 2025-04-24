import mongoose from 'mongoose';

const guestOrderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    lowercase: true
  },
  name: {
    type: String,
    required: [true, 'Please enter your name']
  },
  phone: {
    type: String,
    required: [true, 'Please enter your phone number']
  },
  orderItems: [
    {
      drug: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Drug'
      },
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      prescription: String
    }
  ],
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
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
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const GuestOrder = mongoose.model('GuestOrder', guestOrderSchema);
export default GuestOrder; 