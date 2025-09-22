import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: {
      type: String,
      enum: ['user', 'bot', 'system'],
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bot'
    }
  },
  content: {
    text: String,
    type: {
      type: String,
      enum: ['text', 'image', 'audio', 'video', 'file', 'code', 'system'],
      default: 'text'
    },
    format: {
      type: String,
      enum: ['plain', 'markdown', 'html'],
      default: 'markdown'
    },
    attachments: [{
      type: {
        type: String,
        enum: ['image', 'audio', 'video', 'document', 'code']
      },
      url: String,
      filename: String,
      size: Number,
      mimeType: String,
      metadata: mongoose.Schema.Types.Mixed
    }]
  },
  model: {
    provider: String,
    modelId: String,
    version: String,
    parameters: mongoose.Schema.Types.Mixed
  },
  processing: {
    tokens: {
      input: { type: Number, default: 0 },
      output: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    latency: {
      total: Number, // milliseconds
      modelInference: Number,
      preprocessing: Number,
      postprocessing: Number
    },
    cost: {
      inputCost: { type: Number, default: 0 },
      outputCost: { type: Number, default: 0 },
      totalCost: { type: Number, default: 0 }
    }
  },
  analytics: {
    sentiment: {
      score: { type: Number, min: -1, max: 1 },
      label: {
        type: String,
        enum: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive']
      },
      confidence: { type: Number, min: 0, max: 1 }
    },
    emotions: [{
      emotion: String,
      confidence: Number
    }],
    topics: [{
      topic: String,
      confidence: Number
    }],
    intent: {
      name: String,
      confidence: Number,
      parameters: mongoose.Schema.Types.Mixed
    },
    language: {
      detected: String,
      confidence: Number
    },
    toxicity: {
      score: { type: Number, min: 0, max: 1 },
      categories: [{
        category: String,
        score: Number
      }]
    }
  },
  context: {
    previousMessages: [mongoose.Schema.Types.ObjectId],
    knowledgeBaseUsed: [{
      documentId: mongoose.Schema.Types.ObjectId,
      relevanceScore: Number,
      chunks: [String]
    }],
    toolsUsed: [{
      toolName: String,
      parameters: mongoose.Schema.Types.Mixed,
      result: mongoose.Schema.Types.Mixed,
      executionTime: Number
    }],
    webSearchUsed: [{
      query: String,
      results: [mongoose.Schema.Types.Mixed],
      timestamp: Date
    }]
  },
  feedback: {
    rating: {
      type: String,
      enum: ['thumbs_up', 'thumbs_down', 'helpful', 'not_helpful']
    },
    comment: String,
    categories: [String],
    timestamp: Date,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  moderation: {
    flagged: { type: Boolean, default: false },
    flags: [{
      type: String,
      confidence: Number,
      reason: String
    }],
    reviewed: { type: Boolean, default: false },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    approved: { type: Boolean, default: true }
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    sessionId: String,
    messageId: String, // External message ID for channels
    threadId: String,
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    edited: {
      isEdited: { type: Boolean, default: false },
      editHistory: [{
        content: String,
        editedAt: Date,
        editedBy: mongoose.Schema.Types.ObjectId
      }]
    },
    delivery: {
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
        default: 'sent'
      },
      attempts: { type: Number, default: 1 },
      lastAttempt: Date,
      deliveredAt: Date,
      readAt: Date
    }
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ 'sender.type': 1 });
messageSchema.index({ 'content.type': 1 });
messageSchema.index({ 'moderation.flagged': 1 });
messageSchema.index({ 'feedback.rating': 1 });
messageSchema.index({ createdAt: -1 });

// Virtual for response time (only for bot messages)
messageSchema.virtual('responseTime').get(function() {
  if (this.sender?.type !== 'bot' || !this.processing.latency) return null;
  return this.processing.latency.total;
});

// Virtual for cost per token
messageSchema.virtual('costPerToken').get(function() {
  if (this.processing.tokens.total === 0) return 0;
  return this.processing.cost.totalCost / this.processing.tokens.total;
});

// Calculate total tokens
messageSchema.pre('save', function(next) {
  if (this.processing.tokens.input && this.processing.tokens.output) {
    this.processing.tokens.total = this.processing.tokens.input + this.processing.tokens.output;
  }
  
  if (this.processing.cost.inputCost && this.processing.cost.outputCost) {
    this.processing.cost.totalCost = this.processing.cost.inputCost + this.processing.cost.outputCost;
  }
  
  next();
});

// Add feedback
messageSchema.methods.addFeedback = function(rating, comment, categories, userId) {
  this.feedback = {
    rating,
    comment,
    categories: categories || [],
    timestamp: new Date(),
    userId
  };
  return this.save();
};

// Flag for moderation
messageSchema.methods.flagForModeration = function(flags, reason) {
  this.moderation.flagged = true;
  this.moderation.flags = flags.map(flag => ({
    type: flag.type,
    confidence: flag.confidence,
    reason: reason || flag.reason
  }));
  return this.save();
};

// Approve after moderation
messageSchema.methods.approveMessage = function(reviewerId) {
  this.moderation.reviewed = true;
  this.moderation.reviewedBy = reviewerId;
  this.moderation.reviewedAt = new Date();
  this.moderation.approved = true;
  this.moderation.flagged = false;
  return this.save();
};

// Soft delete
messageSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.isVisible = false;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// Edit message
messageSchema.methods.editMessage = function(newContent, editedBy) {
  // Save to edit history
  this.metadata.edited.editHistory.push({
    content: this.content.text,
    editedAt: new Date(),
    editedBy
  });
  
  // Update content
  this.content.text = newContent;
  this.metadata.edited.isEdited = true;
  
  return this.save();
};

// Update delivery status
messageSchema.methods.updateDeliveryStatus = function(status, timestamp) {
  this.metadata.delivery.status = status;
  
  switch (status) {
    case 'delivered':
      this.metadata.delivery.deliveredAt = timestamp || new Date();
      break;
    case 'read':
      this.metadata.delivery.readAt = timestamp || new Date();
      break;
    case 'failed':
      this.metadata.delivery.attempts += 1;
      this.metadata.delivery.lastAttempt = timestamp || new Date();
      break;
  }
  
  return this.save();
};

// Get message for API response (remove sensitive data)
messageSchema.methods.toAPIResponse = function() {
  const message = this.toObject();
  
  // Remove sensitive information
  delete message.metadata.ipAddress;
  delete message.moderation;
  
  // Remove deleted messages content
  if (message.isDeleted) {
    message.content.text = '[Message deleted]';
    delete message.content.attachments;
  }
  
  return message;
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
