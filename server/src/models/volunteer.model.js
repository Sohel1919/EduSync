import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  skills: [{
    type: String,
    enum: ['teaching', 'medical', 'construction', 'counseling', 'technical', 'administrative', 'fundraising', 'cooking', 'driving', 'language']
  }],
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends', 'evenings', 'flexible'],
    default: 'part-time'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active'
  },
  profileImage: {
    public_id: String,
    url: String
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  hoursCompleted: {
    type: Number,
    default: 0
  },
  eventsAttended: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
volunteerSchema.index({ email: 1 });
volunteerSchema.index({ status: 1 });
volunteerSchema.index({ skills: 1 });

export default mongoose.model('Volunteer', volunteerSchema);