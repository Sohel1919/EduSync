import mongoose from 'mongoose';

const beneficiarySchema = new mongoose.Schema({
  // Application reference
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  projectTitle: {
    type: String,
    required: true
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Personal Information
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },
    maritalStatus: { type: String, required: true },
    nationality: { type: String, default: 'Indian' },
    idNumber: { type: String, required: true },
    idType: { type: String, required: true }
  },
  
  // Contact Information
  contactInfo: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' }
    }
  },
  
  // Family Background
  familyBackground: {
    familySize: { type: Number, required: true },
    numberOfDependents: { type: Number, required: true },
    monthlyIncome: { type: Number, required: true },
    incomeSource: { type: String, required: true },
    housingType: { type: String, required: true },
    hasDisability: { type: Boolean, default: false },
    disabilityType: { type: String }
  },
  
  // Application Details
  applicationDetails: {
    previousApplications: { type: String, default: 'no' },
    expectedSupport: { type: Number, required: true },
    howDidYouHear: { type: String, required: true },
    referralSource: { type: String },
    emergencyContact: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true }
    }
  },
  
  // Documents
  documents: {
    idProof: {
      url: String,
      publicId: String
    },
    addressProof: {
      url: String,
      publicId: String
    },
    incomeProof: {
      url: String,
      publicId: String
    },
    medicalProof: {
      url: String,
      publicId: String
    },
    otherDocuments: [{
      url: String,
      publicId: String,
      originalName: String
    }]
  },
  
  // Additional Information
  additionalInfo: {
    story: { type: String, required: true },
    challenges: { type: String, required: true },
    futurePlans: { type: String },
    howProjectWillHelp: { type: String, required: true },
    commitment: { type: Boolean, required: true }
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['pending', 'under-review', 'approved', 'rejected', 'on-hold'],
    default: 'pending'
  },
  
  // Review Information
  reviewNotes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
beneficiarySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Beneficiary', beneficiarySchema);