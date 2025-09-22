import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'developer', 'analyst'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    defaultBot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bot',
      default: null
    }
  },
  usage: {
    totalMessages: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    monthlyMessages: { type: Number, default: 0 },
    monthlyTokens: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'active'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for performance
// Note: 'email' already has unique: true on the schema field, so we don't add a duplicate index here.
userSchema.index({ organization: 1 });
userSchema.index({ 'subscription.plan': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update usage stats
userSchema.methods.updateUsage = function(messageCount = 1, tokenCount = 0) {
  this.usage.totalMessages += messageCount;
  this.usage.totalTokens += tokenCount;
  this.usage.monthlyMessages += messageCount;
  this.usage.monthlyTokens += tokenCount;
  return this.save();
};

// Reset monthly usage
userSchema.methods.resetMonthlyUsage = function() {
  this.usage.monthlyMessages = 0;
  this.usage.monthlyTokens = 0;
  this.usage.lastResetDate = new Date();
  return this.save();
};

// Check if user has exceeded limits
userSchema.methods.hasExceededLimits = function() {
  const limits = {
    free: { messages: 100, tokens: 50000 },
    basic: { messages: 1000, tokens: 500000 },
    pro: { messages: 10000, tokens: 5000000 },
    enterprise: { messages: Infinity, tokens: Infinity }
  };
  
  const userLimits = limits[this.subscription.plan];
  return this.usage.monthlyMessages >= userLimits.messages || 
         this.usage.monthlyTokens >= userLimits.tokens;
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
