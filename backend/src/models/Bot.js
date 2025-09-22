import mongoose from 'mongoose';

const botSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'customer-support',
      'educational',
      'creative-writing',
      'code-assistant',
      'health-wellness',
      'financial-advisor',
      'general',
      'custom'
    ],
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  systemPrompt: {
    type: String,
    required: true
  },
  model: {
    provider: {
      type: String,
      enum: ['huggingface', 'openai', 'anthropic', 'deepseek', 'custom'],
      default: 'huggingface'
    },
    modelId: {
      type: String,
      required: true
    },
    parameters: {
      temperature: { type: Number, default: 0.7, min: 0, max: 2 },
      maxTokens: { type: Number, default: 1000, min: 1, max: 4000 },
      topP: { type: Number, default: 0.9, min: 0, max: 1 },
      topK: { type: Number, default: 50, min: 1, max: 100 },
      repetitionPenalty: { type: Number, default: 1.0, min: 0.1, max: 2.0 },
      stopSequences: [String]
    }
  },
  capabilities: {
    textGeneration: { type: Boolean, default: true },
    codeGeneration: { type: Boolean, default: false },
    imageAnalysis: { type: Boolean, default: false },
    documentAnalysis: { type: Boolean, default: false },
    webSearch: { type: Boolean, default: false },
    knowledgeBase: { type: Boolean, default: false },
    voiceInteraction: { type: Boolean, default: false },
    multiLanguage: { type: Boolean, default: true }
  },
  knowledgeBase: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeBase'
  }],
  tools: [{
    name: String,
    description: String,
    endpoint: String,
    parameters: mongoose.Schema.Types.Mixed
  }],
  personality: {
    tone: {
      type: String,
      enum: ['professional', 'friendly', 'casual', 'formal', 'humorous', 'empathetic'],
      default: 'friendly'
    },
    style: {
      type: String,
      enum: ['concise', 'detailed', 'conversational', 'technical', 'creative'],
      default: 'conversational'
    },
    traits: [String]
  },
  safety: {
    contentFilter: { type: Boolean, default: true },
    toxicityThreshold: { type: Number, default: 0.8, min: 0, max: 1 },
    allowedTopics: [String],
    blockedTopics: [String],
    requireModeration: { type: Boolean, default: false }
  },
  usage: {
    totalConversations: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
  },
  analytics: {
    popularQuestions: [{
      question: String,
      count: Number,
      lastAsked: Date
    }],
    responseTime: {
      average: { type: Number, default: 0 },
      p95: { type: Number, default: 0 }
    },
    satisfactionScore: { type: Number, default: 0 },
    escalationRate: { type: Number, default: 0 }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  tags: [String],
  category: String,
  pricing: {
    model: {
      type: String,
      enum: ['free', 'per-message', 'subscription', 'enterprise'],
      default: 'free'
    },
    pricePerMessage: { type: Number, default: 0 },
    monthlyPrice: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
botSchema.index({ owner: 1 });
botSchema.index({ organization: 1 });
botSchema.index({ type: 1 });
botSchema.index({ isPublic: 1, isActive: 1 });
botSchema.index({ tags: 1 });

// Virtual for popularity score
botSchema.virtual('popularityScore').get(function() {
  const conversationWeight = this.usage.totalConversations * 0.4;
  const ratingWeight = this.usage.averageRating * this.usage.totalRatings * 0.6;
  return conversationWeight + ratingWeight;
});

// Update usage statistics
botSchema.methods.updateUsage = function(messageCount = 1, tokenCount = 0) {
  this.usage.totalMessages += messageCount;
  this.usage.totalTokens += tokenCount;
  return this.save();
};

// Update rating
botSchema.methods.updateRating = function(rating) {
  const totalScore = this.usage.averageRating * this.usage.totalRatings;
  this.usage.totalRatings += 1;
  this.usage.averageRating = (totalScore + rating) / this.usage.totalRatings;
  return this.save();
};

// Add popular question
botSchema.methods.addPopularQuestion = function(question) {
  const existingQuestion = this.analytics.popularQuestions.find(
    q => q.question.toLowerCase() === question.toLowerCase()
  );
  
  if (existingQuestion) {
    existingQuestion.count += 1;
    existingQuestion.lastAsked = new Date();
  } else {
    this.analytics.popularQuestions.push({
      question,
      count: 1,
      lastAsked: new Date()
    });
  }
  
  // Keep only top 20 questions
  this.analytics.popularQuestions.sort((a, b) => b.count - a.count);
  this.analytics.popularQuestions = this.analytics.popularQuestions.slice(0, 20);
  
  return this.save();
};

// Get bot configuration for AI model
botSchema.methods.getModelConfig = function() {
  return {
    provider: this.model.provider,
    modelId: this.model.modelId,
    parameters: this.model.parameters,
    systemPrompt: this.systemPrompt,
    capabilities: this.capabilities,
    safety: this.safety
  };
};

const Bot = mongoose.model('Bot', botSchema);

export default Bot;
