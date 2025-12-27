import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  commitmentPeriod: {
    type: String,
    enum: ['1-3 months', '3-6 months', '6-12 months', '1-year-plus', 'flexible'],
    required: true
  },
  hoursPerWeek: {
    type: String,
    enum: ['1-5', '5-10', '10-20', '20-plus', 'flexible'],
    required: true
  },
  days: {
    monday: { type: Boolean, default: false },
    tuesday: { type: Boolean, default: false },
    wednesday: { type: Boolean, default: false },
    thursday: { type: Boolean, default: false },
    friday: { type: Boolean, default: false },
    saturday: { type: Boolean, default: false },
    sunday: { type: Boolean, default: false }
  },
  times: {
    morning: { type: Boolean, default: false },
    afternoon: { type: Boolean, default: false },
    evening: { type: Boolean, default: false }
  }
});

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' }
});

const personalInfoSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    required: true
  },
  nationality: { type: String, default: 'Indian' },
  idType: {
    type: String,
    enum: ['aadhar', 'voter', 'pan', 'passport', 'driving']
  },
  idNumber: String
});

const contactInfoSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  alternatePhone: String,
  address: { type: addressSchema, required: true }
});

const educationInfoSchema = new mongoose.Schema({
  highestEducation: {
    type: String,
    enum: ['high-school', 'diploma', 'bachelors', 'masters', 'phd', 'other'],
    required: true
  },
  fieldOfStudy: String,
  institution: String,
  yearOfCompletion: Number,
  currentlyStudying: { type: Boolean, default: false }
});

const professionalInfoSchema = new mongoose.Schema({
  employmentStatus: {
    type: String,
    enum: ['employed', 'self-employed', 'student', 'unemployed', 'retired'],
    required: true
  },
  currentOccupation: String,
  company: String,
  yearsOfExperience: Number,
  skills: [String],
  otherSkills: String
});

const volunteerInfoSchema = new mongoose.Schema({
  previousVolunteerExperience: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  previousOrganization: String,
  previousRole: String,
  volunteerDuration: String,
  whyVolunteer: { type: String, required: true },
  areasOfInterest: [{ type: String }],
  availability: { type: availabilitySchema, required: true },
  referenceName: String,
  referenceContact: String,
  referenceRelationship: String
});

const additionalInfoSchema = new mongoose.Schema({
  motivation: { type: String, required: true },
  expectations: String,
  specialRequirements: String,
  howDidYouHear: {
    type: String,
    enum: ['website', 'social-media', 'friend', 'volunteer-portal', 'email', 'other', '']
  },
  commitment: { type: Boolean, required: true },
  termsAccepted: { type: Boolean, required: true }
});

const interviewDetailsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  mode: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  location: String,
  link: String,
  instructions: String,
  scheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  }
});

const documentInfoSchema = new mongoose.Schema({
  resume: {
    url: String,
    publicId: String,
    originalName: String,
    size: Number
  },
  idProof: {
    url: String,
    publicId: String,
    originalName: String,
    size: Number
  },
  addressProof: {
    url: String,
    publicId: String,
    originalName: String,
    size: Number
  },
  otherDocuments: [{
    url: String,
    publicId: String,
    originalName: String,
    size: Number
  }]
});

const volunteerApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationType: {
    type: String,
    enum: ['join-our-team', 'project-specific'],
    default: 'join-our-team'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  projectTitle: String,
  status: {
    type: String,
    enum: ['pending', 'under-review', 'shortlisted', 'interview-scheduled', 'approved', 'rejected', 'on-hold'],
    default: 'pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: Date,
  rejectionReason: String,
  notes: String,
  interviewDetails: interviewDetailsSchema,
  
  // Main form sections
  personalInfo: { type: personalInfoSchema, required: true },
  contactInfo: { type: contactInfoSchema, required: true },
  educationInfo: { type: educationInfoSchema, required: true },
  professionalInfo: { type: professionalInfoSchema, required: true },
  volunteerInfo: { type: volunteerInfoSchema, required: true },
  additionalInfo: { type: additionalInfoSchema, required: true },
  documents: { type: documentInfoSchema, required: true },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
volunteerApplicationSchema.index({ user: 1, applicationDate: -1 });
volunteerApplicationSchema.index({ status: 1, applicationDate: -1 });
volunteerApplicationSchema.index({ applicationType: 1, status: 1 });
volunteerApplicationSchema.index({ 'interviewDetails.date': 1 });

// Virtual for full name
volunteerApplicationSchema.virtual('fullName').get(function() {
  return `${this.personalInfo?.firstName || ''} ${this.personalInfo?.lastName || ''}`.trim();
});

// Virtual for age calculation
volunteerApplicationSchema.virtual('age').get(function() {
  if (!this.personalInfo?.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

const VolunteerApplication = mongoose.model('VolunteerApplication', volunteerApplicationSchema);

export default VolunteerApplication;