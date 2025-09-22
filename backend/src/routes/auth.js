import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateToken, generateRefreshToken, authenticateToken } from '../middleware/auth.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register new user
router.post('/register', registerValidation, catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      error: 'User already exists',
      message: 'An account with this email already exists'
    });
  }

  // Create new user
  const user = new User({
    email,
    password,
    firstName,
    lastName,
    emailVerificationToken: crypto.randomBytes(32).toString('hex')
  });

  await user.save();

  // Generate tokens
  const accessToken = generateToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Update login stats
  user.loginCount += 1;
  user.lastLogin = new Date();
  await user.save();

  res.status(201).json({
    message: 'User registered successfully',
    user: user.toJSON(),
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  });
}));

// Login user
router.post('/login', loginValidation, catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      error: 'Account deactivated',
      message: 'Your account has been deactivated. Please contact support.'
    });
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    });
  }

  // Generate tokens
  const accessToken = generateToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Update login stats
  user.loginCount += 1;
  user.lastLogin = new Date();
  await user.save();

  res.json({
    message: 'Login successful',
    user: user.toJSON(),
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  });
}));

// Get current user profile
router.get('/me', authenticateToken, catchAsync(async (req, res) => {
  const user = await User.findById(req.userId)
    .populate('preferences.defaultBot', 'name type avatar')
    .populate('organization', 'name');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    user: user.toJSON()
  });
}));

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('preferences.theme').optional().isIn(['light', 'dark', 'system']),
  body('preferences.language').optional().isLength({ min: 2, max: 5 }),
  body('preferences.notifications.email').optional().isBoolean(),
  body('preferences.notifications.push').optional().isBoolean(),
  body('preferences.notifications.marketing').optional().isBoolean()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const allowedUpdates = [
    'firstName', 'lastName', 'avatar', 'preferences'
  ];
  
  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.json({
    message: 'Profile updated successfully',
    user: user.toJSON()
  });
}));

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      error: 'Invalid password',
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    message: 'Password changed successfully'
  });
}));

// Refresh token
router.post('/refresh', catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      error: 'Refresh token required',
      message: 'Please provide a refresh token'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // Generate new tokens
    const newAccessToken = generateToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    });
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid refresh token',
      message: 'Please login again'
    });
  }
}));

// Logout (client-side token invalidation)
router.post('/logout', authenticateToken, catchAsync(async (req, res) => {
  // In a production app, you might want to blacklist the token
  // For now, we'll just send a success response
  res.json({
    message: 'Logged out successfully'
  });
}));

// Get user usage statistics
router.get('/usage', authenticateToken, catchAsync(async (req, res) => {
  const user = await User.findById(req.userId);
  
  const limits = {
    free: { messages: 100, tokens: 50000 },
    basic: { messages: 1000, tokens: 500000 },
    pro: { messages: 10000, tokens: 5000000 },
    enterprise: { messages: Infinity, tokens: Infinity }
  };

  const userLimits = limits[user.subscription.plan];
  const usage = user.usage;

  res.json({
    usage: {
      totalMessages: usage.totalMessages,
      totalTokens: usage.totalTokens,
      monthlyMessages: usage.monthlyMessages,
      monthlyTokens: usage.monthlyTokens,
      lastResetDate: usage.lastResetDate
    },
    limits: userLimits,
    subscription: user.subscription,
    percentageUsed: {
      messages: userLimits.messages === Infinity ? 0 : (usage.monthlyMessages / userLimits.messages) * 100,
      tokens: userLimits.tokens === Infinity ? 0 : (usage.monthlyTokens / userLimits.tokens) * 100
    }
  });
}));

// Delete account
router.delete('/account', authenticateToken, [
  body('password').notEmpty().withMessage('Password is required for account deletion'),
  body('confirmDelete').equals('DELETE').withMessage('Please type DELETE to confirm')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { password } = req.body;

  const user = await User.findById(req.userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(400).json({
      error: 'Invalid password',
      message: 'Password is incorrect'
    });
  }

  // Soft delete - deactivate account
  user.isActive = false;
  user.email = `deleted_${Date.now()}_${user.email}`;
  await user.save();

  res.json({
    message: 'Account deleted successfully'
  });
}));

export default router;
