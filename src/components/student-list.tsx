"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { ProgressTracker } from "./progress-tracker";
import { LessonHistory } from "./lesson-history";
import { AILessonPlanner } from "./ai-lesson-planner";
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

  if (students === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-700 font-medium">Loading students...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Students</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
        >
          Add New Student
        </Button>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No students yet</h3>
          <p className="text-gray-600 mb-6 text-lg">Get started by adding your first student</p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
          >
            Add Your First Student
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {students.map((student: Student) => (
            <StudentCard 
              key={student._id} 
              student={student}
              teacherId={teacherId}
              onStartLesson={(studentId, lessonId) => 
                setActiveLessonData({ lessonId, studentId })
              }
              onViewHistory={(studentId, studentName) =>
                setViewingHistory({ studentId, studentName })
              }
              onOpenEmail={(studentId, studentName, parentEmail) =>
                setEmailModal({ studentId, studentName, parentEmail })
              }
              onOpenAIPlanner={(studentId, studentName, studentLevel) =>
                setAiPlannerModal({ studentId, studentName, studentLevel })
              }
            />
          ))}
        </div>
      )}

      {showAddForm && (
        <AddStudentForm 
          teacherId={teacherId}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {activeLessonData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Lesson in Progress</h2>
              <Button
                variant="outline"
                onClick={() => setActiveLessonData(null)}
              >
                ✕ Close
              </Button>
            </div>
            <ProgressTracker
              lessonId={activeLessonData.lessonId}
              studentId={activeLessonData.studentId}
              teacherId={teacherId}
              onComplete={() => setActiveLessonData(null)}
            />
          </div>
        </div>
      )}

      {viewingHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <LessonHistory
                studentId={viewingHistory.studentId}
                studentName={viewingHistory.studentName}
                onClose={() => setViewingHistory(null)}
              />
            </div>
          </div>
        </div>
      )}

      {emailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <EmailManagement
              studentId={emailModal.studentId}
              studentName={emailModal.studentName}
              parentEmail={emailModal.parentEmail}
              teacherId={teacherId}
              onClose={() => setEmailModal(null)}
            />
          </div>
        </div>
      )}

      {aiPlannerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
            <AILessonPlanner
              studentId={aiPlannerModal.studentId}
              studentName={aiPlannerModal.studentName}
              studentLevel={aiPlannerModal.studentLevel}
              teacherId={teacherId}
              onClose={() => setAiPlannerModal(null)}
            />
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

function StudentCard({ student, teacherId, onStartLesson, onViewHistory, onOpenEmail, onOpenAIPlanner }: { 
  student: Student; 
  teacherId: Id<"users">;
  onStartLesson: (studentId: Id<"students">, lessonId: Id<"lessons">) => void;
  onViewHistory: (studentId: Id<"students">, studentName: string) => void;
  onOpenEmail: (studentId: Id<"students">, studentName: string, parentEmail?: string) => void;
  onOpenAIPlanner: (studentId: Id<"students">, studentName: string, studentLevel: "beginner" | "intermediate" | "advanced") => void;
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
  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{student.name}</h3>
          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Level:</span> 
              <span className={`ml-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                student.level === 'beginner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                student.level === 'intermediate' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                {student.level.charAt(0).toUpperCase() + student.level.slice(1)}
              </span>
            </p>
            {student.email && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Email:</span> {student.email}
              </p>
            )}
            {student.goals.length > 0 && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Goals:</span> {student.goals.join(", ")}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <Button 
            onClick={handleStartLesson}
            disabled={isStartingLesson}
            size="sm" 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStartingLesson ? "Starting..." : "Start Lesson"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onOpenAIPlanner(student._id, student.name, student.level)}
            className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 font-medium"
          >
            🤖 AI Plan Lesson
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewHistory(student._id, student.name)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium"
          >
            View Profile
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onOpenEmail(student._id, student.name, student.parentInfo?.email)}
            className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 font-medium"
          >
            📧 Send Email
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Add New Student</h3>
          <Button variant="outline" onClick={onClose}>✕</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level *
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as "beginner" | "intermediate" | "advanced" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Learning Goals (comma-separated)
            </label>
            <input
              type="text"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              placeholder="e.g., Improve speaking, Business English, IELTS preparation"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-lg font-medium mb-3">Parent/Guardian Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Name
                </label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Email
                </label>
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Add Student
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 