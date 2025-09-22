import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import Bot from '../models/Bot.js';
import huggingFaceService from '../services/huggingface.js';

const router = express.Router();

// Build in-memory specialized templates so we don't need to HTTP fetch our own API
const buildTemplates = () => ({
  customer_support: {
    name: "Customer Support Assistant",
    type: "customer_support",
    description: "Helpful customer service bot with escalation capabilities",
    model: { name: "mistral-7b", version: "latest" },
    personality: {
      systemPrompt: `You are a helpful customer support assistant. You should:
- Be polite, empathetic, and professional
- Ask clarifying questions to understand issues
- Provide step-by-step solutions
- Escalate to human agents when needed
- Follow company policies and guidelines
- Maintain a positive, solution-focused attitude`,
      temperature: 0.3,
      topP: 0.8,
      traits: ["helpful", "empathetic", "professional", "patient"]
    },
    capabilities: {
      canEscalate: true,
      canAccessKnowledgeBase: true,
      canHandleComplaints: true,
      maxConversationLength: 50
    },
    tools: ["knowledge_search", "escalation", "ticket_creation"],
    safetySettings: {
      contentFilter: true,
      toxicityThreshold: 0.3,
      escalationTriggers: ["angry", "frustrated", "complaint"]
    }
  },
  educational: {
    name: "Educational Tutor",
    type: "educational",
    description: "Patient tutor that explains concepts clearly with examples",
    model: { name: "llama2-13b", version: "latest" },
    personality: {
      systemPrompt: `You are an educational tutor. You should:
- Break down complex concepts into simple steps
- Use analogies and examples to explain ideas
- Encourage questions and curiosity
- Adapt explanations to the student's level
- Provide practice problems when appropriate
- Be patient and supportive`,
      temperature: 0.4,
      topP: 0.9,
      traits: ["patient", "encouraging", "clear", "adaptive"]
    },
    capabilities: {
      canGenerateQuizzes: true,
      canProvideExamples: true,
      canAdaptDifficulty: true,
      maxConversationLength: 100
    },
    tools: ["quiz_generator", "example_finder", "progress_tracker"]
  },
  creative: {
    name: "Creative Writing Assistant",
    type: "creative",
    description: "Imaginative assistant for creative writing and brainstorming",
    model: { name: "zephyr-7b", version: "latest" },
    personality: {
      systemPrompt: `You are a creative writing assistant. You should:
- Inspire creativity and imagination
- Help brainstorm ideas and plot points
- Provide writing prompts and exercises
- Give constructive feedback on writing
- Suggest improvements for style and flow
- Encourage experimentation with different genres`,
      temperature: 0.8,
      topP: 0.95,
      traits: ["creative", "inspiring", "imaginative", "supportive"]
    },
    capabilities: {
      canGeneratePrompts: true,
      canAnalyzeWriting: true,
      canSuggestImprovements: true,
      maxConversationLength: 75
    },
    tools: ["prompt_generator", "style_analyzer", "character_builder"]
  },
  code_assistant: {
    name: "Code Assistant",
    type: "code_assistant",
    description: "Expert programming assistant for code review and debugging",
    model: { name: "codellama", version: "latest" },
    personality: {
      systemPrompt: `You are a code assistant. You should:
- Help debug and optimize code
- Explain programming concepts clearly
- Suggest best practices and patterns
- Review code for potential issues
- Provide working code examples
- Support multiple programming languages`,
      temperature: 0.2,
      topP: 0.7,
      traits: ["precise", "analytical", "helpful", "thorough"]
    },
    capabilities: {
      canExecuteCode: false,
      canReviewCode: true,
      canSuggestOptimizations: true,
      maxConversationLength: 60
    },
    tools: ["syntax_checker", "code_formatter", "documentation_generator"]
  },
  health: {
    name: "Health Information Assistant",
    type: "health",
    description: "Provides general health information with appropriate disclaimers",
    model: { name: "mistral-7b", version: "latest" },
    personality: {
      systemPrompt: `You are a health information assistant. You should:
- Provide general health information only
- Always include medical disclaimers
- Encourage consulting healthcare professionals
- Never diagnose or prescribe treatments
- Be empathetic and supportive
- Prioritize safety and accuracy`,
      temperature: 0.3,
      topP: 0.8,
      traits: ["careful", "empathetic", "informative", "responsible"]
    },
    capabilities: {
      requiresDisclaimers: true,
      canProvideGeneralInfo: true,
      cannotDiagnose: true,
      maxConversationLength: 40
    },
    tools: ["symptom_checker", "health_resources", "emergency_contacts"],
    safetySettings: {
      contentFilter: true,
      medicalDisclaimers: true,
      emergencyDetection: true
    }
  },
  financial: {
    name: "Financial Advisor Assistant",
    type: "financial",
    description: "Provides general financial guidance with appropriate disclaimers",
    model: { name: "llama2-13b", version: "latest" },
    personality: {
      systemPrompt: `You are a financial advisor assistant. You should:
- Provide general financial education
- Include investment disclaimers
- Encourage consulting financial professionals
- Focus on financial literacy and planning
- Be objective and data-driven
- Emphasize risk management`,
      temperature: 0.3,
      topP: 0.8,
      traits: ["objective", "educational", "cautious", "thorough"]
    },
    capabilities: {
      requiresDisclaimers: true,
      canProvideEducation: true,
      cannotGiveAdvice: true,
      maxConversationLength: 50
    },
    tools: ["calculator", "market_data", "educational_resources"],
    safetySettings: {
      contentFilter: true,
      financialDisclaimers: true,
      riskWarnings: true
    }
  }
});

// Get available bots
router.get('/', authenticateToken, [
  query('type').optional().isIn(['customer_support', 'educational', 'creative', 'code_assistant', 'health', 'financial']),
  query('category').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], catchAsync(async (req, res) => {
  const { type, category, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const filter = { isActive: true, isPublic: true };
  if (type) filter.type = type;
  if (category) filter.category = category;

  const bots = await Bot.find(filter)
    .select('-systemPrompts -internalNotes')
    .sort({ rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Bot.countDocuments(filter);

  res.json({
    bots,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get bot details
router.get('/:id', authenticateToken, catchAsync(async (req, res) => {
  const bot = await Bot.findOne({
    _id: req.params.id,
    $or: [
      { isPublic: true },
      { owner: req.userId },
      { 'collaborators.user': req.userId }
    ]
  }).populate('owner', 'firstName lastName email');

  if (!bot) {
    throw new AppError('Bot not found', 404);
  }

  res.json({ bot });
}));

// Create new bot (admin/developer only)
router.post('/', authenticateToken, requireRole(['admin', 'developer']), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Bot name required'),
  body('type').isIn(['customer_support', 'educational', 'creative', 'code_assistant', 'health', 'financial']),
  body('description').trim().isLength({ min: 10, max: 500 }),
  body('model.name').isIn(['llama2-7b', 'llama2-13b', 'mistral-7b', 'codellama', 'zephyr-7b']),
  body('personality.systemPrompt').trim().isLength({ min: 10, max: 2000 })
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const botData = {
    ...req.body,
    owner: req.userId,
    createdBy: req.userId
  };

  const bot = new Bot(botData);
  await bot.save();

  res.status(201).json({ bot });
}));

// Update bot
router.put('/:id', authenticateToken, requireRole(['admin', 'developer']), catchAsync(async (req, res) => {
  const bot = await Bot.findOne({
    _id: req.params.id,
    $or: [
      { owner: req.userId },
      { 'collaborators.user': req.userId, 'collaborators.role': 'editor' }
    ]
  });

  if (!bot) {
    throw new AppError('Bot not found or access denied', 404);
  }

  const allowedTopLevel = [
    'name', 'description', 'personality', 'capabilities', 
    'tools', 'safetySettings', 'isPublic', 'category', 'tags'
  ];

  // Apply allowed top-level fields
  for (const key of Object.keys(req.body)) {
    if (allowedTopLevel.includes(key)) {
      bot[key] = req.body[key];
    }
  }

  // Allow updating model configuration explicitly
  if (req.body.model && typeof req.body.model === 'object') {
    const { provider, modelId, parameters } = req.body.model;
    if (provider) bot.model.provider = provider; // e.g., 'deepseek'
    if (modelId) bot.model.modelId = modelId;    // e.g., 'deepseek-chat'
    if (parameters && typeof parameters === 'object') {
      bot.model.parameters = { ...bot.model.parameters, ...parameters };
    }
  }

  await bot.save();
  res.json({ bot });
}));

// Get specialized bot templates
router.get('/templates/specialized', authenticateToken, catchAsync(async (req, res) => {
  const templates = buildTemplates();
  res.json({ templates });
}));

// Create bot from template (available to any authenticated user)
router.post('/create-from-template', authenticateToken, [
  body('templateType').isIn(['customer_support', 'educational', 'creative', 'code_assistant', 'health', 'financial']),
  body('customizations').optional().isObject()
], catchAsync(async (req, res) => {
  const { templateType, customizations = {} } = req.body;

  // Use in-memory templates to avoid auth issues on server-side fetch
  const templates = buildTemplates();
  const template = templates[templateType];
  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Map template to Bot schema
  const typeMap = {
    customer_support: 'customer-support',
    educational: 'educational',
    creative: 'creative-writing',
    code_assistant: 'code-assistant',
    health: 'health-wellness',
    financial: 'financial-advisor'
  };

  const modelKey = template.model?.name || 'mistral-7b';
  const modelInfo = huggingFaceService.getModelInfo(modelKey) || { id: 'mistralai/Mistral-7B-Instruct-v0.1' };

  const parameters = {
    temperature: template.personality?.temperature ?? 0.7,
    maxTokens: template.capabilities?.maxConversationLength ? Math.min(1000, template.capabilities.maxConversationLength * 50) : 1000,
    topP: template.personality?.topP ?? 0.9,
    topK: 50,
    repetitionPenalty: 1.0,
    stopSequences: []
  };

  const capabilities = {
    textGeneration: true,
    codeGeneration: templateType === 'code_assistant',
    imageAnalysis: false,
    documentAnalysis: false,
    webSearch: false,
    knowledgeBase: !!template.capabilities?.canAccessKnowledgeBase,
    voiceInteraction: false,
    multiLanguage: true
  };

  const botData = {
    name: customizations.name || template.name,
    description: customizations.description || template.description,
    type: typeMap[template.type] || 'general',
    systemPrompt: template.personality?.systemPrompt || customizations.systemPrompt || template.description,
    model: {
      provider: 'huggingface',
      modelId: modelInfo.id,
      parameters
    },
    capabilities,
    tools: template.tools?.map(t => ({ name: t, description: '', endpoint: '', parameters: {} })) || [],
    personality: {
      tone: 'friendly',
      style: 'conversational',
      traits: template.personality?.traits || []
    },
    safety: {
      contentFilter: !!template.safetySettings?.contentFilter,
      toxicityThreshold: template.safetySettings?.toxicityThreshold ?? 0.8,
      allowedTopics: [],
      blockedTopics: [],
      requireModeration: false
    },
    owner: req.userId,
    isPublic: false,
    category: customizations.category || template.type,
    tags: template.traits || []
  };

  const bot = new Bot(botData);
  await bot.save();

  res.status(201).json({ bot });
}));

// Get bot analytics
router.get('/:id/analytics', authenticateToken, requireRole(['admin', 'developer']), catchAsync(async (req, res) => {
  const bot = await Bot.findOne({
    _id: req.params.id,
    $or: [
      { owner: req.userId },
      { 'collaborators.user': req.userId }
    ]
  });

  if (!bot) {
    throw new AppError('Bot not found or access denied', 404);
  }

  const analytics = {
    usage: bot.usage,
    performance: {
      averageRating: bot.rating,
      totalRatings: bot.ratingCount,
      responseTime: bot.analytics.averageResponseTime,
      successRate: bot.analytics.successRate
    },
    conversations: {
      total: bot.usage.totalConversations,
      active: bot.usage.activeConversations,
      completed: bot.usage.completedConversations
    }
  };

  res.json({ analytics });
}));

// Rate bot
router.post('/:id/rate', authenticateToken, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().trim().isLength({ max: 500 })
], catchAsync(async (req, res) => {
  const { rating, feedback } = req.body;

  const bot = await Bot.findById(req.params.id);
  if (!bot) {
    throw new AppError('Bot not found', 404);
  }

  await bot.updateRating(rating, feedback);

  res.json({ message: 'Rating submitted successfully' });
}));

// Delete bot (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), catchAsync(async (req, res) => {
  const bot = await Bot.findById(req.params.id);
  if (!bot) {
    throw new AppError('Bot not found', 404);
  }

  bot.isActive = false;
  await bot.save();

  res.json({ message: 'Bot deleted successfully' });
}));

export default router;
