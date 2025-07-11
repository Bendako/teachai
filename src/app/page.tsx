"use client";

import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StudentList } from "../components/student-list";
import { AnalyticsDashboard } from "../components/analytics-dashboard";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // Fix hydration issues by ensuring component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <SignedOut>
          <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100">
            {/* Hero Section */}
            <div className="relative px-6 py-16 sm:py-20 lg:py-24">
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                  <span className="block text-blue-600">TeachAI</span>
                  <span className="block text-gray-900 mt-2">Your intelligent teaching assistant</span>
                </h1>
                <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                  Revolutionize your English teaching with AI-powered lesson planning, 
                  real-time progress tracking, and automated student communication.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg">
                    Get Started Free
                  </Button>
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-3 text-lg font-semibold">
                    Watch Demo
                  </Button>
                </div>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="relative px-6 py-12 border-t border-gray-100 bg-gray-50">
              <div className="mx-auto max-w-4xl">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="text-3xl mb-3">⚡</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Save 5+ hours per week</h3>
                    <p className="text-sm text-gray-600">Automated lesson planning and progress reports</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-3">🎯</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Personalized learning</h3>
                    <p className="text-sm text-gray-600">AI adapts to each student&apos;s skill level and goals</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-3">📊</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Data-driven insights</h3>
                    <p className="text-sm text-gray-600">Real-time analytics and parent communication</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Badge */}
            <div className="relative px-6 py-6 border-t border-gray-100">
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                  <span className="text-green-600 text-sm font-medium mr-2">🔒</span>
                  <span className="text-green-800 text-sm font-medium">
                    100% secure • Student data protected • 
                    GDPR compliant
                  </span>
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
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);
  
  const currentUser = useQuery(api.users.getUserByClerkId, { 
    clerkId: user?.id || "" 
  });
  const createUser = useMutation(api.users.createUser);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait for Clerk to load and component to mount
  if (!mounted || !isLoaded) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  // Create user if they do not exist
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
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Students" value="1" icon="👥" />
        <StatCard title="This Week&apos;s Lessons" value="3" icon="📚" />
        <StatCard title="Progress Reports" value="3" icon="📊" />
        <StatCard title="Analytics" value="📊" icon="🔍" isAnalytics={true} onClick={() => setShowAnalytics(true)} />
      </div>

      {/* Student Management */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <StudentList teacherId={currentUser._id} />
      </div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <AnalyticsDashboard
                teacherId={currentUser._id}
                onClose={() => setShowAnalytics(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, isAnalytics, onClick }: { 
  title: string; 
  value: string; 
  icon: string; 
  isAnalytics?: boolean;
  onClick?: () => void;
}) {
  const cardContent = (
    <div className="flex items-center">
      <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl mr-4">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );

  if (isAnalytics) {
    return (
      <button
        onClick={onClick}
        className="w-full bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 text-left cursor-pointer"
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200">
      {cardContent}
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
