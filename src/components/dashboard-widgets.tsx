"use client";


import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";

interface DashboardWidgetsProps {
  teacherId: Id<"users">;
  onNavigateToSection: (section: string) => void;
}

// Today's Schedule Widget
export function TodaysSchedule({ teacherId, onNavigateToSection }: DashboardWidgetsProps) {
  const lessons = useQuery(api.lessons.getTodaysLessons, { teacherId });
  
  if (!lessons) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg"></div>;
  
  const upcomingLessons = lessons.slice(0, 3);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onNavigateToSection("calendar")}
        >
          View All
        </Button>
      </div>
      
      {upcomingLessons.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No lessons scheduled for today</p>
          <Button 
            size="sm" 
            className="mt-3"
            onClick={() => onNavigateToSection("calendar")}
          >
            Schedule Lesson
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingLessons.map((lesson) => (
            <div key={lesson._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                 <div>
                   <p className="font-medium text-gray-900">{lesson.studentName}</p>
                   <p className="text-sm text-gray-600">{lesson.title}</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-sm font-medium text-gray-900">
                   {new Date(lesson.scheduledAt).toLocaleTimeString([], { 
                     hour: '2-digit', 
                     minute: '2-digit' 
                   })}
                 </p>
                <Button size="sm" variant="outline" className="mt-1">
                  Start
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Recent Activity Widget
export function RecentActivity({ teacherId }: DashboardWidgetsProps) {
  const recentProgress = useQuery(api.progress.getRecentProgress, { teacherId });
  
  if (!recentProgress) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg"></div>;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      {recentProgress.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentProgress.slice(0, 5).map((progress) => (
            <div key={progress._id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Progress recorded for {progress.studentName}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(progress._creationTime).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Quick Actions Widget
export function QuickActions({ onNavigateToSection }: { onNavigateToSection: (section: string) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={() => onNavigateToSection("ai-planner")}
          className="h-16 flex flex-col items-center justify-center space-y-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-xs">AI Lesson Plan</span>
        </Button>
        
        <Button 
          onClick={() => onNavigateToSection("students")}
          className="h-16 flex flex-col items-center justify-center space-y-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <span className="text-xs">Add Student</span>
        </Button>
        
        <Button 
          onClick={() => onNavigateToSection("calendar")}
          className="h-16 flex flex-col items-center justify-center space-y-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">Schedule Lesson</span>
        </Button>
        
        <Button 
          onClick={() => onNavigateToSection("analytics")}
          className="h-16 flex flex-col items-center justify-center space-y-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-xs">View Analytics</span>
        </Button>
      </div>
    </div>
  );
}

// Performance Insights Widget
export function PerformanceInsights({ teacherId }: DashboardWidgetsProps) {
  const insights = useQuery(api.analytics.getPerformanceInsights, { teacherId });
  
  if (!insights) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg"></div>;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
      
      <div className="space-y-4">
        {insights.studentsNeedingAttention.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm font-medium text-yellow-800">Students Needing Attention</span>
            </div>
            <p className="text-xs text-yellow-700">
              {insights.studentsNeedingAttention.length} student(s) showing declining progress
            </p>
          </div>
        )}
        
        {insights.upcomingAssessments.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium text-blue-800">Upcoming Assessments</span>
            </div>
            <p className="text-xs text-blue-700">
              {insights.upcomingAssessments.length} assessment(s) scheduled this week
            </p>
          </div>
        )}
        
        {insights.homeworkCompletionRate && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-green-800">Homework Completion</span>
            </div>
            <p className="text-xs text-green-700">
              {insights.homeworkCompletionRate}% completion rate this week
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 