import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bot',
    required: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  channel: {
    type: String,
    enum: ['web', 'whatsapp', 'telegram', 'slack', 'api', 'voice'],
    default: 'web'
  },
  language: {
    type: String,
    default: 'en'
  },
  context: {
    sessionId: String,
    userAgent: String,
    ipAddress: String,
    referrer: String,
    location: {
      country: String,
      city: String,
      timezone: String
    },
    messages: [{
      role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  memory: {
    shortTerm: [{
      key: String,
      value: mongoose.Schema.Types.Mixed,
      timestamp: { type: Date, default: Date.now },
      expiresAt: Date
    }],
    longTerm: [{
      key: String,
      value: mongoose.Schema.Types.Mixed,
      importance: { type: Number, default: 1, min: 1, max: 10 },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  metadata: {
    totalMessages: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    userSatisfaction: { type: Number, min: 1, max: 5 },
    tags: [String],
    category: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    }
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'escalated', 'archived'],
    default: 'active'
  },
  escalation: {
    isEscalated: { type: Boolean, default: false },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    escalationReason: String,
    escalatedAt: Date,
    resolvedAt: Date
  },
  analytics: {
    sentiment: {
      overall: { type: Number, default: 0, min: -1, max: 1 },
      history: [{
        score: Number,
        timestamp: Date,
        messageId: mongoose.Schema.Types.ObjectId
      }]
    },
    emotions: [{
      emotion: String,
      confidence: Number,
      timestamp: Date,
      messageId: mongoose.Schema.Types.ObjectId
    }],
    topics: [{
      topic: String,
      confidence: Number,
      firstMentioned: Date,
      lastMentioned: Date
    }],
    intents: [{
      intent: String,
      confidence: Number,
      timestamp: Date,
      messageId: mongoose.Schema.Types.ObjectId
    }]
  },
  settings: {
    isPrivate: { type: Boolean, default: false },
    allowAnalytics: { type: Boolean, default: true },
    retentionPeriod: { type: Number, default: 365 }, // days
    autoArchive: { type: Boolean, default: true }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  endedAt: Date,
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    categories: [String],
    timestamp: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
conversationSchema.index({ user: 1, createdAt: -1 });
conversationSchema.index({ bot: 1, createdAt: -1 });
conversationSchema.index({ status: 1, lastActivity: -1 });
conversationSchema.index({ channel: 1 });
conversationSchema.index({ 'escalation.isEscalated': 1 });

// Virtual for duration
conversationSchema.virtual('duration').get(function() {
  const endTime = this.endedAt || new Date();
  return endTime - this.createdAt;
});

// Virtual for message count
conversationSchema.virtual('messageCount').get(function() {
  return this.metadata.totalMessages;
});

// Update last activity
conversationSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Add to in-conversation memory (short transcript kept in context.messages)
conversationSchema.methods.addToMemory = function(entry) {
  if (!this.context) this.context = {};
  if (!Array.isArray(this.context.messages)) this.context.messages = [];
  const normalized = {
    role: entry.role === 'assistant' || entry.role === 'bot' ? 'assistant' : (entry.role === 'system' ? 'system' : 'user'),
    content: String(entry.content || ''),
    timestamp: entry.timestamp || new Date()
  };
  this.context.messages.push(normalized);
  // keep last 50 messages to bound size
  if (this.context.messages.length > 50) {
    this.context.messages = this.context.messages.slice(-50);
  }
  this.lastActivity = new Date();
  return this.save();
};

// Add to short-term memory
conversationSchema.methods.addToShortTermMemory = function(key, value, expiresInHours = 24) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);
  
  // Remove existing entry with same key
  this.memory.shortTerm = this.memory.shortTerm.filter(item => item.key !== key);
  
  this.memory.shortTerm.push({
    key,
    value,
    expiresAt
  });
  
  return this.save();
};

// Add to long-term memory
conversationSchema.methods.addToLongTermMemory = function(key, value, importance = 5) {
  // Remove existing entry with same key
  this.memory.longTerm = this.memory.longTerm.filter(item => item.key !== key);
  
  this.memory.longTerm.push({
    key,
    value,
    importance
  });
  
  // Keep only top 50 most important memories
  this.memory.longTerm.sort((a, b) => b.importance - a.importance);
  this.memory.longTerm = this.memory.longTerm.slice(0, 50);
  
  return this.save();
};

// Get active memories
conversationSchema.methods.getActiveMemories = function() {
  const now = new Date();
  
  // Filter expired short-term memories
  const activeShortTerm = this.memory.shortTerm.filter(
    item => !item.expiresAt || item.expiresAt > now
  );
  
  return {
    shortTerm: activeShortTerm,
    longTerm: this.memory.longTerm
  };
};

// Update sentiment
conversationSchema.methods.updateSentiment = function(score, messageId) {
  this.analytics.sentiment.history.push({
    score,
    timestamp: new Date(),
    messageId
  });
  
  // Calculate overall sentiment (weighted average of recent messages)
  const recentHistory = this.analytics.sentiment.history.slice(-10);
  const totalScore = recentHistory.reduce((sum, item) => sum + item.score, 0);
  this.analytics.sentiment.overall = totalScore / recentHistory.length;
  
  return this.save();
};

// Add emotion detection
conversationSchema.methods.addEmotion = function(emotion, confidence, messageId) {
  this.analytics.emotions.push({
    emotion,
    confidence,
    timestamp: new Date(),
    messageId
  });
  
  // Keep only recent emotions
  this.analytics.emotions = this.analytics.emotions.slice(-20);
  
  return this.save();
};

// Update usage stats
conversationSchema.methods.updateStats = function(messageCount = 1, tokenCount = 0, responseTime = 0) {
  this.metadata.totalMessages += messageCount;
  this.metadata.totalTokens += tokenCount;
  
  // Update average response time
  if (responseTime > 0) {
    const currentAvg = this.metadata.averageResponseTime;
    const totalMessages = this.metadata.totalMessages;
    this.metadata.averageResponseTime = 
      ((currentAvg * (totalMessages - 1)) + responseTime) / totalMessages;
  }
  
  this.lastActivity = new Date();
  return this.save();
};

// End conversation
conversationSchema.methods.endConversation = function(reason = 'completed') {
  this.status = reason === 'escalated' ? 'escalated' : 'completed';
  this.endedAt = new Date();
  return this.save();
};

// Escalate conversation
conversationSchema.methods.escalate = function(escalatedTo, reason) {
  this.escalation.isEscalated = true;
  this.escalation.escalatedTo = escalatedTo;
  this.escalation.escalationReason = reason;
  this.escalation.escalatedAt = new Date();
  this.status = 'escalated';
  return this.save();
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
