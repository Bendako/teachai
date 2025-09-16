"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";

interface UpcomingLessonsProps {
  teacherId: Id<"users">;
  onLessonClick?: (lessonId: Id<"lessons">) => void;
}

export function UpcomingLessons({ teacherId, onLessonClick }: UpcomingLessonsProps) {
  const [viewPeriod, setViewPeriod] = useState<"week" | "month">("week");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);
    
    if (viewPeriod === "week") {
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }
    
    return { startDate: start.getTime(), endDate: end.getTime() };
  }, [selectedDate, viewPeriod]);

  // Fetch lessons and students
  const lessons = useQuery(api.lessons.getLessonsByDateRange, {
    teacherId,
    startDate,
    endDate,
  }) || [];

  const students = useQuery(api.students.getStudentsByTeacher, { teacherId }) || [];
  const studentsMap = useMemo(() => {
    const map = new Map();
    students.forEach(student => map.set(student._id, student));
    return map;
  }, [students]);

  const deleteLesson = useMutation(api.lessons.deleteLesson);

  // Group lessons by date
  const lessonsByDate = useMemo(() => {
    const grouped = new Map<string, typeof lessons>();
    
    lessons.forEach(lesson => {
      const date = new Date(lesson.scheduledAt).toDateString();
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(lesson);
    });

    // Sort lessons within each day by time
    grouped.forEach(dayLessons => {
      dayLessons.sort((a, b) => a.scheduledAt - b.scheduledAt);
    });

    return grouped;
  }, [lessons]);

  const handleDeleteLesson = async (lessonId: Id<"lessons">) => {
    if (confirm("Are you sure you want to delete this lesson?")) {
      try {
        await deleteLesson({ lessonId });
      } catch (error) {
        console.error("Failed to delete lesson:", error);
      }
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  const navigatePeriod = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (viewPeriod === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const getPeriodTitle = () => {
    if (viewPeriod === "week") {
      const start = new Date(selectedDate);
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
      return selectedDate.toLocaleDateString("en-US", { 
        month: "long", 
        year: "numeric" 
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Lessons</h2>
          <p className="text-gray-600 mt-1">{getPeriodTitle()}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewPeriod("week")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                viewPeriod === "week" 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewPeriod("month")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                viewPeriod === "month" 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Month
            </button>
          </div>

          {/* Navigation */}
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigatePeriod("prev")}
              className="px-3 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="px-3 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigatePeriod("next")}
              className="px-3 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
            >
              →
            </Button>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      {lessons.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons scheduled</h3>
          <p className="text-gray-500">Schedule your first lesson to get started</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(lessonsByDate.entries()).map(([dateString, dayLessons]) => (
            <div key={dateString} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  {formatDate(dayLessons[0].scheduledAt)}
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {dayLessons.map((lesson) => {
                  const student = studentsMap.get(lesson.studentId);
                  return (
                    <div
                      key={lesson._id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => onLessonClick?.(lesson._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                              {formatTime(lesson.scheduledAt)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {lesson.duration} min
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {lesson.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {student?.name || "Unknown Student"} • {student?.level || "No Level"}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLesson(lesson._id);
                            }}
                            className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors p-1.5 rounded-md"
                            title="Delete lesson"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
