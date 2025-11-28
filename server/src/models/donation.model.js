import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 10
  },
  currency: {
    type: String,
    default: 'INR'
  },
  cause: {
    type: String,
    required: true,
    enum: ['education', 'healthcare', 'women', 'general']
  },
  causeName: {
    type: String,
    required: true
  },
  razorpay_order_id: {
    type: String,
    required: true,
    unique: true
  },
  razorpay_payment_id: {
    type: String,
    sparse: true
  },
  razorpay_signature: {
    type: String,
    sparse: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  receipt_url: {
    type: String
  },
  donor_info: {
    name: String,
    email: String,
    phone: String,
    isAnonymous: Boolean
  },
  payment_method: {
    type: String
  },
  bank: {
    type: String
  },
  wallet: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ status: 1 });
donationSchema.index({ razorpay_order_id: 1 });

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;