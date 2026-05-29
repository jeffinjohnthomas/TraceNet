const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.googleId && !this.otp; } },
  role: { type: String, enum: ['admin', 'investigator', 'public'], default: 'public' },
  activeCases: { type: Number, default: 0 },
  googleId: { type: String, default: null },
  
  // Advanced Auth Fields
  emailVerified: { type: Boolean, default: false },
  accountStatus: { type: String, enum: ['pending', 'verified', 'locked'], default: 'pending' },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  
  // OTP Hashes (Bcrypt)
  emailOtp: { type: String, default: null },
  emailOtpExpiry: { type: Date, default: null },
  forgotPasswordOtp: { type: String, default: null },
  forgotPasswordOtpExpiry: { type: Date, default: null },
  
  // Legacy fields (kept for backward compatibility during migration)
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },

  notifications: [{
    message: String,
    type: { type: String, default: 'info' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    // Only hash if it's not already hashed (bcrypt hashes start with $2a$ or $2b$)
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
  next();
});

const caseSchema = new mongoose.Schema({
  caseId: { type: String, unique: true },
  subjectName: { type: String, required: true },
  age: { type: String, required: false },
  gender: { type: String, required: false },
  location: { type: String, required: true },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  description: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Low' },
  status: { type: String, enum: ['Pending Review', 'Submitted', 'Evidence Verified', 'In Progress', 'Closed'], default: 'Submitted' },
  assignedInvestigator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  updates: [{
    status: String,
    message: String,
    investigatorName: String,
    time: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

caseSchema.pre('save', function (next) {
  if (this.isNew) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.caseId = `CIS-${new Date().getFullYear()}-${randomNum}`;
    
    // Smart Priority Logic
    const desc = this.description.toLowerCase();
    
    const highRiskKeywords = ['weapon', 'assault', 'critical', 'immediate', 'threat', 'murder', 'homicide', 'kidnap'];
    const medRiskKeywords = ['fraud', 'theft', 'missing', 'suspicious', 'embezzlement', 'robbery'];
    
    if (highRiskKeywords.some(kw => desc.includes(kw))) {
      this.priority = 'High';
    } else if (medRiskKeywords.some(kw => desc.includes(kw))) {
      this.priority = 'Medium';
    } else {
      this.priority = 'Low';
    }

    // Auto-Geocode rough coordinates for heatmap visualization based on city
    if (!this.latitude || !this.longitude) {
      const geoMap = {
        'Bangalore Urban': { lat: 12.9716, lng: 77.5946 },
        'Bangalore Rural': { lat: 13.2000, lng: 77.6000 },
        'Mysore': { lat: 12.2958, lng: 76.6394 },
        'Mangalore': { lat: 12.9141, lng: 74.8560 },
        'Hubli-Dharwad': { lat: 15.3647, lng: 75.1240 },
        'Delhi Central': { lat: 28.6139, lng: 77.2090 },
        'Mumbai Metropolitan': { lat: 19.0760, lng: 72.8777 },
        'Chennai': { lat: 13.0827, lng: 80.2707 }
      };
      
      const loc = geoMap[this.location];
      if (loc) {
        // Add a slight randomization so markers in the same city don't completely overlap
        this.latitude = loc.lat + (Math.random() - 0.5) * 0.05;
        this.longitude = loc.lng + (Math.random() - 0.5) * 0.05;
      }
    }
    
    // Auto-inject initial Timeline payload
    this.updates.push({
       status: 'Submitted',
       message: 'Your Intelligence Report has been securely transmitted and encrypted into the database.',
       investigatorName: 'System Core'
    });
  }
  next();
});

const noteSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  author: { type: String, required: true },
  text: { type: String, required: true },
  visibility: { type: String, enum: ['private', 'public'], default: 'public' }
}, { timestamps: true });

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
}, { timestamps: true });

const evidenceSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true }
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', userSchema),
  Case: mongoose.model('Case', caseSchema),
  Note: mongoose.model('Note', noteSchema),
  AuditLog: mongoose.model('AuditLog', auditLogSchema),
  Evidence: mongoose.model('Evidence', evidenceSchema)
};
