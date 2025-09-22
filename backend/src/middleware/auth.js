import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
export const generateToken = (userId, role = 'user') => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: '30d' }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
};

// Authenticate token middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token - user not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Please login again'
      });
    }

    return res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error'
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Backward-compatible alias used by some routes (expects an array)
export const requireRole = (roles = []) => {
  const normalized = Array.isArray(roles) ? roles : [roles];
  return authorize(...normalized);
};

// Check subscription limits
export const checkLimits = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (user.hasExceededLimits()) {
      return res.status(429).json({
        error: 'Limit exceeded',
        message: 'You have exceeded your monthly usage limits',
        usage: user.usage,
        subscription: user.subscription
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Limit check error',
      message: 'Unable to verify usage limits'
    });
  }
};

// Optional authentication (for public endpoints that can benefit from user context)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Validate API key for external integrations
export const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required',
        message: 'Please provide a valid API key'
      });
    }

    // Find user by API key (you'd need to add apiKey field to User model)
    const user = await User.findOne({ apiKey }).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'Please provide a valid API key'
      });
    }

    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    req.isApiRequest = true;
    
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'API key validation error',
      message: 'Internal server error'
    });
  }
};

// Rate limiting by user
export const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const userId = req.userId || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(userId)) {
      requests.set(userId, []);
    }
    
    const userRequests = requests.get(userId);
    
    // Remove old requests
    const validRequests = userRequests.filter(time => time > windowStart);
    requests.set(userId, validRequests);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${maxRequests} per ${windowMs / 1000 / 60} minutes`,
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }
    
    validRequests.push(now);
    next();
  };
};

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  authenticateToken,
  authorize,
  checkLimits,
  optionalAuth,
  validateApiKey,
  userRateLimit,
  requireRole
};
