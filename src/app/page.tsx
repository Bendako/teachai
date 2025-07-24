"use client";

import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StudentList } from "../components/student-list";
import { AnalyticsDashboard } from "../components/analytics-dashboard";
import { LessonCalendar } from "../components/lesson-calendar";
import { QuickLessonScheduler } from "../components/quick-lesson-scheduler";

import { Sidebar } from "../components/layout/sidebar";
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
      <main className="min-h-screen bg-white">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <div className="container mx-auto px-4 py-8">
        <SignedOut>
          <div className="relative overflow-hidden bg-white">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#10B981]/10 to-[#3B82F6]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#F59E0B]/5 to-[#EF4444]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Hero Section - Animated */}
            <div className="relative px-6 py-20 sm:py-24 lg:py-28">
              <div className="text-center max-w-4xl mx-auto">
                {/* Animated Title */}
                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl mb-8">
                    <span className="block text-[#6366F1] animate-gradient-x bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#6366F1] bg-clip-text text-transparent bg-[length:200%_100%]">
                      TeachAI
                    </span>
                    <span className="block text-gray-900 mt-4 text-4xl sm:text-5xl lg:text-6xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                      Your intelligent teaching assistant
                    </span>
                  </h1>
                </div>
                
                {/* Animated Description */}
                <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <p className="mt-8 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Revolutionize your English teaching with AI-powered lesson planning, 
                    real-time progress tracking, and automated student communication.
                  </p>
                </div>
                
                {/* Animated Buttons */}
                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                  <Button className="bg-[#6366F1] hover:bg-[#5855EB] text-white px-8 py-4 text-lg font-semibold shadow-lg rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl animate-bounce-subtle">
                    Start building for free
                  </Button>
                  <Button variant="outline" className="border-[#6366F1] text-[#6366F1] hover:bg-[#F5F5FF] px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-bounce-subtle" style={{ animationDelay: '0.1s' }}>
                    Watch demo
                  </Button>
                </div>
              </div>
            </div>

            {/* Key Benefits - Animated Grid */}
            <div className="relative px-6 py-16 border-t border-gray-100 bg-gray-50">
              <div className="mx-auto max-w-6xl">
                <div className="text-center mb-16 animate-fade-in-up" style={{ animationDelay: '1s' }}>
                  <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
                    Everything you need to teach effectively
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Powerful features designed specifically for English teachers
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  <FeatureCard 
                    icon="target"
                    title="AI Lesson Planning"
                    description="Generate personalized lesson plans based on student progress and learning goals"
                    delay="1.2s"
                  />
                  <FeatureCard 
                    icon="chart"
                    title="Progress Tracking"
                    description="Real-time skill assessment and visual progress reports for every student"
                    delay="1.4s"
                  />
                  <FeatureCard 
                    icon="users"
                    title="Student Management"
                    description="Complete student profiles with parent communication and scheduling"
                    delay="1.6s"
                  />
                  <FeatureCard 
                    icon="mail"
                    title="Automated Communication"
                    description="Send lesson summaries and progress reports to students and parents"
                    delay="1.8s"
                  />
                </div>
              </div>
            </div>

            {/* Social Proof - Animated */}
            <div className="relative px-6 py-16 border-t border-gray-100">
              <div className="mx-auto max-w-4xl text-center animate-fade-in-up" style={{ animationDelay: '2s' }}>
                <p className="text-lg font-medium text-gray-500 mb-8">
                  Perfect for all types of English teaching
                </p>
                <div className="grid grid-cols-2 gap-8 sm:flex sm:items-center sm:justify-center sm:space-x-12 sm:gap-0">
                  <div className="text-sm text-gray-400 flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '2.2s' }}>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>Cambridge English
                  </div>
                  <div className="text-sm text-gray-400 flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '2.4s' }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>IELTS Prep
                  </div>
                  <div className="text-sm text-gray-400 flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '2.6s' }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2M8 6V4H6a2 2 0 00-2 2v2m0 0v8a2 2 0 002 2h2m-4-4h4m4-4v4m4-4a2 2 0 012 2v4m-6 4h4a2 2 0 002-2v-4M8 18h8" />
                    </svg>Business English
                  </div>
                  <div className="text-sm text-gray-400 flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '2.8s' }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>Conversation Classes
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Badge - Animated */}
            <div className="relative px-6 py-8 border-t border-gray-100 bg-gray-50">
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '3s' }}>
                <div className="inline-flex items-center px-6 py-3 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 transition-colors duration-300 animate-pulse-subtle">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-green-800 text-sm font-medium">
                    100% secure • Student data protected • GDPR compliant
                  </span>
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
  const [activeSection, setActiveSection] = useState("dashboard");
  
  const currentUser = useQuery(api.users.getUserByClerkId, { 
    clerkId: user?.id || "" 
  });
  const createUser = useMutation(api.users.createUser);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [showScheduler, setShowScheduler] = useState(false);

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

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-4">


            {/* Quick Stats */}
            <div className="w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                <StatCard title="Total Students" value="1" icon="users" />
                <StatCard title="This Week's Lessons" value="3" icon="book" />
                <StatCard title="Calendar" value="Schedule" icon="calendar" isAnalytics={true} onClick={() => setActiveSection("calendar")} />
                <StatCard title="Analytics" value="Analytics" icon="search" isAnalytics={true} onClick={() => setActiveSection("analytics")} />
              </div>
            </div>

            {/* Student Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4">
                <StudentList teacherId={currentUser._id} />
              </div>
            </div>
          </div>
        );
      
      case "students":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Student Management</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your student profiles and information</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4">
                <StudentList teacherId={currentUser._id} />
              </div>
            </div>
          </div>
        );
      
      case "calendar":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Lesson Calendar</h2>
                <p className="text-gray-600 mt-1">Schedule and manage your lessons</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                <LessonCalendar
                  teacherId={currentUser._id}
                  onDateClick={(date) => {
                    setSelectedDate(date);
                    setShowScheduler(true);
                  }}
                  onCreateLesson={(date, time) => {
                    setSelectedDate(date);
                    setSelectedTime(time);
                    setShowScheduler(true);
                  }}
                />
              </div>
            </div>
          </div>
        );
      
      case "ai-planner":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">AI Lesson Planner</h2>
                <p className="text-gray-600 mt-1">Generate personalized lesson plans using AI</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Lesson Planner</h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">Create personalized lesson plans tailored to each student&apos;s learning style and progress</p>
                <Button className="bg-[#6366F1] hover:bg-[#5855EB] text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Select a student to start planning
                </Button>
              </div>
            </div>
          </div>
        );
      
      case "enhanced-planner":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Enhanced AI Planner</h2>
                <p className="text-gray-600 mt-1">Advanced lesson planning with enhanced AI capabilities</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Enhanced AI Planner</h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">Advanced lesson planning with enhanced AI capabilities and detailed customization</p>
                <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Access enhanced features
                </Button>
              </div>
            </div>
          </div>
        );
      
      case "analytics":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
                <p className="text-gray-600 mt-1">Track student progress and performance insights</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                <AnalyticsDashboard teacherId={currentUser._id} onClose={() => {}} />
              </div>
            </div>
          </div>
        );
      
      case "progress":
        return (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress Tracker</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracker</h3>
              <p className="text-gray-600 mb-6">Monitor student progress and performance</p>
              <Button className="bg-[#10B981] hover:bg-[#059669] text-white">
                View progress reports
              </Button>
            </div>
          </div>
        );
      
      case "lesson-history":
        return (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Lesson History</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lesson History</h3>
              <p className="text-gray-600 mb-6">View past lessons and teaching records</p>
              <Button className="bg-[#F59E0B] hover:bg-[#D97706] text-white">
                Browse lesson history
              </Button>
            </div>
          </div>
        );
      
      case "emails":
        return (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Management</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Management</h3>
              <p className="text-gray-600 mb-6">Manage communication with students and parents</p>
              <Button className="bg-[#3B82F6] hover:bg-[#1D4ED8] text-white">
                Manage emails
              </Button>
            </div>
          </div>
        );
      
      case "scheduler":
        return (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Lesson Scheduler</h2>
            <QuickLessonScheduler
              teacherId={currentUser._id}
              selectedDate={new Date()}
              selectedTime="09:00"
              isOpen={true}
              onClose={() => {}}
              onScheduled={() => {}}
            />
          </div>
        );
      
      default:
        return (
          <div className="text-center py-16">
            <p className="text-gray-600">Select a feature from the sidebar</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        currentUser={currentUser}
        onNavigate={setActiveSection}
        activeSection={activeSection}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 w-full">
          {renderSection()}
        </div>
      </div>

      {/* Quick Lesson Scheduler Modal */}
      {showScheduler && selectedDate && (
        <QuickLessonScheduler
          teacherId={currentUser._id}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          isOpen={showScheduler}
          onClose={() => {
            setShowScheduler(false);
            setSelectedDate(null);
          }}
          onScheduled={() => {
            setShowScheduler(false);
            setSelectedDate(null);
          }}
        />
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
  const getIcon = (iconName: string) => {
    const iconProps = "w-5 h-5 text-[#6366F1]";
    switch (iconName) {
      case 'users':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case 'book':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'chart':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'search':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return <div className="w-7 h-7 bg-gray-200 rounded"></div>;
    }
  };

  const cardContent = (
    <div className="flex items-center">
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#F5F5FF] to-[#E0E7FF] rounded-lg flex items-center justify-center mr-3 shadow-sm">
        {getIcon(icon)}
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="text-xs font-medium text-gray-600 truncate mb-1">{title}</p>
        <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );

  if (isAnalytics) {
    return (
      <button
        onClick={onClick}
        className="w-full bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-lg hover:border-[#6366F1] hover:bg-gradient-to-br hover:from-[#F5F5FF] hover:to-white transition-all duration-300 text-left cursor-pointer transform hover:scale-[1.02] group overflow-hidden"
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-lg hover:border-[#6366F1] transition-all duration-300 transform hover:scale-[1.02] group overflow-hidden">
      {cardContent}
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: string; title: string; description: string; delay: string }) {
  const getIcon = (iconName: string) => {
    const iconProps = "w-10 h-10 text-[#6366F1]";
    switch (iconName) {
      case 'target':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'chart':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'users':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case 'mail':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return <div className="w-10 h-10 bg-gray-200 rounded"></div>;
    }
  };

  return (
    <div 
      className="relative rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-100 hover:shadow-lg transition-all duration-300 hover:ring-[#6366F1] hover:scale-105 animate-fade-in-up group"
      style={{ animationDelay: delay }}
    >
      {/* Floating animation background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Icon with animation */}
      <div className="relative mb-4 group-hover:animate-bounce">
        {getIcon(icon)}
      </div>
      
      {/* Content */}
      <div className="relative">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#6366F1] transition-colors duration-300">{title}</h3>
        <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{description}</p>
      </div>
    </div>
  );
}
