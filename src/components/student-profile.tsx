"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { LessonHistory } from "./lesson-history";
import { useState } from "react";

interface StudentProfileProps {
  studentId: Id<"students">;
  studentName: string;
  studentLevel: "beginner" | "intermediate" | "advanced";
  teacherId: Id<"users">;
  onClose: () => void;
}

type AILessonPlan = {
  _id: Id<"ai_lesson_plans">;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedDuration: number;
  objectives: string[];
  activities: Array<{
    name: string;
    description: string;
    duration: number;
    skillsTargeted: string[];
  }>;
  isUsed: boolean;
  usedInLessonId?: Id<"lessons">;
  createdAt: number;
};

type ScheduledLesson = {
  _id: Id<"lessons">;
  _creationTime: number;
  teacherId: Id<"users">;
  studentId: Id<"students">;
  title: string;
  description?: string;
  scheduledAt: number;
  duration: number;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  lessonPlan?: {
    objectives: string[];
    activities: string[];
    materials: string[];
    homework?: string;
  };
  isAiGenerated?: boolean;
  aiProvider?: "openai" | "claude";
  generationId?: Id<"ai_generation_history">;
  createdAt: number;
  updatedAt: number;
};

type TabType = "overview" | "ai-plans" | "lessons" | "history";

type Student = {
  _id: Id<"students">;
  name: string;
  level: "beginner" | "intermediate" | "advanced";
  goals: string[];
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
};



export function StudentProfile({ studentId, studentName, studentLevel, teacherId, onClose }: StudentProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  
  // Get student's AI lesson plans
  const aiLessonPlans = useQuery(api.aiLessonPlans.getUnusedLessonPlansForStudent, { 
    teacherId,
    studentId 
  }) as AILessonPlan[] | undefined;
  
  // Get student's scheduled lessons
  const scheduledLessons = useQuery(api.lessons.getLessonsByStudent, { 
    studentId 
  }) as ScheduledLesson[] | undefined;
  
  // Get student details
  const student = useQuery(api.students.getStudent, { studentId }) as Student | undefined;

  if (student === undefined || aiLessonPlans === undefined || scheduledLessons === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-700 font-medium">Loading student profile...</span>
      </div>
    );
  }

  const upcomingLessons = scheduledLessons.filter(lesson => 
    lesson.status === "planned" && lesson.scheduledAt > Date.now()
  );
  
  const aiPlansCount = aiLessonPlans.length;
  const completedLessonsCount = scheduledLessons.filter(lesson => lesson.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{studentName}&apos;s Profile</h2>
          <p className="text-gray-600 mt-1">
            {studentLevel.charAt(0).toUpperCase() + studentLevel.slice(1)} Level • 
            {completedLessonsCount} lessons completed • {aiPlansCount} AI plans ready
          </p>
        </div>
        <Button variant="outline" onClick={onClose} className="font-medium">
          ✕ Close
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "overview" as TabType, label: "Overview", count: null },
          { id: "ai-plans" as TabType, label: "AI Lesson Plans", count: aiPlansCount },
          { id: "lessons" as TabType, label: "Scheduled Lessons", count: upcomingLessons.length },
          { id: "history" as TabType, label: "Lesson History", count: completedLessonsCount }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors relative ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <OverviewTab 
            student={student} 
            aiPlansCount={aiPlansCount}
            upcomingLessons={upcomingLessons}
          />
        )}
        
        {activeTab === "ai-plans" && (
          <AIPlansTab aiLessonPlans={aiLessonPlans} studentName={studentName} />
        )}
        
        {activeTab === "lessons" && (
          <ScheduledLessonsTab lessons={upcomingLessons} />
        )}
        
        {activeTab === "history" && (
          <LessonHistory 
            studentId={studentId} 
            studentName={studentName} 
            onClose={() => {}} 
          />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ student, aiPlansCount, upcomingLessons }: {
  student: Student;
  aiPlansCount: number;
  upcomingLessons: ScheduledLesson[];
}) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#F5F5FF] border border-[#6366F1] rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#6366F1] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🤖</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[#1F2937]">AI Lesson Plans</p>
              <p className="text-2xl font-bold text-[#6366F1]">{aiPlansCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">Upcoming Lessons</p>
              <p className="text-2xl font-bold text-blue-600">{upcomingLessons.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎯</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">Student Level</p>
              <p className="text-lg font-bold text-green-600 capitalize">{student.level}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Goals */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Goals</h3>
        <div className="flex flex-wrap gap-2">
          {student.goals.map((goal: string, index: number) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {goal}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="bg-[#6366F1] hover:bg-[#5855EB] text-white"
            onClick={() => {/* This would open AI lesson planner */}}
          >
            🤖 Generate New Lesson Plan
          </Button>
          <Button 
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => {/* This would schedule a lesson */}}
          >
            📅 Schedule Lesson
          </Button>
        </div>
      </div>
    </div>
  );
}

// AI Plans Tab Component
function AIPlansTab({ aiLessonPlans, studentName }: {
  aiLessonPlans: AILessonPlan[];
  studentName: string;
}) {
  if (aiLessonPlans.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
        <div className="w-16 h-16 bg-[#F5F5FF] rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🤖</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No AI lesson plans yet</h3>
        <p className="text-gray-600 mb-6">Create personalized lesson plans using AI for {studentName}</p>
        <Button className="bg-[#6366F1] hover:bg-[#5855EB] text-white">
          Generate First AI Lesson Plan
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          AI-Generated Lesson Plans ({aiLessonPlans.length})
        </h3>
        <Button className="bg-[#6366F1] hover:bg-[#5855EB] text-white text-sm">
          + Generate New Plan
        </Button>
      </div>
      
      <div className="grid gap-4">
        {aiLessonPlans.map((plan) => (
          <AILessonPlanCard key={plan._id} plan={plan} />
        ))}
      </div>
    </div>
  );
}

// AI Lesson Plan Card Component
function AILessonPlanCard({ plan }: { plan: AILessonPlan }) {
  const [expanded, setExpanded] = useState(false);
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-900">{plan.title}</h4>
            <span className="px-2 py-1 bg-[#F5F5FF] text-[#6366F1] text-xs font-medium rounded-full">
              AI Generated
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              plan.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
              plan.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-700' :
              'bg-[#F5F5FF] text-[#6366F1]'
            }`}>
              {plan.difficulty}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-2">{plan.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>⏱️ {plan.estimatedDuration} minutes</span>
            <span>📅 Created {formatDate(plan.createdAt)}</span>
            <span>🎯 {plan.objectives.length} objectives</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-gray-600"
          >
            {expanded ? "Hide Details" : "View Details"}
          </Button>
          {!plan.isUsed && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Schedule Lesson
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Objectives */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Learning Objectives</h5>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {plan.objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>

          {/* Activities */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Lesson Activities</h5>
            <div className="space-y-3">
              {plan.activities.map((activity, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h6 className="font-medium text-gray-900">{activity.name}</h6>
                    <span className="text-sm text-gray-500">{activity.duration} min</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {activity.skillsTargeted.map((skill, skillIndex) => (
                      <span key={skillIndex} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Scheduled Lessons Tab Component
function ScheduledLessonsTab({ lessons }: { lessons: ScheduledLesson[] }) {
  if (lessons.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📅</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming lessons</h3>
        <p className="text-gray-600 mb-6">Schedule a lesson or convert an AI lesson plan</p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Schedule New Lesson
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Upcoming Lessons ({lessons.length})
      </h3>
      
      <div className="grid gap-4">
        {lessons.map((lesson) => (
          <ScheduledLessonCard key={lesson._id} lesson={lesson} />
        ))}
      </div>
    </div>
  );
}

// Scheduled Lesson Card Component
function ScheduledLessonCard({ lesson }: { lesson: ScheduledLesson }) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-900">{lesson.title}</h4>
            {lesson.isAiGenerated && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                From AI Plan
              </span>
            )}
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {lesson.status}
            </span>
          </div>
          {lesson.description && (
            <p className="text-gray-600 text-sm mb-2">{lesson.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>📅 {formatDate(lesson.scheduledAt)}</span>
            <span>⏱️ {lesson.duration} minutes</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600"
          >
            Edit
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Start Lesson
          </Button>
        </div>
      </div>
    </div>
  );
} 