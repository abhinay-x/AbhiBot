# AI-Powered Chatbot Platform

A comprehensive AI-powered chatbot platform built with React frontend and Node.js backend, featuring multiple AI models, real-time chat, specialized chatbots, and advanced features.

## 🚀 Features

### Core Features
- **Multi-Model AI Integration** - Powered by Hugging Face models (Llama 2, Mistral, CodeLlama, Zephyr)
- **Real-Time Chat** - Socket.IO integration with streaming responses
- **Specialized Chatbots** - Customer Support, Educational, Creative, Code Assistant, Health, Financial
- **Authentication System** - JWT-based with role-based access control
- **Conversation Memory** - Context-aware conversations with memory management
- **Modern UI/UX** - Beautiful, responsive interface with dark mode support

### Advanced Features
- **Voice Integration** - Speech-to-Text and Text-to-Speech capabilities
- **Emotion Detection** - Sentiment analysis and emotion recognition
- **Analytics Dashboard** - Conversation insights and usage statistics
- **Knowledge Base** - Document upload and RAG (Retrieval-Augmented Generation)
- **Multi-Channel Support** - Web, WhatsApp, Telegram, Slack integration
- **A/B Testing** - Framework for testing different AI models
- **Compliance Features** - GDPR/HIPAA compliance tools
- **Rate Limiting** - Cost control and usage management

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Socket.IO Client** - Real-time communication
- **Zustand** - State management
- **React Hook Form** - Form handling and validation
- **React Hot Toast** - Toast notifications
- **Recharts** - Data visualization
- **React Markdown** - Markdown rendering
- **Prism.js** - Code syntax highlighting

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **Hugging Face Inference** - AI model integration
- **bcryptjs** - Password hashing
- **Winston** - Logging
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting middleware

## 📁 Project Structure

```
ai-chatbot/
├── backend/
│   ├── src/
│   │   ├── handlers/
│   │   │   └── socketHandlers.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Bot.js
│   │   │   ├── Conversation.js
│   │   │   ├── Message.js
│   │   │   └── KnowledgeBase.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── chat.js
│   │   │   └── bots.js
│   │   ├── services/
│   │   │   └── huggingface.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── common/
│   │   │   └── dashboard/
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   └── chatService.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Hugging Face API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-chatbot
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-chatbot

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Hugging Face API
HUGGINGFACE_API_KEY=your-huggingface-api-key
```

## 🤖 Available AI Models

### Text Generation Models
- **Llama 2 7B/13B** - General-purpose conversational AI
- **Mistral 7B** - High-performance instruction-following model
- **CodeLlama** - Specialized for code generation and assistance
- **Zephyr 7B** - Fine-tuned for helpful, harmless, and honest responses

### Specialized Models
- **Sentiment Analysis** - Twitter RoBERTa-based sentiment detection
- **Emotion Detection** - Multi-emotion classification
- **Toxicity Detection** - Content moderation and safety

## 🎯 Specialized Chatbots

### 1. Customer Support Assistant
- Empathetic and professional responses
- Escalation capabilities
- Knowledge base integration
- Complaint handling

### 2. Educational Tutor
- Adaptive explanations
- Quiz generation
- Progress tracking
- Multi-level content delivery

### 3. Creative Writing Assistant
- Story brainstorming
- Writing prompts
- Style analysis
- Character development

### 4. Code Assistant
- Multi-language support
- Code review and optimization
- Debugging assistance
- Best practices guidance

### 5. Health Information Assistant
- General health information
- Medical disclaimers
- Emergency detection
- Resource recommendations

### 6. Financial Advisor Assistant
- Financial education
- Investment disclaimers
- Risk management
- Market data integration

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/refresh` - Refresh token

### Chat
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversations` - Create new conversation
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/conversations/:id/messages` - Send message

### Bots
- `GET /api/bots` - Get available bots
- `GET /api/bots/:id` - Get bot details
- `GET /api/bots/templates/specialized` - Get bot templates
- `POST /api/bots/create-from-template` - Create bot from template

## 🔌 Socket.IO Events

### Client to Server
- `authenticate` - Authenticate socket connection
- `join_conversation` - Join conversation room
- `send_message` - Send chat message
- `typing_start/stop` - Typing indicators
- `voice_message` - Send voice message
- `regenerate_response` - Regenerate AI response

### Server to Client
- `message_received` - New message received
- `message_started` - AI response started
- `message_chunk` - Streaming response chunk
- `message_completed` - AI response completed
- `user_typing_start/stop` - User typing indicators

## 🎨 UI Components

### Authentication
- **LoginForm** - User login with validation
- **RegisterForm** - User registration with password strength
- **AuthPage** - Combined auth interface with animations

### Chat Interface
- **ChatInterface** - Main chat component with real-time messaging
- **MessageBubble** - Individual message display with actions
- **BotSelector** - Bot selection dropdown
- **TypingIndicator** - Animated typing indicator

### Dashboard
- **Dashboard** - Main application interface
- **ConversationList** - List of user conversations
- **BotGallery** - Available bots showcase
- **UserProfile** - User profile management

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- Role-based access control

## 📊 Database Schema

### User Model
- Authentication and profile information
- Usage statistics and limits
- Subscription and preferences
- Security settings

### Bot Model
- AI model configuration
- Personality and capabilities
- Usage analytics and ratings
- Safety and compliance settings

### Conversation Model
- User and bot association
- Context and memory management
- Analytics and sentiment tracking
- Multi-channel support

### Message Model
- Content and metadata
- Processing statistics
- Feedback and moderation
- Delivery status

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run start
```

### Docker Deployment
```dockerfile
# Dockerfile example for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints
- Test with the provided examples

## 🔮 Roadmap

### Phase 1 (Completed)
- ✅ Basic chat functionality
- ✅ Authentication system
- ✅ Multiple AI models
- ✅ Real-time messaging
- ✅ Specialized chatbots

### Phase 2 (In Progress)
- 🔄 Voice integration
- 🔄 Analytics dashboard
- 🔄 Knowledge base system
- 🔄 Admin panel

### Phase 3 (Planned)
- 📋 Multi-channel support
- 📋 A/B testing framework
- 📋 Advanced analytics
- 📋 Compliance features
- 📋 Mobile applications

---

Built with ❤️ using modern web technologies and AI models.
