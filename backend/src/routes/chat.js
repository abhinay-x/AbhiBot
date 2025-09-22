import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Bot from '../models/Bot.js';

const router = express.Router();

// Get user conversations
router.get('/conversations', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['active', 'archived', 'ended'])
], catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (page - 1) * limit;

  const filter = { user: req.userId };
  if (status) filter.status = status;

  const conversations = await Conversation.find(filter)
    .populate('bot', 'name avatar type')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Attach message counts per conversation (last 7 days optional future optimization)
  const countsMap = new Map();
  await Promise.all(conversations.map(async (c) => {
    const count = await Message.countDocuments({ conversation: c._id });
    countsMap.set(c._id.toString(), count);
  }));

// Analytics for the authenticated user
router.get('/analytics', authenticateToken, [
  query('range').optional().isInt({ min: 1, max: 365 })
], catchAsync(async (req, res) => {
  const range = parseInt(req.query.range || '30', 10); // days
  const since = new Date();
  since.setDate(since.getDate() - range);

  // Get this user's conversations and bot mapping
  const conversations = await Conversation.find({ user: req.userId }).populate('bot', 'name');
  const convIds = conversations.map(c => c._id);
  const botNameByConv = new Map(conversations.map(c => [c._id.toString(), c.bot?.name || 'Unknown Bot']));

  // Conversations per day (createdAt)
  const convPerDay = await Conversation.aggregate([
    { $match: { user: req.userId, createdAt: { $gte: since } } },
    { $group: { 
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
    } },
    { $sort: { _id: 1 } }
  ]);

  // Messages per day within user's conversations
  const msgPerDay = await Message.aggregate([
    { $match: { conversation: { $in: convIds }, createdAt: { $gte: since } } },
    { $group: { 
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
    } },
    { $sort: { _id: 1 } }
  ]);

  // Bot usage based on conversations count by bot
  const botUsageMap = new Map();
  for (const c of conversations) {
    const key = c.bot?.name || 'Unknown Bot';
    botUsageMap.set(key, (botUsageMap.get(key) || 0) + 1);
  }
  const botUsage = Array.from(botUsageMap.entries()).map(([name, value]) => ({ name, value }));

  // Average bot response time per day (from message.analytics.responseTime on bot messages)
  const botMsgs = await Message.aggregate([
    { $match: { conversation: { $in: convIds }, createdAt: { $gte: since }, 'sender.type': 'bot' } },
    { $project: { createdAt: 1, responseTime: '$analytics.responseTime' } },
    { $match: { responseTime: { $gt: 0 } } },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        avgResponseTime: { $avg: '$responseTime' },
        count: { $sum: 1 }
    } },
    { $sort: { _id: 1 } }
  ]);

  // Recent activity: last 15 messages
  const recent = await Message.find({ conversation: { $in: convIds } })
    .sort({ createdAt: -1 })
    .limit(15)
    .lean();
  const recentActivity = recent.map(m => ({
    id: m._id,
    user: m.sender?.type === 'user' ? 'You' : (botNameByConv.get(m.conversation.toString()) || 'Bot'),
    action: m.sender?.type === 'user' ? `sent: ${String(m.content?.text || '').slice(0, 60)}` : `bot replied (${(m.analytics?.responseTime || 0)}ms)`,
    time: m.createdAt,
    status: m.sender?.type === 'user' ? 'active' : 'performance'
  }));

  // Totals
  const totalChats = conversations.length;
  const allBotTimes = await Message.find({ conversation: { $in: convIds }, 'sender.type': 'bot', 'analytics.responseTime': { $gt: 0 } })
    .select('analytics.responseTime')
    .lean();
  const avgResponseTime = allBotTimes.length
    ? Math.round((allBotTimes.reduce((a, m) => a + (m.analytics?.responseTime || 0), 0) / allBotTimes.length) / 10) / 100
    : 0;

  res.json({
    rangeDays: range,
    totals: { totalChats, avgResponseTime },
    byDay: {
      conversations: convPerDay.map(d => ({ date: d._id, count: d.count })),
      messages: msgPerDay.map(d => ({ date: d._id, count: d.count })),
      responseTime: botMsgs.map(d => ({ date: d._id, avgResponseTime: Math.round(d.avgResponseTime) }))
    },
    botUsage,
    recentActivity
  });
}));

  const total = await Conversation.countDocuments(filter);

  res.json({
    conversations: conversations.map(c => ({
      ...c.toObject(),
      messageCount: countsMap.get(c._id.toString()) || 0
    })),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Create new conversation
router.post('/conversations', authenticateToken, [
  body('botId').isMongoId().withMessage('Valid bot ID required'),
  body('title').optional().trim().isLength({ max: 100 }),
  body('channel').optional().isIn(['web', 'mobile', 'api'])
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { botId, title, channel = 'web' } = req.body;

  const bot = await Bot.findById(botId);
  if (!bot || !bot.isActive) {
    throw new AppError('Bot not found or inactive', 404);
  }

  const conversation = new Conversation({
    user: req.userId,
    bot: botId,
    title: title || `Chat with ${bot.name}`,
    channel,
    language: 'en'
  });

  await conversation.save();
  await conversation.populate('bot', 'name avatar type');

  res.status(201).json({ conversation });
}));

// Rename a conversation
router.patch('/conversations/:id', authenticateToken, [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  const conv = await Conversation.findOne({ _id: req.params.id, user: req.userId });
  if (!conv) throw new AppError('Conversation not found', 404);
  conv.title = req.body.title;
  await conv.save();
  res.json({ conversation: conv });
}));

// Delete a conversation
router.delete('/conversations/:id', authenticateToken, catchAsync(async (req, res) => {
  const conv = await Conversation.findOne({ _id: req.params.id, user: req.userId });
  if (!conv) throw new AppError('Conversation not found', 404);
  await Message.deleteMany({ conversation: conv._id });
  await Conversation.deleteOne({ _id: conv._id });
  res.json({ message: 'Conversation deleted' });
}));

// Get conversation messages
router.get('/conversations/:id/messages', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], catchAsync(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;

  const conversation = await Conversation.findOne({
    _id: req.params.id,
    user: req.userId
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  const messages = await Message.find({ conversation: req.params.id })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({ messages });
}));

// Send message
router.post('/conversations/:id/messages', authenticateToken, [
  body('content').trim().isLength({ min: 1, max: 4000 }).withMessage('Message content required'),
  body('type').optional().isIn(['text', 'voice', 'image'])
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { content, type = 'text' } = req.body;

  const conversation = await Conversation.findOne({
    _id: req.params.id,
    user: req.userId
  }).populate('bot');

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  const message = new Message({
    conversation: req.params.id,
    sender: { type: 'user', userId: req.userId },
    content: { text: content, type },
    status: 'sent'
  });

  await message.save();
  res.status(201).json({ message });
}));

export default router;
