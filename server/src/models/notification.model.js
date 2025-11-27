import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'NEW_PROJECT_SUBMISSION',
      'PROJECT_STATUS_UPDATE',
      'beneficiary_application',
      'application_status_update',
      'project_update',
      'volunteer_application',
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    // Flexible field for additional data
    projectId: mongoose.Schema.Types.ObjectId,
    beneficiaryId: mongoose.Schema.Types.ObjectId,
    volunteerId: mongoose.Schema.Types.ObjectId,
    projectTitle: String,
    submittedBy: String,
    status: String,
    rejectionReason: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);