# TeachAI - Intelligent English Teaching Assistant

A modern web application for English teachers to manage students, plan AI-powered lessons, track progress, and automate communication.

## 🚀 Features

- **AI-Powered Lesson Planning**: Generate personalized lesson plans using OpenAI GPT-4 or Claude
- **Student Management**: Complete student profiles with progress tracking
- **Progress Analytics**: Real-time skill assessment and performance insights
- **Automated Communication**: Send lesson summaries and progress reports to parents
- **Calendar Integration**: Schedule and manage lessons
- **File Management**: Upload and attach materials to lessons

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Convex (Database, Functions, Real-time)
- **Authentication**: Clerk
- **AI Services**: OpenAI GPT-4, Anthropic Claude
- **Email**: Resend
- **File Storage**: Convex Storage

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Convex account
- Clerk account
- OpenAI API key
- Anthropic API key
- Resend API key

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd teachai
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# AI Services
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Email Service
RESEND_API_KEY=your_resend_api_key

# AI Configuration (Optional)
AI_PRIMARY_PROVIDER=claude
OPENAI_MODEL=gpt-4o
CLAUDE_MODEL=claude-3-5-sonnet-20241022
AI_MAX_TOKENS=4000
AI_TEMPERATURE=0.7
```

### 3. Convex Setup

```bash
# Install Convex CLI
npm install -g convex

# Login to Convex
npx convex auth

# Deploy your functions
npx convex dev
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🗄 Database Schema

The application uses 8 main tables:

- **users**: Teacher and student profiles
- **students**: Student information and progress tracking
- **lessons**: Lesson scheduling and planning
- **progress**: Skill assessments and lesson outcomes
- **ai_lesson_plans**: AI-generated lesson plans
- **ai_generation_history**: AI request tracking
- **student_analysis**: Progress analysis and insights
- **files**: File storage and management

## 🎯 Core Workflows

### For Teachers:
1. **Student Management**: Add students with profiles and learning goals
2. **AI Lesson Planning**: Generate personalized lessons based on student progress
3. **Progress Tracking**: Record and analyze student performance
4. **Communication**: Send automated reports to parents
5. **Analytics**: View teaching insights and student comparisons

### For Students:
1. **Profile Management**: Update personal information and goals
2. **Lesson Participation**: Engage in scheduled lessons
3. **Progress Review**: View personal progress and achievements

## 🔌 API Integration

### AI Services
- **OpenAI GPT-4**: Primary lesson planning and content generation
- **Anthropic Claude**: Alternative AI provider with fallback support
- **Multi-provider Support**: Automatic fallback if one service fails

### External Services
- **Clerk**: User authentication and management
- **Resend**: Email delivery for notifications and reports
- **Convex Storage**: File upload and management

## 🚀 Deployment

### Vercel Deployment
```bash
npm run build
npx convex deploy
```

### Environment Variables
Ensure all environment variables are configured in your deployment platform.

## 📊 Analytics & Insights

The platform provides comprehensive analytics:
- Student progress tracking across 6 skill areas
- Teacher performance metrics
- Lesson effectiveness analysis
- Comparative student performance
- Trend analysis and recommendations

## 🔒 Security & Privacy

- **GDPR Compliant**: Student data protection
- **Secure Authentication**: Clerk-powered user management
- **API Key Security**: Environment-based configuration
- **Data Encryption**: Convex built-in security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

## 🎉 Getting Started

After setup, you can:
1. Sign up as a teacher
2. Add your first student
3. Generate an AI lesson plan
4. Schedule and conduct lessons
5. Track progress and send reports

The system is designed to be intuitive and powerful, helping teachers focus on what matters most - their students' learning journey.
