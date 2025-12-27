import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  summary: {
    type: String,
    required: [true, 'Project summary is required'],
    trim: true,
    maxlength: [200, 'Summary cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Project category is required'],
    enum: [
      'education',
      'digital-learning', 
      'scholarship',
      'mentorship',
      'skill-development',
      'school-infrastructure',
      'girl-education',
    ]
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be greater than 0']
  },
  collectedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Collected amount cannot be negative']
  },
  deadline: {
    type: Date,
    required: [true, 'Project deadline is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  images: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  beneficiaries: {
    type: Number,
    required: [true, 'Number of beneficiaries is required'],
    min: [1, 'Number of beneficiaries must be at least 1']
  },
  organization: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Project location is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'draft'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project creator is required']
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate slug before saving
projectSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
  }
  next();
});

// Index for better query performance
projectSchema.index({ createdBy: 1, status: 1 });
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ deadline: 1 });

export default mongoose.model('Project', projectSchema);