"use client";

import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { StudentList } from '@/components/student-list'
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                TeachAI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SignedOut>
          <div className="relative">
            {/* Background gradient and pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 -z-10">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Q0EzQUYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            </div>

            {/* Hero Section */}
            <div className="relative px-6 py-16 sm:py-20 lg:px-8">
              <div className="mx-auto max-w-5xl text-center">
                {/* Badge */}
                <div className="mb-6">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-blue-200">
                    <span className="mr-2">🚀</span>
                    AI-Powered Teaching Platform
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  The most comprehensive
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                    English Teaching Platform
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="mt-8 text-lg leading-7 text-gray-600 max-w-2xl mx-auto">
                  Transform your English teaching with AI-powered lesson planning, automated progress tracking, 
                  and seamless student management — all in one platform.
                </p>

                {/* CTA Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <SignInButton>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto"
                    >
                      Start teaching for free
                    </Button>
                  </SignInButton>
                  <Button 
                    variant="outline" 
                    className="px-6 py-3 text-base font-semibold rounded-lg border hover:bg-gray-50 transition-all duration-200 w-full sm:w-auto"
                  >
                    <span className="mr-2">▶️</span>
                    Watch demo
                  </Button>
                </div>

                {/* Trust indicators */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-1">✅</span>
                    Free to start
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">⚡</span>
                    Setup in 5 minutes
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">🔒</span>
                    GDPR compliant
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="relative px-6 py-16">
              <div className="mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    Everything you need to teach effectively
                  </h2>
                  <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                    Powerful features designed specifically for English teachers
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <FeatureCard 
                    icon="🎯"
                    title="AI Lesson Planning"
                    description="Generate personalized lesson plans based on student progress and learning goals"
                  />
                  <FeatureCard 
                    icon="📊"
                    title="Progress Tracking"
                    description="Real-time skill assessment and visual progress reports for every student"
                  />
                  <FeatureCard 
                    icon="👥"
                    title="Student Management"
                    description="Complete student profiles with parent communication and scheduling"
                  />
                  <FeatureCard 
                    icon="📧"
                    title="Automated Communication"
                    description="Send lesson summaries and progress reports to students and parents"
                  />
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="relative px-6 py-12 border-t border-gray-100">
              <div className="mx-auto max-w-4xl text-center">
                <p className="text-sm font-medium text-gray-500 mb-6">
                  Perfect for all types of English teaching
                </p>
                <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:justify-center sm:space-x-8 sm:gap-0">
                  <div className="text-sm text-gray-400 flex items-center justify-center">
                    <span className="mr-2">🌟</span>Cambridge English
                  </div>
                  <div className="text-sm text-gray-400 flex items-center justify-center">
                    <span className="mr-2">🎓</span>IELTS Prep
                  </div>
                  <div className="text-sm text-gray-400 flex items-center justify-center">
                    <span className="mr-2">💼</span>Business English
                  </div>
                  <div className="text-sm text-gray-400 flex items-center justify-center">
                    <span className="mr-2">🗣️</span>Conversation Classes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <TeacherDashboard />
        </SignedIn>
      </div>
    </main>
  );
}

function TeacherDashboard() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getUserByClerkId, { 
    clerkId: user?.id || "" 
  });
  const createUser = useMutation(api.users.createUser);

  // Create user if they don't exist
  if (user && currentUser === null) {
    createUser({
      clerkId: user.id,
      name: user.fullName || user.firstName || "Teacher",
      email: user.primaryEmailAddress?.emailAddress || "",
      imageUrl: user.imageUrl,
      role: "teacher",
    });
  }

  if (currentUser === undefined) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Setting up your account...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-8 border border-blue-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome back, {currentUser.name}! 👋
        </h2>
        <p className="text-gray-700 text-lg">
          Ready to manage your students and plan some amazing lessons?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Students" value="0" icon="👥" />
        <StatCard title="This Week's Lessons" value="0" icon="📚" />
        <StatCard title="Progress Reports" value="0" icon="📊" />
        <StatCard title="Pending Tasks" value="0" icon="✅" />
      </div>

      {/* Student Management */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <StudentList teacherId={currentUser._id} />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="flex items-center">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl mr-4">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="relative rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all duration-200 hover:ring-blue-200">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
