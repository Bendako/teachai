"use client";

import { useState, useMemo } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";

type CalendarViewType = "month" | "week" | "day";
type CalendarSource = "local" | "google" | "both";

interface UnifiedCalendarProps {
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
  source: "local";
}

interface GoogleCalendarEvent {
  id: string;
  title: string;
  start: number;
  end: number;
  description?: string;
  location?: string;
  source: "google";
}

type CalendarEvent = CalendarLesson | GoogleCalendarEvent;

export function UnifiedCalendar({ 
  teacherId, 
  onLessonClick, 
  onDateClick, 
  onCreateLesson 
}: UnifiedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>("month");
  const [calendarSource, setCalendarSource] = useState<CalendarSource>("both");

  
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

  // Fetch local lessons
  const localLessons = useQuery(api.lessons.getLessonsByDateRange, {
    teacherId,
    startDate,
    endDate,
  }) || [];

  // Fetch Google Calendar events (placeholder - implement when API is ready)
  const googleEvents: GoogleCalendarEvent[] = [];

  // Get Google Calendar connection status
  const googleConnection = useQuery(api.googleCalendar.getGoogleCalendarConnection, {
    teacherId,
  });



  // Mutations and Actions
  const syncGoogleCalendar = useAction(api.googleCalendar.syncGoogleCalendar);
  const generateAuthUrl = useAction(api.googleCalendar.generateAuthUrl);

  // Combine events based on selected source
  const allEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];
    
    if (calendarSource === "local" || calendarSource === "both") {
      events.push(...localLessons.map(lesson => ({ ...lesson, source: "local" as const })));
    }
    
    if (calendarSource === "google" || calendarSource === "both") {
      events.push(...googleEvents.map(event => ({ ...event, source: "google" as const })));
    }
    
    return events.sort((a, b) => {
      const aTime = 'scheduledAt' in a ? a.scheduledAt : a.start;
      const bTime = 'scheduledAt' in b ? b.scheduledAt : b.start;
      return aTime - bTime;
    });
  }, [localLessons, googleEvents, calendarSource]);

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



  const handleGoogleCalendarSync = async () => {
    try {
      await syncGoogleCalendar({
        teacherId,
        syncDirection: "both",
      });
    } catch (error) {
      console.error("Failed to sync Google Calendar:", error);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    try {
      const authUrl = await generateAuthUrl({ teacherId });
      window.open(authUrl, "_blank", "width=500,height=600");
    } catch (error) {
      console.error("Failed to generate auth URL:", error);
    }
  };



  const getEventsForDate = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return allEvents.filter(event => {
      const eventTime = 'scheduledAt' in event ? event.scheduledAt : event.start;
      const eventStart = new Date(eventTime);
      return eventStart >= startOfDay && eventStart <= endOfDay;
    });
  };

  const getStatusColor = (event: CalendarEvent) => {
    if (event.source === "google") return "bg-blue-100 text-blue-800 border-blue-200";
    
    const status = 'status' in event ? event.status : "planned";
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-purple-100 text-purple-800 border-purple-200";
    }
  };

  const renderCalendarHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        
        {/* Calendar Source Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setCalendarSource("local")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              calendarSource === "local" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Local
          </button>
          <button
            onClick={() => setCalendarSource("google")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              calendarSource === "google" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Google
          </button>
          <button
            onClick={() => setCalendarSource("both")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              calendarSource === "both" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Both
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Google Calendar Status */}
        {calendarSource === "google" || calendarSource === "both" ? (
          <div className="flex items-center space-x-2">
            {googleConnection ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Connected</span>
                <Button
                  onClick={handleGoogleCalendarSync}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  Sync
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleConnectGoogleCalendar}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                Connect Google Calendar
              </Button>
            )}
          </div>
        ) : null}

        {/* View Type Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewType("month")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewType === "month" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewType("week")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewType === "week" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewType("day")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewType === "day" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Day
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-1">
          <Button
            onClick={() => navigateDate("prev")}
            size="sm"
            variant="outline"
            className="px-2"
          >
            ‹
          </Button>
          <Button
            onClick={goToToday}
            size="sm"
            variant="outline"
            className="px-3"
          >
            Today
          </Button>
          <Button
            onClick={() => navigateDate("next")}
            size="sm"
            variant="outline"
            className="px-2"
          >
            ›
          </Button>
        </div>
      </div>
    </div>
  );

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === month;
          const isToday = date.toDateString() === new Date().toDateString();
          const events = getEventsForDate(date);
          
          return (
            <div
              key={index}
              className={`min-h-[120px] bg-white p-2 ${
                !isCurrentMonth ? "text-gray-400" : ""
              } ${isToday ? "bg-blue-50" : ""}`}
              onClick={() => onDateClick?.(date)}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday ? "text-blue-600" : ""
              }`}>
                {date.getDate()}
              </div>
              
              <div className="space-y-1">
                {events.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                                         className={`text-xs p-1 rounded border cursor-pointer truncate ${
                       getStatusColor(event)
                     }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (event.source === "local") {
                        onLessonClick?.(event._id);
                      }
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {events.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{events.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderCalendarHeader()}
      
      {renderMonthView()}
      
      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {allEvents.length} event{allEvents.length !== 1 ? 's' : ''} in view
        </div>
        
        <Button
          onClick={() => onCreateLesson?.(currentDate, "09:00")}
          className="bg-purple-600 hover:bg-purple-700"
        >
          + Schedule Lesson
        </Button>
      </div>
    </div>
  );
} 