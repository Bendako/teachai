"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { ProgressTracker } from "./progress-tracker";
import { AILessonPlanner } from "./ai-lesson-planner";
import { EnhancedAIPlanner } from "./enhanced-ai-planner";
import { StudentProfile } from "./student-profile";
import { useState } from "react";
import { EmailManagement } from "./email-management";

export function StudentList({ teacherId }: { teacherId: Id<"users"> }) {
  const students = useQuery(api.students.getStudentsByTeacher, { 
    teacherId,
    activeOnly: true 
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeLessonData, setActiveLessonData] = useState<{
    lessonId: Id<"lessons">;
    studentId: Id<"students">;
  } | null>(null);
  
  const [viewingHistory, setViewingHistory] = useState<{
    studentId: Id<"students">;
    studentName: string;
    studentLevel: "beginner" | "intermediate" | "advanced";
  } | null>(null);

  const [emailModal, setEmailModal] = useState<{
    studentId: Id<"students">;
    studentName: string;
    parentEmail?: string;
  } | null>(null);

  const [aiPlannerModal, setAiPlannerModal] = useState<{
    studentId: Id<"students">;
    studentName: string;
    studentLevel: "beginner" | "intermediate" | "advanced";
  } | null>(null);

  const [enhancedAiPlannerModal, setEnhancedAiPlannerModal] = useState<{
    studentId: Id<"students">;
    studentName: string;
    studentLevel: "beginner" | "intermediate" | "advanced";
  } | null>(null);

  if (students === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <span className="text-gray-600 font-medium">Loading your students...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Students</h1>
          <p className="text-gray-600 mt-1">
            {students.length === 0 
              ? "No students yet" 
              : `${students.length} active student${students.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Student
        </Button>
      </div>

      {/* Students Grid */}
      {students.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50 to-white">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No students yet</h3>
          <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
            Get started by adding your first student to begin tracking their progress and planning lessons.
          </p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your First Student
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student: Student) => (
            <StudentCard 
              key={student._id} 
              student={student}
              teacherId={teacherId}
              onStartLesson={(studentId, lessonId) => 
                setActiveLessonData({ lessonId, studentId })
              }
              onViewHistory={(studentId, studentName, studentLevel) =>
                setViewingHistory({ studentId, studentName, studentLevel })
              }
              onOpenEmail={(studentId, studentName, parentEmail) =>
                setEmailModal({ studentId, studentName, parentEmail })
              }
              onOpenAIPlanner={(studentId, studentName, studentLevel) =>
                setAiPlannerModal({ studentId, studentName, studentLevel })
              }
              onOpenEnhancedAIPlanner={(studentId, studentName, studentLevel) =>
                setEnhancedAiPlannerModal({ studentId, studentName, studentLevel })
              }
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddForm && (
        <AddStudentForm 
          teacherId={teacherId}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {activeLessonData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Lesson in Progress</h2>
                <p className="text-gray-600 text-sm">Track your student&apos;s progress in real-time</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveLessonData(null)}
                className="rounded-xl border-gray-200 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="p-6">
              <ProgressTracker
                lessonId={activeLessonData.lessonId}
                studentId={activeLessonData.studentId}
                teacherId={teacherId}
                onComplete={() => setActiveLessonData(null)}
              />
            </div>
          </div>
        </div>
      )}

      {viewingHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Student Profile</h2>
                <p className="text-gray-600 text-sm">View detailed progress and history</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setViewingHistory(null)}
                className="rounded-xl border-gray-200 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="p-6">
              <StudentProfile
                studentId={viewingHistory.studentId}
                studentName={viewingHistory.studentName}
                studentLevel="intermediate"
                teacherId={teacherId}
                onClose={() => setViewingHistory(null)}
              />
            </div>
          </div>
        </div>
      )}

      {emailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Email Management</h2>
                <p className="text-gray-600 text-sm">Send emails to students and parents</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setEmailModal(null)}
                className="rounded-xl border-gray-200 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="p-6">
              <EmailManagement
                studentId={emailModal.studentId}
                studentName={emailModal.studentName}
                parentEmail={emailModal.parentEmail}
                teacherId={teacherId}
                onClose={() => setEmailModal(null)}
              />
            </div>
          </div>
        </div>
      )}

      {aiPlannerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI Lesson Planner</h2>
                <p className="text-gray-600 text-sm">Generate personalized lesson plans with AI</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setAiPlannerModal(null)}
                className="rounded-xl border-gray-200 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="p-6">
              <AILessonPlanner
                studentId={aiPlannerModal.studentId}
                studentName={aiPlannerModal.studentName}
                studentLevel={aiPlannerModal.studentLevel}
                teacherId={teacherId}
                onClose={() => setAiPlannerModal(null)}
              />
            </div>
          </div>
        </div>
      )}

      {enhancedAiPlannerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Enhanced AI Lesson Planner</h2>
                <p className="text-gray-600 text-sm">Create lessons based on previous lesson context</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setEnhancedAiPlannerModal(null)}
                className="rounded-xl border-gray-200 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="p-6">
              <EnhancedAIPlanner
                studentId={enhancedAiPlannerModal.studentId}
                studentName={enhancedAiPlannerModal.studentName}
                teacherId={teacherId}
                onClose={() => setEnhancedAiPlannerModal(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type Student = {
  _id: Id<"students">;
  name: string;
  email?: string;
  level: "beginner" | "intermediate" | "advanced";
  goals: string[];
  parentInfo?: {
    name: string;
    email: string;
    phone?: string;
    relationship: string;
  };
};

function StudentCard({ student, teacherId, onStartLesson, onViewHistory, onOpenEmail, onOpenAIPlanner, onOpenEnhancedAIPlanner }: { 
  student: Student; 
  teacherId: Id<"users">;
  onStartLesson: (studentId: Id<"students">, lessonId: Id<"lessons">) => void;
  onViewHistory: (studentId: Id<"students">, studentName: string, studentLevel: "beginner" | "intermediate" | "advanced") => void;
  onOpenEmail: (studentId: Id<"students">, studentName: string, parentEmail?: string) => void;
  onOpenAIPlanner: (studentId: Id<"students">, studentName: string, studentLevel: "beginner" | "intermediate" | "advanced") => void;
  onOpenEnhancedAIPlanner: (studentId: Id<"students">, studentName: string, studentLevel: "beginner" | "intermediate" | "advanced") => void;
}) {
  const getOrCreateLesson = useMutation(api.lessons.getOrCreateLesson);
  const [isStartingLesson, setIsStartingLesson] = useState(false);

  const handleStartLesson = async () => {
    setIsStartingLesson(true);
    try {
      const lessonId = await getOrCreateLesson({
        teacherId,
        studentId: student._id,
        title: `Lesson with ${student.name}`,
        description: `English lesson session`,
        duration: 60, // 60 minutes default
      });
      onStartLesson(student._id, lessonId);
    } catch (error) {
      console.error("Failed to start lesson:", error);
    } finally {
      setIsStartingLesson(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
              {student.name}
            </h3>
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getLevelColor(student.level)}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                student.level === 'beginner' ? 'bg-emerald-500' :
                student.level === 'intermediate' ? 'bg-blue-500' :
                'bg-purple-500'
              }`}></div>
              {student.level.charAt(0).toUpperCase() + student.level.slice(1)}
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>

        {/* Student Info */}
        <div className="space-y-3 mb-6">
          {student.email && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {student.email}
            </div>
          )}
          {student.goals.length > 0 && (
            <div className="flex items-start text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="line-clamp-2">{student.goals.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleStartLesson}
            disabled={isStartingLesson}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isStartingLesson ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Starting...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Lesson
              </div>
            )}
          </Button>
          
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onOpenAIPlanner(student._id, student.name, student.level)}
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 font-medium rounded-lg py-2 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Plan
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onOpenEnhancedAIPlanner(student._id, student.name, student.level)}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-medium rounded-lg py-2 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Enhanced
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewHistory(student._id, student.name, student.level)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium rounded-lg py-2 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Profile
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onOpenEmail(student._id, student.name, student.parentInfo?.email)}
            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-medium rounded-lg py-2 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send Email
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddStudentForm({ teacherId, onClose }: { teacherId: Id<"users">; onClose: () => void }) {
  const createStudent = useMutation(api.students.createStudent);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    goals: "",
    notes: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    parentRelationship: "parent",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createStudent({
        teacherId,
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        level: formData.level,
        goals: formData.goals.split(",").map(g => g.trim()).filter(g => g),
        notes: formData.notes || undefined,
        parentInfo: formData.parentName ? {
          name: formData.parentName,
          email: formData.parentEmail,
          phone: formData.parentPhone || undefined,
          relationship: formData.parentRelationship,
        } : undefined,
      });
      
      onClose();
    } catch (error) {
      console.error("Failed to create student:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white">Add New Student</h3>
              <p className="text-blue-100 mt-1">Fill in the details to add a new student to your class</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Student Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Student Information</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white"
                    placeholder="Enter student's full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as "beginner" | "intermediate" | "advanced" })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white"
                    placeholder="student@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Learning Goals (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="e.g., Improve speaking, Business English, IELTS preparation"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional notes about the student..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white resize-none"
                />
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="border-t border-gray-200 pt-8 space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Parent/Guardian Information</h4>
                  <p className="text-sm text-gray-600">Optional contact information for the student&apos;s guardian</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Parent/Guardian Name
                  </label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white"
                    placeholder="Enter parent's name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Parent/Guardian Email
                  </label>
                  <input
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white"
                    placeholder="parent@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
              >
                Add Student
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 