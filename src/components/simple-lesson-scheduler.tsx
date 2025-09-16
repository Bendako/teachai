"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";

interface SimpleLessonSchedulerProps {
  teacherId: Id<"users">;
  onScheduled?: (lessonId: Id<"lessons">) => void;
}

type ScheduleType = "single" | "recurring";

export function SimpleLessonScheduler({ 
  teacherId, 
  onScheduled 
}: SimpleLessonSchedulerProps) {
  const [scheduleType, setScheduleType] = useState<ScheduleType>("single");
  const [selectedStudentId, setSelectedStudentId] = useState<Id<"students"> | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [isScheduling, setIsScheduling] = useState(false);

  // Single lesson scheduling
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");

  // Recurring lesson scheduling
  const [selectedDay, setSelectedDay] = useState("");
  const [recurringTime, setRecurringTime] = useState("09:00");
  const [weeksAhead, setWeeksAhead] = useState(4);

  const students = useQuery(api.students.getStudentsByTeacher, { teacherId }) || [];
  const createLesson = useMutation(api.lessons.createLesson);

  const handleSchedule = async () => {
    if (!selectedStudentId || !lessonTitle.trim()) return;

    setIsScheduling(true);
    try {
      if (scheduleType === "single") {
        await scheduleSingleLesson();
      } else {
        await scheduleRecurringLessons();
      }
      
      onScheduled?.(selectedStudentId as Id<"lessons">);
      resetForm();
    } catch (error) {
      console.error("Failed to schedule lesson:", error);
    } finally {
      setIsScheduling(false);
    }
  };

  const scheduleSingleLesson = async () => {
    if (!selectedDate) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    await createLesson({
      teacherId,
      studentId: selectedStudentId!,
      title: lessonTitle,
      scheduledAt: scheduledDateTime.getTime(),
      duration,
    });
  };

  const scheduleRecurringLessons = async () => {
    if (!selectedDay) return;

    const dayOfWeek = parseInt(selectedDay);
    const [hours, minutes] = recurringTime.split(':').map(Number);
    
    // Calculate the next occurrence of the selected day
    const today = new Date();
    const daysUntilTarget = (dayOfWeek - today.getDay() + 7) % 7;
    const nextOccurrence = new Date(today);
    nextOccurrence.setDate(today.getDate() + daysUntilTarget);
    nextOccurrence.setHours(hours, minutes, 0, 0);

    // Create lessons for the specified number of weeks
    for (let week = 0; week < weeksAhead; week++) {
      const lessonDate = new Date(nextOccurrence);
      lessonDate.setDate(nextOccurrence.getDate() + (week * 7));

      await createLesson({
        teacherId,
        studentId: selectedStudentId!,
        title: lessonTitle,
        scheduledAt: lessonDate.getTime(),
        duration,
      });
    }
  };

  const resetForm = () => {
    setSelectedStudentId(null);
    setLessonTitle("");
    setDuration(60);
    setSelectedDate("");
    setSelectedTime("09:00");
    setSelectedDay("");
    setRecurringTime("09:00");
    setWeeksAhead(4);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getNextWeekDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };

  const dayOptions = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Schedule Lessons</h2>
        <p className="text-gray-600 text-sm">Quickly schedule single lessons or set up recurring weekly sessions</p>
      </div>

      {/* Schedule Type Toggle */}
      <div className="mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setScheduleType("single")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              scheduleType === "single" 
                ? "bg-indigo-600 text-white shadow-sm" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Single Lesson
          </button>
          <button
            onClick={() => setScheduleType("recurring")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              scheduleType === "recurring" 
                ? "bg-indigo-600 text-white shadow-sm" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Weekly Recurring
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Student Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1.5">
            Student
          </label>
          <select
            value={selectedStudentId || ""}
            onChange={(e) => setSelectedStudentId(e.target.value as Id<"students">)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
          <label className="block text-sm font-medium text-gray-800 mb-1.5">
            Lesson Title
          </label>
          <input
            type="text"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="e.g., Grammar Review, Conversation Practice"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1.5">
            Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
            <option value={120}>2 hours</option>
          </select>
        </div>

        {/* Single Lesson Scheduling */}
        {scheduleType === "single" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getTodayDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Time
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Recurring Lesson Scheduling */}
        {scheduleType === "recurring" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Day of Week
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select day...</option>
                  {dayOptions.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Time
                </label>
                <input
                  type="time"
                  value={recurringTime}
                  onChange={(e) => setRecurringTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Schedule for how many weeks?
              </label>
              <select
                value={weeksAhead}
                onChange={(e) => setWeeksAhead(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={1}>1 week</option>
                <option value={2}>2 weeks</option>
                <option value={4}>4 weeks</option>
                <option value={8}>8 weeks</option>
                <option value={12}>12 weeks</option>
              </select>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={resetForm}
            variant="outline"
            disabled={isScheduling}
            className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
          >
            Clear Form
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!selectedStudentId || !lessonTitle.trim() || isScheduling || 
              (scheduleType === "single" && !selectedDate) ||
              (scheduleType === "recurring" && !selectedDay)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            {isScheduling ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Scheduling...
              </div>
            ) : (
              scheduleType === "single" ? "Schedule Lesson" : `Schedule ${weeksAhead} Lessons`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
