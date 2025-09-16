"use client";

import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StudentList } from "../components/student-list";
import { AnalyticsDashboard } from "../components/analytics-dashboard";
import { SimpleLessonScheduler } from "../components/simple-lesson-scheduler";
import { UpcomingLessons } from "../components/upcoming-lessons";
import { QuickLessonScheduler } from "../components/quick-lesson-scheduler";
import { TodaysSchedule, RecentActivity, QuickActions, PerformanceInsights } from "../components/dashboard-widgets";
import { LandingPage } from "../components/landing-page";


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
      <SignedOut>
        <LandingPage />
      </SignedOut>

      <SignedIn>
        <div className="container mx-auto px-4 py-8">
          <TeacherDashboard />
        </div>
      </SignedIn>
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
  const seedSampleData = useMutation(api.seedData.seedSampleData);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime] = useState("09:00");
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
          <div className="space-y-6">
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

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <TodaysSchedule 
                  teacherId={currentUser._id} 
                  onNavigateToSection={setActiveSection} 
                />
                <RecentActivity teacherId={currentUser._id} onNavigateToSection={setActiveSection} />
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <QuickActions onNavigateToSection={setActiveSection} />
                <PerformanceInsights teacherId={currentUser._id} onNavigateToSection={setActiveSection} />
              </div>
            </div>
            
            {/* Sample Data Button */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-blue-900">Demo Mode</h3>
                  <p className="text-xs text-blue-700 mt-1">Add sample students and lessons to see the system in action</p>
                </div>
                <Button
                  onClick={async () => {
                    if (currentUser) {
                      const result = await seedSampleData({ teacherId: currentUser._id });
                      if (result.success) {
                        alert(result.message);
                        window.location.reload();
                      } else {
                        alert("Failed to create sample data: " + result.message);
                      }
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2"
                >
                  Add Sample Data
                </Button>
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
            <SimpleLessonScheduler 
              teacherId={currentUser._id}
              onScheduled={() => {
                // Refresh the page or update state as needed
                window.location.reload();
              }}
            />
            <UpcomingLessons 
              teacherId={currentUser._id}
              onLessonClick={(lessonId) => {
                // Handle lesson click - could open details modal
                console.log("Lesson clicked:", lessonId);
              }}
            />
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


