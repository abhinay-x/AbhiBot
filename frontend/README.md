# AI ChatBot Pro - Frontend

A comprehensive, modern AI chatbot frontend application built with React 19, Vite, and Tailwind CSS, featuring glassmorphism design and advanced AI interactions.

## 🚀 Features

### ✅ Complete Implementation

**🏗️ Project Architecture**
- React 19 + Vite + JavaScript setup with Tailwind CSS
- Framer Motion for smooth animations and micro-interactions
- Lucide React icons and Socket.IO client for real-time features
- Custom Tailwind design system with glassmorphism utilities
- Proper project structure with contexts, components, and pages

**🎨 Design System & Glassmorphism**
- Complete glassmorphism design system with backdrop blur effects
- Custom CSS variables for dark/light theme support
- Brand colors: Primary purple gradient (#8B5CF6 to #A855F7), accent blue (#06B6D4)
- Inter font family with proper typography scale
- Custom animations: fade-in, slide-up, blob, pulse-glow, shimmer effects
- Floating background blobs with smooth animations

**🔐 Authentication System**
- Beautiful split-screen authentication UI with glassmorphism effects
- LoginForm with email/password and visual feedback
- RegisterForm with password strength indicator and validation
- ThemeToggle component with smooth transitions
- Protected routes with loading states
- AuthContext with JWT token management and Axios integration

**💬 Chat Interface**
- Modern chat layout with collapsible sidebar and main chat area
- Header with bot selector, voice toggle, theme toggle, and user menu
- Sidebar with conversation history, search, and grouping by date
- ChatArea with welcome screen and message display
- MessageBubble with glassmorphism styling and interactive actions
- MessageInput with voice recording, attachments, and emoji support
- TypingIndicator with animated dots
- Real-time Socket.IO integration ready

**🤖 Bot Management**
- Complete bot management system with CRUD operations
- Bot configuration page with personality settings
- AI model selection and customization
- Performance analytics and statistics
- Bot usage tracking and optimization

**📊 Analytics Dashboard**
- Comprehensive analytics with charts and metrics
- Real-time activity feed
- User satisfaction tracking
- Bot performance monitoring
- Usage statistics and insights

**🔗 Integrations**
- Multiple platform integrations (WhatsApp, Slack, Telegram, etc.)
- API management and configuration
- External service connections
- Integration status monitoring

**👤 User Management**
- Complete profile management system
- User preferences and settings
- Billing and subscription management
- Usage statistics and history

## 🛠️ Tech Stack

- **Frontend**: React 19, JavaScript, Vite, Tailwind CSS, Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Real-time**: Socket.IO Client
- **HTTP**: Axios with interceptors
- **Styling**: Custom glassmorphism design system
- **State**: React Context API

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aichatbot/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   VITE_JWT_SECRET=your-jwt-secret-key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── chat/           # Chat-specific components
│   │   ├── ChatArea.jsx
│   │   ├── ChatHeader.jsx
│   │   ├── ChatSidebar.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── MessageInput.jsx
│   │   ├── TypingIndicator.jsx
│   │   ├── WelcomeScreen.jsx
│   │   └── BotSelector.jsx
│   ├── LoadingSpinner.jsx
│   └── ProtectedRoute.jsx
├── contexts/           # React Context providers
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── ChatContext.jsx
├── pages/              # Main application pages
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── ChatPage.jsx
│   ├── BotsPage.jsx
│   ├── BotConfigPage.jsx
│   ├── AnalyticsPage.jsx
│   ├── IntegrationsPage.jsx
│   ├── ProfilePage.jsx
│   └── SettingsPage.jsx
├── App.jsx             # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## 🎨 Design Features

- **Glassmorphism UI**: Modern glass-like effects with backdrop blur
- **Dark/Light Theme**: Automatic theme switching with system preference detection
- **Responsive Design**: Mobile-first approach with touch optimization
- **Smooth Animations**: Framer Motion powered micro-interactions
- **Professional Typography**: Inter font family with proper scale
- **Custom Components**: Reusable glassmorphism utilities

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Pages Overview

### 🏠 Landing Page (/)
- Hero section with live chat demo
- Feature showcase with animations
- Bot selector with interactive previews
- CTA sections with gradient backgrounds

### 🔐 Authentication (/login, /signup)
- Glassmorphism login/signup forms
- Password strength validation
- Social authentication options
- Responsive design with animations

### 💬 Chat Interface (/chat)
- Real-time messaging with Socket.IO
- Bot selection and management
- Voice recording and playback
- File attachments and emoji support
- Conversation history and search

### 🤖 Bot Management (/bots, /bots/config/:id)
- Bot creation and configuration
- AI model selection and tuning
- Performance analytics
- Personality customization

### 📊 Analytics (/analytics)
- Interactive charts and metrics
- Real-time activity monitoring
- Usage statistics and insights
- Export functionality

### 🔗 Integrations (/integrations)
- Platform connections
- Integration status monitoring
- Configuration management
- Available services catalog

### 👤 Profile & Settings (/profile, /settings)
- User profile management
- Preference configuration
- Billing and subscription
- Usage statistics

## 🚀 Deployment

The application is ready for deployment on platforms like:

- **Vercel**: `npm run build` and deploy
- **Netlify**: Connect repository and auto-deploy
- **AWS S3 + CloudFront**: Static hosting
- **Docker**: Containerized deployment

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# Authentication
VITE_JWT_SECRET=your-jwt-secret-key

# External Services
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_FACEBOOK_APP_ID=your-facebook-app-id

# Feature Flags
VITE_ENABLE_VOICE=true
VITE_ENABLE_FILE_UPLOAD=true
VITE_ENABLE_ANALYTICS=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for smooth animations
- Lucide for beautiful icons
- All contributors and testers

---

**Built with ❤️ using React 19, Vite, and Tailwind CSS**
