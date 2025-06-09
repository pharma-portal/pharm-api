import mongoose from 'mongoose';

const prescriptionSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  image: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription; 