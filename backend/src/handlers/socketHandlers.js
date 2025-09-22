import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Bot from '../models/Bot.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
// Removed Hugging Face dependency; using DeepSeek exclusively for generation
import axios from 'axios';

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.activeConnections = new Map();
    this.typingUsers = new Map();
    
    this.setupSocketHandlers();
  }

  // Build chat messages for providers that expect OpenAI-compatible format (e.g., DeepSeek)
  async buildChatMessages(conversation, userMessage, modelConfig) {
    const history = conversation.context?.messages?.slice(-10) || [];
    const messages = [];
    const systemPrompt = modelConfig?.systemPrompt || conversation.bot?.systemPrompt;
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    for (const msg of history) {
      const role = msg.role === 'user' ? 'user' : 'assistant';
      messages.push({ role, content: msg.content });
    }
    // Ensure the current user message is included at the end
    if (userMessage?.content?.text) {
      messages.push({ role: 'user', content: userMessage.content.text });
    }
    return messages;
  }

  // Stream from DeepSeek Chat Completions API (SSE) using axios stream
  async *deepseekStream(model, messages, temperature = 0.7) {
    const apiKey = (process.env.DEEPSEEK_API_KEY || '').trim();
    if (!apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    // Detect OpenRouter key (sk-or-...) and switch endpoint/model accordingly
    const isOpenRouter = apiKey.startsWith('sk-or-');
    const endpoint = isOpenRouter
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.deepseek.com/v1/chat/completions';
    const mappedModel = isOpenRouter && !model.includes('/') ? `deepseek/${model}` : model;

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    if (isOpenRouter) {
      // These headers are recommended by OpenRouter
      const referer = process.env.FRONTEND_URL || 'http://localhost:5173';
      headers['HTTP-Referer'] = referer;
      headers['Referer'] = referer;
      headers['Origin'] = referer;
      headers['X-Title'] = 'AI Chatbot';
    }

    const response = await axios.post(
      endpoint,
      { model: mappedModel, messages, temperature, stream: true },
      { headers, responseType: 'stream', timeout: 60000 }
    );

    let buffer = '';
    for await (const chunk of response.data) {
      buffer += chunk.toString();
      let idx;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const part = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 2);
        if (!part) continue;
        if (part === 'data: [DONE]') {
          yield { finished: true };
          return;
        }
        if (part.startsWith('data: ')) {
          try {
            const json = JSON.parse(part.slice(6));
            const delta = json?.choices?.[0]?.delta?.content || '';
            if (delta) yield { text: delta };
          } catch (_) { /* ignore malformed */ }
        }
      }
    }

    yield { finished: true };
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Handshake-based auto authentication (in addition to explicit 'authenticate' event)
      try {
        const hsToken = socket?.handshake?.auth?.token;
        if (hsToken) {
          this.authenticateSocket(socket, hsToken).catch((err) => {
            console.warn(`Socket handshake auth failed (${socket.id}):`, err?.message);
            // Don't disconnect immediately; client may try explicit authenticate event next
            socket.emit('auth_error', { message: 'Authentication failed' });
          });
        }
      } catch (e) {
        console.warn(`Socket handshake processing error (${socket.id}):`, e?.message);
      }

      // Authenticate socket connection
      socket.on('authenticate', async (data) => {
        try {
          await this.authenticateSocket(socket, data.token);
        } catch (error) {
          console.warn(`Explicit authenticate failed (${socket.id}):`, error?.message);
          socket.emit('auth_error', { message: 'Authentication failed' });
          // Keep connection open to allow retries
        }
      });

      // Join conversation room
      socket.on('join_conversation', async (data) => {
        try {
          await this.joinConversation(socket, data.conversationId);
        } catch (error) {
          socket.emit('error', { message: 'Failed to join conversation' });
        }
      });

      // Leave conversation room
      socket.on('leave_conversation', (data) => {
        this.leaveConversation(socket, data.conversationId);
      });

      // Send message
      socket.on('send_message', async (data) => {
        try {
          await this.handleMessage(socket, data);
        } catch (error) {
          socket.emit('error', { message: error?.message || 'Failed to send message' });
        }
      });

      // Typing indicators
      socket.on('typing_start', (data) => {
        this.handleTypingStart(socket, data.conversationId);
      });

      socket.on('typing_stop', (data) => {
        this.handleTypingStop(socket, data.conversationId);
      });

      // Voice message
      socket.on('voice_message', async (data) => {
        try {
          await this.handleVoiceMessage(socket, data);
        } catch (error) {
          socket.emit('error', { message: 'Failed to process voice message' });
        }
      });

      // Regenerate response
      socket.on('regenerate_response', async (data) => {
        try {
          await this.regenerateResponse(socket, data);
        } catch (error) {
          socket.emit('error', { message: 'Failed to regenerate response' });
        }
      });

      // Stop generation
      socket.on('stop_generation', (data) => {
        this.stopGeneration(socket, data.messageId);
      });

      // Disconnect handler
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  async authenticateSocket(socket, token) {
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    
    this.activeConnections.set(socket.id, {
      userId: user._id.toString(),
      socketId: socket.id,
      connectedAt: new Date()
    });

    socket.emit('authenticated', { 
      userId: user._id,
      message: 'Successfully authenticated' 
    });

    console.log(`User ${user.email} authenticated on socket ${socket.id}`);
  }

  async joinConversation(socket, conversationId) {
    if (!socket.userId) {
      throw new Error('Socket not authenticated');
    }

    // Verify user has access to conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [
        { user: socket.userId },
        { 'participants.user': socket.userId }
      ]
    }).populate('bot user');

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    socket.join(conversationId);
    socket.currentConversation = conversationId;

    // Send conversation details
    socket.emit('conversation_joined', {
      conversation: conversation.toJSON(),
      message: 'Joined conversation successfully'
    });

    // Notify other participants
    socket.to(conversationId).emit('user_joined', {
      userId: socket.userId,
      socketId: socket.id
    });

    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  }

  leaveConversation(socket, conversationId) {
    if (socket.currentConversation === conversationId) {
      socket.leave(conversationId);
      socket.currentConversation = null;

      // Notify other participants
      socket.to(conversationId).emit('user_left', {
        userId: socket.userId,
        socketId: socket.id
      });

      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    }
  }

  async handleMessage(socket, data) {
    const { conversationId, content, type = 'text', metadata = {} } = data;

    if (!socket.userId || !conversationId || !content) {
      throw new Error('Missing required fields');
    }

    // Get conversation and bot
    const conversation = await Conversation.findById(conversationId)
      .populate('bot user');
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Check user limits
    const user = await User.findById(socket.userId);
    if (!user || user.hasExceededLimits()) {
      socket.emit('limit_exceeded', {
        message: 'Message limit exceeded. Please upgrade your plan.'
      });
      return;
    }

    // Create user message
    const userMessage = new Message({
      conversation: conversationId,
      sender: {
        type: 'user',
        userId: socket.userId
      },
      content: {
        text: content,
        type
      },
      metadata,
      status: 'sent'
    });

    await userMessage.save();

    // Broadcast user message to conversation participants
    this.io.to(conversationId).emit('message_received', {
      message: userMessage.toJSON()
    });

    // Update conversation context
    await conversation.addToMemory({
      role: 'user',
      content,
      timestamp: new Date()
    });

    // Generate bot response
    await this.generateBotResponse(socket, conversation, userMessage);

    // Update user usage
    await user.updateUsage(1, this.estimateTokens(content));
  }

  async generateBotResponse(socket, conversation, userMessage) {
    const bot = conversation.bot;

    // Use Bot schema helper to get model config compatible with current schema
    const modelConfig = typeof bot.getModelConfig === 'function'
      ? bot.getModelConfig()
      : {
          provider: bot.model?.provider || 'huggingface',
          modelId: bot.model?.modelId,
          parameters: bot.model?.parameters || { temperature: 0.7, maxTokens: 1000, topP: 0.9 },
          systemPrompt: bot.systemPrompt
        };
    
    // Create bot message placeholder
    const botMessage = new Message({
      conversation: conversation._id,
      sender: {
        type: 'bot',
        botId: bot._id
      },
      content: {
        text: '',
        type: 'text'
      },
      model: {
        provider: modelConfig.provider || 'huggingface',
        modelId: modelConfig.modelId || 'unknown',
        version: 'latest',
        parameters: modelConfig.parameters || { temperature: 0.7, maxTokens: 1000, topP: 0.9 }
      },
      status: 'generating'
    });

    await botMessage.save();

    // Emit message started
    this.io.to(conversation._id.toString()).emit('message_started', {
      messageId: botMessage._id,
      message: botMessage.toJSON()
    });

    try {
      let fullResponse = '';

      const requestedModel = (modelConfig.modelId || '').toLowerCase();
      const deepseekModel = requestedModel.includes('deepseek')
        ? modelConfig.modelId
        : (process.env.DEEPSEEK_MODEL || 'deepseek-chat');

      console.log(`[AI] Using DeepSeek for generation (model: ${deepseekModel})`);
      // Build chat messages for DeepSeek
      const messages = await this.buildChatMessages(conversation, userMessage, modelConfig);

      // Stream from DeepSeek exclusively
      let dsStream;
      try {
        dsStream = this.deepseekStream(
          deepseekModel,
          messages,
          modelConfig.parameters?.temperature || 0.7
        );
      } catch (streamInitErr) {
        console.error('DeepSeek stream init error:', streamInitErr?.message || streamInitErr);
        throw streamInitErr;
      }

      for await (const chunk of dsStream) {
        if (chunk.text) {
          fullResponse += chunk.text;
          this.io.to(conversation._id.toString()).emit('message_chunk', {
            messageId: botMessage._id,
            chunk: chunk.text,
            fullText: fullResponse
          });
        }
        if (chunk.finished) break;
      }

      // Update message with final response
      botMessage.content.text = fullResponse;
      botMessage.status = 'sent';
      botMessage.processing = {
        completedAt: new Date(),
        tokensGenerated: this.estimateTokens(fullResponse)
      };

      await botMessage.save();

      // Simple local analytics placeholder (no external calls)
      botMessage.analytics = {
        sentiment: { label: 'neutral', score: 0, confidence: 0 },
        emotions: [],
        responseTime: Date.now() - botMessage.createdAt.getTime()
      };

      await botMessage.save();

      // Update conversation context
      await conversation.addToMemory({
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      });

      // Update conversation sentiment with neutral default
      await conversation.updateSentiment(0, botMessage._id);

      // Emit message completed
      this.io.to(conversation._id.toString()).emit('message_completed', {
        messageId: botMessage._id,
        message: botMessage.toJSON(),
        analytics: botMessage.analytics
      });

      // Update bot usage stats
      await bot.updateUsage(1, this.estimateTokens(fullResponse));

    } catch (error) {
      console.error('Error generating bot response (stream):', error?.message || error);

      // Attempt non-streaming fallback via DeepSeek
      try {
        const requestedModel = (conversation?.bot?.model?.modelId || '').toLowerCase();
        let deepseekModel = requestedModel.includes('deepseek')
          ? conversation.bot.model.modelId
          : (process.env.DEEPSEEK_MODEL || 'deepseek-chat');

        const apiKey = (process.env.DEEPSEEK_API_KEY || '').trim();
        if (!apiKey) throw new Error('DeepSeek API key not configured');

        const isOpenRouter = apiKey.startsWith('sk-or-');
        const endpoint = isOpenRouter
          ? 'https://openrouter.ai/api/v1/chat/completions'
          : 'https://api.deepseek.com/v1/chat/completions';
        if (isOpenRouter && !deepseekModel.includes('/')) {
          deepseekModel = `deepseek/${deepseekModel}`;
        }

        const messages = await this.buildChatMessages(conversation, userMessage, conversation.bot?.model || {});

        const headers = { Authorization: `Bearer ${apiKey}` };
        if (isOpenRouter) {
          const referer = process.env.FRONTEND_URL || 'http://localhost:5173';
          headers['HTTP-Referer'] = referer;
          headers['Referer'] = referer;
          headers['Origin'] = referer;
          headers['X-Title'] = 'AI Chatbot';
        }

        const resp = await axios.post(
          endpoint,
          { model: deepseekModel, messages, stream: false, temperature: conversation.bot?.model?.parameters?.temperature || 0.7 },
          { headers }
        );

        const content = resp?.data?.choices?.[0]?.message?.content || '';
        if (content) {
          botMessage.content.text = content;
          botMessage.status = 'sent';
          botMessage.processing = {
            completedAt: new Date(),
            tokensGenerated: this.estimateTokens(content)
          };

          // Minimal analytics
          botMessage.analytics = {
            sentiment: { label: 'neutral', score: 0, confidence: 0 },
            emotions: [],
            responseTime: Date.now() - botMessage.createdAt.getTime()
          };

          await botMessage.save();

          await conversation.addToMemory({ role: 'assistant', content, timestamp: new Date() });
          await conversation.updateSentiment(0, botMessage._id);

          this.io.to(conversation._id.toString()).emit('message_completed', {
            messageId: botMessage._id,
            message: botMessage.toJSON(),
            analytics: botMessage.analytics
          });

          await conversation.bot.updateUsage(1, this.estimateTokens(content));
          return;
        }
      } catch (fallbackErr) {
        console.error('DeepSeek non-stream fallback failed:', fallbackErr?.message || fallbackErr);
      }

      // If both streaming and non-streaming failed, mark as failed
      botMessage.status = 'failed';
      botMessage.error = { message: error.message, timestamp: new Date() };
      await botMessage.save();

      this.io.to(conversation._id.toString()).emit('message_failed', { messageId: botMessage._id, error: error.message });
    }
  }

  async buildConversationContext(conversation, modelConfig) {
    const messages = conversation.context?.messages?.slice(-10) || []; // Last 10 messages
    const bot = conversation.bot;

    let context = '';

    // Add system prompt (stored at root on Bot schema)
    if (modelConfig?.systemPrompt || bot.systemPrompt) {
      context += `System: ${modelConfig?.systemPrompt || bot.systemPrompt}\n\n`;
    }

    // Add conversation history
    messages.forEach(msg => {
      const role = msg.role === 'user' ? 'Human' : 'Assistant';
      context += `${role}: ${msg.content}\n`;
    });

    context += 'Assistant: ';

    return context;
  }

  handleTypingStart(socket, conversationId) {
    if (!socket.userId || !conversationId) return;

    const typingKey = `${conversationId}:${socket.userId}`;
    
    if (!this.typingUsers.has(typingKey)) {
      this.typingUsers.set(typingKey, {
        userId: socket.userId,
        conversationId,
        startedAt: new Date()
      });

      socket.to(conversationId).emit('user_typing_start', {
        userId: socket.userId
      });
    }
  }

  handleTypingStop(socket, conversationId) {
    if (!socket.userId || !conversationId) return;

    const typingKey = `${conversationId}:${socket.userId}`;
    
    if (this.typingUsers.has(typingKey)) {
      this.typingUsers.delete(typingKey);

      socket.to(conversationId).emit('user_typing_stop', {
        userId: socket.userId
      });
    }
  }

  async handleVoiceMessage(socket, data) {
    // Placeholder for voice message handling
    // This would integrate with speech-to-text services
    socket.emit('voice_processing', {
      message: 'Voice message processing not yet implemented'
    });
  }

  async regenerateResponse(socket, data) {
    const { messageId } = data;

    const message = await Message.findById(messageId)
      .populate({
        path: 'conversation',
        populate: { path: 'bot' }
      });

    if (!message || message.sender.type !== 'bot') {
      throw new Error('Message not found or not a bot message');
    }

    // Delete the old message
    await Message.findByIdAndDelete(messageId);

    // Find the previous user message
    const userMessage = await Message.findOne({
      conversation: message.conversation._id,
      createdAt: { $lt: message.createdAt },
      'sender.type': 'user'
    }).sort({ createdAt: -1 });

    if (userMessage) {
      // Generate new response
      await this.generateBotResponse(socket, message.conversation, userMessage);
    }
  }

  stopGeneration(socket, messageId) {
    // Placeholder for stopping generation
    // This would cancel ongoing generation processes
    socket.emit('generation_stopped', { messageId });
  }

  handleDisconnect(socket) {
    console.log(`Socket disconnected: ${socket.id}`);

    // Clean up active connection
    this.activeConnections.delete(socket.id);

    // Clean up typing indicators
    for (const [key, typing] of this.typingUsers.entries()) {
      if (key.includes(socket.userId)) {
        this.typingUsers.delete(key);
        socket.to(typing.conversationId).emit('user_typing_stop', {
          userId: socket.userId
        });
      }
    }

    // Notify conversation participants
    if (socket.currentConversation) {
      socket.to(socket.currentConversation).emit('user_disconnected', {
        userId: socket.userId,
        socketId: socket.id
      });
    }
  }

  estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  // Get active connections count
  getActiveConnectionsCount() {
    return this.activeConnections.size;
  }

  // Get typing users for a conversation
  getTypingUsers(conversationId) {
    const typing = [];
    for (const [key, value] of this.typingUsers.entries()) {
      if (value.conversationId === conversationId) {
        typing.push(value.userId);
      }
    }
    return typing;
  }

  // Broadcast to all authenticated users
  broadcastToAll(event, data) {
    for (const connection of this.activeConnections.values()) {
      this.io.to(connection.socketId).emit(event, data);
    }
  }

  // Broadcast to specific user
  broadcastToUser(userId, event, data) {
    for (const connection of this.activeConnections.values()) {
      if (connection.userId === userId) {
        this.io.to(connection.socketId).emit(event, data);
      }
    }
  }
}

export default SocketHandler;
