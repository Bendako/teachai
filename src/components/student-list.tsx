"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { ProgressTracker } from "./progress-tracker";
import { useState } from "react";

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

  if (students === undefined) {
    return <div className="p-4">Loading students...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Students</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add New Student
        </Button>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first student</p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Your First Student
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {students.map((student) => (
            <StudentCard 
              key={student._id} 
              student={student}
              teacherId={teacherId}
              onStartLesson={(studentId, lessonId) => 
                setActiveLessonData({ lessonId, studentId })
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
    </div>
  );
}

type Student = {
  _id: Id<"students">;
  name: string;
  email?: string;
  level: "beginner" | "intermediate" | "advanced";
  goals: string[];
};

function StudentCard({ student, teacherId, onStartLesson }: { 
  student: Student; 
  teacherId: Id<"users">;
  onStartLesson: (studentId: Id<"students">, lessonId: Id<"lessons">) => void;
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
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Level:</span> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                student.level === 'beginner' ? 'bg-green-100 text-green-800' :
                student.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {student.level.charAt(0).toUpperCase() + student.level.slice(1)}
              </span>
            </p>
            {student.email && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {student.email}
              </p>
            )}
            {student.goals.length > 0 && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Goals:</span> {student.goals.join(", ")}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            View Profile
          </Button>
          <Button 
            onClick={handleStartLesson}
            disabled={isStartingLesson}
            size="sm" 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isStartingLesson ? "Starting..." : "Start Lesson"}
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