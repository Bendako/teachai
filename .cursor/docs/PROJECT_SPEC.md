# TeachAI - English Teaching SaaS Platform

## 🚀 Quick Start Guide

This is your complete project starter for building a comprehensive English teaching automation platform. Follow the implementation plan to go from zero to production in 11 weeks.

**Tech Stack:** Next.js 14 + React + TypeScript + TailwindCSS + Clerk + Convex + Python AI

## Project Overview

A comprehensive SaaS platform designed to automate and streamline the workflow of English private teachers, from student management to lesson planning, progress tracking, and communication with students and parents.

**What this platform will do for you:**
- ⏱️ Save 50% of lesson planning time with AI assistance
- 📊 Track student progress automatically during lessons  
- 📧 Send automated summaries to students and parents
- 🎯 Generate personalized lesson plans based on student data
- 📱 Provide student/parent portal for progress viewing

## 🛠️ Prerequisites & Setup

### Required Accounts
1. **Clerk** - Authentication service (free tier available)
2. **Convex** - Database and backend (generous free tier)
3. **OpenAI** - AI service for lesson planning ($5-20/month)
4. **Vercel** - Deployment (free for personal projects)
5. **Email Service** - SendGrid or Resend (free tiers available)

### Development Environment
- Node.js 18+ installed
- Git installed
- Code editor (VS Code recommended)
- Terminal/Command Line access

### Initial Setup Commands
```bash
# 1. Clone and setup the project
git clone <your-repo> teachai
cd teachai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Initialize Convex
npx convex dev

# 5. Start development server
npm run dev
```

### Environment Variables Needed
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex Database
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=https://...

# OpenAI API
OPENAI_API_KEY=sk-...

# Email Service (Choose one)
SENDGRID_API_KEY=SG....
# OR
RESEND_API_KEY=re_...
```

## Core Features

### 1. Student Management System
- **Student Profiles**: Store personal details, contact information, learning goals, and preferences
- **Parent/Guardian Information**: Contact details and communication preferences
- **Academic History**: Previous lessons, assessments, strengths, and areas for improvement
- **Custom Tags**: Categorize students by level, focus areas, or special needs

### 2. AI-Powered Lesson Planning
- **AI Integration**: Python-based service to generate personalized lesson plans
- **Curriculum Database**: Store and organize teaching materials, exercises, and resources
- **Adaptive Planning**: AI considers student's progress, weaknesses, and learning style
- **Template System**: Reusable lesson plan templates for different skill levels

### 3. Progress Tracking System
- **Real-time Tracking**: During-lesson interface to record progress on specific topics
- **Skill Assessment**: Track improvement in reading, writing, speaking, and listening
- **Goal Setting**: Set and monitor learning objectives for each student
- **Visual Progress Reports**: Charts and graphs showing student development over time

### 4. Lesson Summary & Documentation
- **Automated Summaries**: AI-generated lesson summaries based on tracked activities
- **File Management**: Store and organize lesson materials, homework, and resources
- **Notes System**: Teacher notes and observations for each lesson
- **Homework Assignment**: Create and track homework assignments

### 5. Communication Hub
- **Automated Emails**: Send lesson summaries and materials to students and parents
- **Progress Reports**: Generate and send periodic progress reports
- **Scheduling**: Lesson scheduling with calendar integration
- **Notifications**: Reminders for upcoming lessons and deadlines

### 6. Student/Parent Portal
- **Progress Dashboard**: View learning progress and achievements
- **Resource Access**: Download lesson materials and assignments
- **Communication**: Message teacher and view feedback
- **Schedule View**: Upcoming lessons and important dates

## Technical Architecture

### Frontend (Next.js + React + TailwindCSS)
```
/app
  /dashboard          # Teacher main dashboard
  /students           # Student management pages
  /lessons            # Lesson planning and tracking
  /progress           # Progress tracking and reports
  /portal             # Student/parent portal
  /components         # Reusable UI components
  /lib                # Utilities and configurations
```

### Backend (Convex)
```
/convex
  /schema             # Database schema definitions
  /functions          # API functions
    /students.js      # Student CRUD operations
    /lessons.js       # Lesson management
    /progress.js      # Progress tracking
    /communication.js # Email and notifications
  /auth.js            # Authentication logic
```

### AI Service (Python)
```
/ai-service
  /api                # FastAPI endpoints
  /models             # AI models and processors
  /templates          # Lesson plan templates
  /utils              # Helper functions
```

### Authentication (Clerk)
- User roles: Teacher, Student, Parent
- Multi-tenant support for multiple teachers
- Session management and security

## Database Schema

### Students
```typescript
{
  _id: Id<"students">
  teacherId: Id<"users">
  name: string
  email: string
  phone?: string
  dateOfBirth?: string
  level: "beginner" | "intermediate" | "advanced"
  goals: string[]
  parentInfo: {
    name: string
    email: string
    phone: string
    relationship: string
  }
  createdAt: number
  updatedAt: number
}
```

### Lessons
```typescript
{
  _id: Id<"lessons">
  teacherId: Id<"users">
  studentId: Id<"students">
  title: string
  description: string
  scheduledAt: number
  duration: number
  status: "planned" | "in_progress" | "completed" | "cancelled"
  lessonPlan: {
    objectives: string[]
    activities: Activity[]
    materials: string[]
    homework?: string
  }
  createdAt: number
  updatedAt: number
}
```

### Progress
```typescript
{
  _id: Id<"progress">
  lessonId: Id<"lessons">
  studentId: Id<"students">
  skills: {
    reading: number
    writing: number
    speaking: number
    listening: number
    grammar: number
    vocabulary: number
  }
  topicsCovered: string[]
  notes: string
  homework?: {
    assigned: string
    completed: boolean
    feedback?: string
  }
  createdAt: number
}
```

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- Project setup and basic structure
- Authentication with Clerk
- Convex database setup
- Basic UI components

### Phase 2: Core Features (Weeks 3-5)
- Student management system
- Basic lesson planning
- Progress tracking interface
- Teacher dashboard

### Phase 3: AI Integration (Weeks 6-7)
- Python AI service development
- Lesson plan generation
- Progress analysis and recommendations

### Phase 4: Communication & Portal (Weeks 8-9)
- Email system integration
- Student/parent portal
- File management and sharing

### Phase 5: Polish & Deploy (Weeks 10-11)
- UI/UX improvements
- Testing and bug fixes
- Deployment setup
- Documentation

## Key User Flows

### 1. Teacher Workflow
1. Log in to dashboard
2. View upcoming lessons and student progress
3. Create/modify lesson plans with AI assistance
4. Conduct lesson with progress tracking
5. Generate and send lesson summary
6. Review overall student progress

### 2. Student/Parent Workflow
1. Receive lesson summary email
2. Access portal to view progress
3. Download materials and assignments
4. Communicate with teacher if needed

## Success Metrics

- Time saved in lesson planning (target: 50% reduction)
- Improved student progress tracking accuracy
- Increased parent engagement and satisfaction
- Streamlined communication efficiency
- Teacher productivity improvements

## Technical Requirements

### Frontend Dependencies
- Next.js 14+ with App Router
- React 18+
- TypeScript
- TailwindCSS
- Clerk for authentication
- Convex React client
- Chart.js for progress visualization
- React Hook Form for form management

### Backend Dependencies
- Convex (database and API)
- Node.js runtime for Convex functions

### AI Service Dependencies
- Python 3.9+
- FastAPI
- OpenAI API or local LLM
- Pandas for data processing
- Jinja2 for template rendering

### Infrastructure
- Vercel for frontend deployment
- Convex hosting for backend
- Docker for AI service
- Email service (SendGrid/Resend)
- File storage (Convex file storage)

## Security Considerations

- Data encryption at rest and in transit
- GDPR compliance for student data
- Role-based access control
- Secure API endpoints
- Regular security audits
- Data backup and recovery procedures 