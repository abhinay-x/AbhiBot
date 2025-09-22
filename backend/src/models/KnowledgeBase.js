import mongoose from 'mongoose';

const knowledgeBaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
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
  documents: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
    processedAt: Date,
    status: {
      type: String,
      enum: ['uploading', 'processing', 'completed', 'failed'],
      default: 'uploading'
    },
    metadata: {
      pageCount: Number,
      wordCount: Number,
      language: String,
      extractedText: String
    },
    chunks: [{
      text: String,
      embedding: [Number],
      metadata: mongoose.Schema.Types.Mixed,
      startIndex: Number,
      endIndex: Number
    }]
  }],
  settings: {
    chunkSize: { type: Number, default: 1000 },
    chunkOverlap: { type: Number, default: 200 },
    embeddingModel: { type: String, default: 'sentence-transformers/all-MiniLM-L6-v2' },
    language: { type: String, default: 'en' },
    autoUpdate: { type: Boolean, default: true },
    accessLevel: {
      type: String,
      enum: ['private', 'organization', 'public'],
      default: 'private'
    }
  },
  vectorStore: {
    provider: {
      type: String,
      enum: ['chromadb', 'pinecone', 'weaviate', 'mongodb'],
      default: 'chromadb'
    },
    collectionId: String,
    indexName: String,
    dimensions: { type: Number, default: 384 }
  },
  usage: {
    totalQueries: { type: Number, default: 0 },
    totalDocuments: { type: Number, default: 0 },
    totalChunks: { type: Number, default: 0 },
    averageRelevanceScore: { type: Number, default: 0 },
    lastQueried: Date
  },
  analytics: {
    popularQueries: [{
      query: String,
      count: Number,
      averageRelevance: Number,
      lastQueried: Date
    }],
    documentUsage: [{
      documentId: mongoose.Schema.Types.ObjectId,
      queryCount: Number,
      averageRelevance: Number
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  category: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
knowledgeBaseSchema.index({ owner: 1 });
knowledgeBaseSchema.index({ organization: 1 });
knowledgeBaseSchema.index({ 'settings.accessLevel': 1 });
knowledgeBaseSchema.index({ tags: 1 });
knowledgeBaseSchema.index({ isActive: 1 });

// Virtual for total size
knowledgeBaseSchema.virtual('totalSize').get(function() {
  return this.documents.reduce((total, doc) => total + (doc.size || 0), 0);
});

// Virtual for processing status
knowledgeBaseSchema.virtual('processingStatus').get(function() {
  const statuses = this.documents.map(doc => doc.status);
  if (statuses.every(status => status === 'completed')) return 'completed';
  if (statuses.some(status => status === 'processing')) return 'processing';
  if (statuses.some(status => status === 'failed')) return 'partial';
  return 'pending';
});

// Add document
knowledgeBaseSchema.methods.addDocument = function(documentData) {
  this.documents.push({
    ...documentData,
    uploadedAt: new Date(),
    status: 'uploading'
  });
  this.usage.totalDocuments = this.documents.length;
  return this.save();
};

// Update document status
knowledgeBaseSchema.methods.updateDocumentStatus = function(documentId, status, metadata = {}) {
  const document = this.documents.id(documentId);
  if (!document) throw new Error('Document not found');
  
  document.status = status;
  if (status === 'completed') {
    document.processedAt = new Date();
    document.metadata = { ...document.metadata, ...metadata };
  }
  
  return this.save();
};

// Add chunks to document
knowledgeBaseSchema.methods.addChunksToDocument = function(documentId, chunks) {
  const document = this.documents.id(documentId);
  if (!document) throw new Error('Document not found');
  
  document.chunks = chunks;
  document.status = 'completed';
  document.processedAt = new Date();
  
  // Update total chunks count
  this.usage.totalChunks = this.documents.reduce(
    (total, doc) => total + (doc.chunks?.length || 0), 0
  );
  
  return this.save();
};

// Search documents
knowledgeBaseSchema.methods.searchDocuments = async function(query, limit = 10, threshold = 0.7) {
  // This would integrate with vector database
  // For now, return a placeholder structure
  
  // Update analytics
  this.usage.totalQueries += 1;
  this.usage.lastQueried = new Date();
  
  // Update popular queries
  const existingQuery = this.analytics.popularQueries.find(
    q => q.query.toLowerCase() === query.toLowerCase()
  );
  
  if (existingQuery) {
    existingQuery.count += 1;
    existingQuery.lastQueried = new Date();
  } else {
    this.analytics.popularQueries.push({
      query,
      count: 1,
      lastQueried: new Date()
    });
  }
  
  // Keep only top 50 queries
  this.analytics.popularQueries.sort((a, b) => b.count - a.count);
  this.analytics.popularQueries = this.analytics.popularQueries.slice(0, 50);
  
  await this.save();
  
  // Return search results structure
  return {
    query,
    results: [],
    totalResults: 0,
    processingTime: 0
  };
};

// Get document by ID
knowledgeBaseSchema.methods.getDocument = function(documentId) {
  return this.documents.id(documentId);
};

// Remove document
knowledgeBaseSchema.methods.removeDocument = function(documentId) {
  const document = this.documents.id(documentId);
  if (!document) throw new Error('Document not found');
  
  document.remove();
  this.usage.totalDocuments = this.documents.length;
  this.usage.totalChunks = this.documents.reduce(
    (total, doc) => total + (doc.chunks?.length || 0), 0
  );
  
  return this.save();
};

// Update settings
knowledgeBaseSchema.methods.updateSettings = function(newSettings) {
  this.settings = { ...this.settings.toObject(), ...newSettings };
  return this.save();
};

// Get statistics
knowledgeBaseSchema.methods.getStatistics = function() {
  const completedDocs = this.documents.filter(doc => doc.status === 'completed');
  const totalWords = completedDocs.reduce(
    (total, doc) => total + (doc.metadata?.wordCount || 0), 0
  );
  
  return {
    totalDocuments: this.usage.totalDocuments,
    completedDocuments: completedDocs.length,
    totalChunks: this.usage.totalChunks,
    totalSize: this.totalSize,
    totalWords,
    totalQueries: this.usage.totalQueries,
    averageRelevanceScore: this.usage.averageRelevanceScore,
    processingStatus: this.processingStatus,
    lastQueried: this.usage.lastQueried,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const KnowledgeBase = mongoose.model('KnowledgeBase', knowledgeBaseSchema);

export default KnowledgeBase;
