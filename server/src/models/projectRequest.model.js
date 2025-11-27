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
      'healthcare', 
      'empowerment',
      'environment',
      'disaster-relief',
      'animal-welfare',
      'elderly-care',
      'child-development'
    ]
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be greater than 0']
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date,
    required: [true, 'Project deadline is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
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
  tags: [{
    type: String,
    trim: true
  }],
  projectImage: {
    public_id: String,
    url: String
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  isApproved: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  donors: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
projectSchema.index({ category: 1, isApproved: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ isApproved: 1 });

// Virtual for checking if project is expired
projectSchema.virtual('isExpired').get(function() {
  return this.deadline < new Date();
});

// Method to update progress
projectSchema.methods.updateProgress = function() {
  this.progress = Math.min(Math.round((this.currentAmount / this.targetAmount) * 100), 100);
  return this.save();
};

// Static method to get approved projects
projectSchema.statics.getApprovedProjects = function() {
  return this.find({ isApproved: 'approved' });
};

// Static method to get pending projects
projectSchema.statics.getPendingProjects = function() {
  return this.find({ isApproved: 'pending' });
};

export default mongoose.model('ProjectRequest', projectSchema);