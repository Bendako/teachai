"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";

interface QuickLessonSchedulerProps {
  teacherId: Id<"users">;
  selectedDate: Date;
  selectedTime?: string;
  isOpen: boolean;
  onClose: () => void;
  onScheduled?: (lessonId: Id<"lessons">) => void;
}

export function QuickLessonScheduler({ 
  teacherId, 
  selectedDate, 
  selectedTime = "09:00", 
  isOpen, 
  onClose,
  onScheduled 
}: QuickLessonSchedulerProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<Id<"students"> | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [time, setTime] = useState(selectedTime);
  const [isScheduling, setIsScheduling] = useState(false);

  const students = useQuery(api.students.getStudentsByTeacher, { teacherId }) || [];
  const createLesson = useMutation(api.lessons.createLesson);

  const handleSchedule = async () => {
    if (!selectedStudentId || !lessonTitle.trim()) return;

    setIsScheduling(true);
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      const lessonId = await createLesson({
        teacherId,
        studentId: selectedStudentId,
        title: lessonTitle,
        scheduledAt: scheduledDateTime.getTime(),
        duration,
      });

      onScheduled?.(lessonId);
      onClose();
      
      // Reset form
      setSelectedStudentId(null);
      setLessonTitle("");
      setDuration(60);
      setTime("09:00");
    } catch (error) {
      console.error("Failed to schedule lesson:", error);
    } finally {
      setIsScheduling(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Schedule New Lesson</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-indigo-100 mt-2">
            {formatDate(selectedDate)}
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student
            </label>
            <select
              value={selectedStudentId || ""}
              onChange={(e) => setSelectedStudentId(e.target.value as Id<"students">)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a student...</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.level})
                </option>
              ))}
            </select>
          </div>

          {/* Lesson Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Title
            </label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="e.g., Grammar Review, Conversation Practice"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Time and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          {/* Quick Lesson Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Templates
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Grammar Review",
                "Conversation Practice", 
                "Reading Comprehension",
                "Writing Workshop",
                "Pronunciation Practice",
                "Vocabulary Building"
              ].map((template) => (
                <button
                  key={template}
                  onClick={() => setLessonTitle(template)}
                  className="text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-left"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isScheduling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!selectedStudentId || !lessonTitle.trim() || isScheduling}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            {isScheduling ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Scheduling...
              </div>
            ) : (
              "Schedule Lesson"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 