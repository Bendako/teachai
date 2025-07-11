"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";

type CalendarViewType = "month" | "week" | "day";

interface LessonCalendarProps {
  teacherId: Id<"users">;
  onLessonClick?: (lessonId: Id<"lessons">) => void;
  onDateClick?: (date: Date) => void;
  onCreateLesson?: (date: Date, time: string) => void;
}

interface CalendarLesson {
  _id: Id<"lessons">;
  title: string;
  studentId: Id<"students">;
  scheduledAt: number;
  duration: number;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  description?: string;
  lessonPlan?: {
    objectives: string[];
    activities: string[];
    materials: string[];
    homework?: string;
  };
}

export function LessonCalendar({ teacherId, onLessonClick, onDateClick, onCreateLesson }: LessonCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>("month");
  const [draggedLesson, setDraggedLesson] = useState<CalendarLesson | null>(null);
  
  // Calculate date range for current view
  const { startDate, endDate } = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    
    switch (viewType) {
      case "month":
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case "day":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }
    
    return { startDate: start.getTime(), endDate: end.getTime() };
  }, [currentDate, viewType]);

  // Fetch lessons for the current date range
  const lessons = useQuery(api.lessons.getLessonsByDateRange, {
    teacherId,
    startDate,
    endDate,
  }) || [];

  // Fetch students for lesson details
  const students = useQuery(api.students.getStudentsByTeacher, { teacherId }) || [];
  const studentsMap = useMemo(() => {
    const map = new Map();
    students.forEach(student => map.set(student._id, student));
    return map;
  }, [students]);

  const rescheduleLesson = useMutation(api.lessons.rescheduleLesson);
  const checkConflicts = useQuery(
    api.lessons.checkSchedulingConflicts,
    draggedLesson 
      ? {
          teacherId,
          scheduledAt: draggedLesson.scheduledAt,
          duration: draggedLesson.duration,
          excludeLessonId: draggedLesson._id,
        }
      : "skip"
  );

  // Navigation functions
  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    switch (viewType) {
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Drag and drop handlers
  const handleLessonDragStart = (lesson: CalendarLesson) => {
    setDraggedLesson(lesson);
  };

  const handleDateDrop = async (date: Date, hour: number) => {
    if (!draggedLesson) return;
    
    const newScheduledAt = new Date(date);
    newScheduledAt.setHours(hour, 0, 0, 0);
    
    try {
      await rescheduleLesson({
        lessonId: draggedLesson._id,
        newScheduledAt: newScheduledAt.getTime(),
      });
      setDraggedLesson(null);
    } catch (error) {
      console.error("Failed to reschedule lesson:", error);
    }
  };

  // Format date for display
  const formatViewTitle = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      year: "numeric",
    };
    
    switch (viewType) {
      case "month":
        return currentDate.toLocaleDateString("en-US", options);
      case "week":
        const start = new Date(currentDate);
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      case "day":
        return currentDate.toLocaleDateString("en-US", { 
          weekday: "long", 
          month: "long", 
          day: "numeric", 
          year: "numeric" 
        });
    }
  };

  // Get lessons for a specific date
  const getLessonsForDate = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return lessons.filter(lesson => 
      lesson.scheduledAt >= startOfDay.getTime() && 
      lesson.scheduledAt <= endOfDay.getTime()
    );
  };

  // Get status color for lesson
  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned": return "bg-blue-100 border-blue-300 text-blue-800";
      case "in_progress": return "bg-green-100 border-green-300 text-green-800";
      case "completed": return "bg-gray-100 border-gray-300 text-gray-800";
      case "cancelled": return "bg-red-100 border-red-300 text-red-800";
      default: return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const renderMonthView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startCalendar = new Date(firstDay);
    startCalendar.setDate(startCalendar.getDate() - firstDay.getDay());
    
    const weeks = [];
    const currentWeek = new Date(startCalendar);
    
    for (let week = 0; week < 6; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(currentWeek);
        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
        const isToday = date.toDateString() === new Date().toDateString();
        const dayLessons = getLessonsForDate(date);
        
        days.push(
          <div
            key={date.toISOString()}
            className={`min-h-[120px] p-2 border border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
              isCurrentMonth ? "bg-white" : "bg-gray-50"
            } ${isToday ? "ring-2 ring-indigo-500" : ""}`}
                         onClick={() => {
               onDateClick?.(date);
             }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedLesson) {
                handleDateDrop(date, 9); // Default to 9 AM
              }
            }}
          >
            <div className={`text-sm font-medium mb-2 ${
              isCurrentMonth ? "text-gray-900" : "text-gray-400"
            } ${isToday ? "text-indigo-600" : ""}`}>
              {date.getDate()}
            </div>
            
            <div className="space-y-1">
              {dayLessons.slice(0, 3).map((lesson) => {
                const student = studentsMap.get(lesson.studentId);
                const time = new Date(lesson.scheduledAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
                
                return (
                  <div
                    key={lesson._id}
                    className={`text-xs p-2 rounded border cursor-pointer transition-all duration-200 hover:shadow-sm ${getStatusColor(lesson.status)}`}
                    draggable
                    onDragStart={() => handleLessonDragStart(lesson)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLessonClick?.(lesson._id);
                    }}
                  >
                    <div className="font-medium truncate">{time}</div>
                    <div className="truncate">{student?.name || "Unknown"}</div>
                  </div>
                );
              })}
              
              {dayLessons.length > 3 && (
                <div className="text-xs text-gray-500 font-medium">
                  +{dayLessons.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        
        currentWeek.setDate(currentWeek.getDate() + 1);
      }
      weeks.push(
        <div key={week} className="grid grid-cols-7 gap-0 border-b border-gray-200">
          {days}
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header with day names */}
        <div className="grid grid-cols-7 gap-0 bg-gray-50 border-b border-gray-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="p-4 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar weeks */}
        {weeks}
      </div>
    );
  };

  const renderWeekView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      return day;
    });
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-8 gap-0 bg-gray-50 border-b border-gray-200">
          <div className="p-4 text-sm font-medium text-gray-700">Time</div>
          {weekDays.map(day => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={day.toISOString()} className={`p-4 text-center text-sm font-medium ${
                isToday ? "text-indigo-600 bg-indigo-50" : "text-gray-700"
              }`}>
                <div>{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div className={`text-lg ${isToday ? "font-bold" : ""}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Time slots */}
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 gap-0 border-b border-gray-100 min-h-[60px]">
              <div className="p-3 text-sm text-gray-500 border-r border-gray-100">
                {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              
              {weekDays.map(day => {
                const cellDateTime = new Date(day);
                cellDateTime.setHours(hour, 0, 0, 0);
                const hourLessons = lessons.filter(lesson => {
                  const lessonDate = new Date(lesson.scheduledAt);
                  return lessonDate.toDateString() === day.toDateString() &&
                         lessonDate.getHours() === hour;
                });
                
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="p-2 border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => onCreateLesson?.(day, `${hour}:00`)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedLesson) {
                        handleDateDrop(day, hour);
                      }
                    }}
                  >
                                         {hourLessons.map(lesson => {
                       const student = studentsMap.get(lesson.studentId);
                       
                       return (
                        <div
                          key={lesson._id}
                          className={`text-xs p-2 rounded border cursor-pointer mb-1 ${getStatusColor(lesson.status)}`}
                          draggable
                          onDragStart={() => handleLessonDragStart(lesson)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onLessonClick?.(lesson._id);
                          }}
                        >
                          <div className="font-medium">{student?.name || "Unknown"}</div>
                          <div className="text-gray-600">{lesson.duration}min</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Title and Navigation */}
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {formatViewTitle()}
          </h2>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("prev")}
              className="p-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="px-3 py-2 text-sm"
            >
              Today
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("next")}
              className="p-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            {(["month", "week", "day"] as CalendarViewType[]).map((view) => (
              <button
                key={view}
                onClick={() => setViewType(view)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 capitalize ${
                  viewType === view
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Calendar View */}
      {viewType === "month" && renderMonthView()}
      {viewType === "week" && renderWeekView()}
      
      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
          <span className="text-gray-600">Planned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-gray-600">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span className="text-gray-600">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-gray-600">Cancelled</span>
        </div>
      </div>
      
      {/* Conflict Warning */}
      {checkConflicts && checkConflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5C2.962 18.333 3.924 20 5.464 20z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800">Scheduling Conflict</h4>
              <p className="text-sm text-red-700 mt-1">
                This time slot conflicts with {checkConflicts.length} existing lesson{checkConflicts.length > 1 ? "s" : ""}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 