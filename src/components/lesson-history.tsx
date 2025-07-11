"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";

type LessonHistoryItem = {
  lessonId: Id<"lessons">;
  lessonTitle: string;
  lessonDate: number;
  lessonDuration: number;
  lessonStatus: "planned" | "in_progress" | "completed" | "cancelled";
  progressId?: Id<"progress">;
  skills?: {
    reading: number;
    writing: number;
    speaking: number;
    listening: number;
    grammar: number;
    vocabulary: number;
  };
  topicsCovered?: string[];
  notes?: string;
  homework?: {
    assigned: string;
    completed: boolean;
    feedback?: string;
  };
  progressCreatedAt?: number;
};

interface LessonHistoryProps {
  studentId: Id<"students">;
  studentName: string;
  onClose: () => void;
}

export function LessonHistory({ studentId, studentName, onClose }: LessonHistoryProps) {
  const lessonHistory = useQuery(api.progress.getLessonHistoryByStudent, { 
    studentId,
    limit: 10 
  });

  if (lessonHistory === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-700 font-medium">Loading lesson history...</span>
      </div>
    );
  }

  const completedLessons = lessonHistory.filter(lesson => lesson.lessonStatus === "completed");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{studentName}&apos;s Lesson History</h2>
          <p className="text-gray-600 mt-1">{completedLessons.length} completed lessons</p>
        </div>
        <Button variant="outline" onClick={onClose} className="font-medium">
          ✕ Close
        </Button>
      </div>

      {/* Skills Progress Overview */}
      {completedLessons.length > 1 && (
        <SkillsProgressChart lessons={completedLessons} />
      )}

      {/* Lesson Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Lesson Timeline</h3>
        
        {lessonHistory.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No lessons yet</h4>
                         <p className="text-gray-600">This student hasn&apos;t had any lessons yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessonHistory.map((lesson, index) => (
              <LessonCard 
                key={lesson.lessonId} 
                lesson={lesson} 
                isLatest={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface LessonCardProps {
  lesson: LessonHistoryItem;
  isLatest: boolean;
}

function LessonCard({ lesson, isLatest }: LessonCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: "bg-green-50 text-green-700 border-green-200",
      in_progress: "bg-blue-50 text-blue-700 border-blue-200",
      planned: "bg-gray-50 text-gray-700 border-gray-200",
      cancelled: "bg-red-50 text-red-700 border-red-200"
    };
    
    return badges[status as keyof typeof badges] || badges.planned;
  };

  const hasProgressData = lesson.skills && lesson.progressId;

  return (
    <div className={`border rounded-xl p-6 bg-white transition-all duration-200 ${
      isLatest 
        ? "border-blue-200 bg-blue-50/30 shadow-md" 
        : "border-gray-200 hover:border-gray-300 shadow-sm"
    }`}>
      {/* Lesson Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{lesson.lessonTitle}</h4>
          <p className="text-sm text-gray-600">{formatDate(lesson.lessonDate)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(lesson.lessonStatus)}`}>
            {lesson.lessonStatus.replace('_', ' ').toUpperCase()}
          </span>
          {isLatest && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Latest
            </span>
          )}
        </div>
      </div>

      {hasProgressData ? (
        <div className="space-y-4">
          {/* Skills Assessment */}
          <div>
            <h5 className="font-medium text-gray-900 mb-3">Skills Assessment</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                             {lesson.skills && Object.entries(lesson.skills).map(([skill, value]) => (
                 <SkillMiniBar key={skill} skill={skill} value={value as number} />
               ))}
            </div>
          </div>

          {/* Topics Covered */}
          {lesson.topicsCovered && lesson.topicsCovered.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Topics Covered</h5>
              <div className="flex flex-wrap gap-2">
                {lesson.topicsCovered.map((topic: string, index: number) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {lesson.notes && lesson.notes.trim() && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Lesson Notes</h5>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {lesson.notes}
              </p>
            </div>
          )}

          {/* Homework */}
          {lesson.homework && lesson.homework.assigned && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Homework</h5>
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">{lesson.homework.assigned}</p>
                <div className="flex items-center text-xs">
                  <span className={`px-2 py-1 rounded-full font-medium ${
                    lesson.homework.completed 
                      ? "bg-green-100 text-green-700" 
                      : "bg-orange-100 text-orange-700"
                  }`}>
                    {lesson.homework.completed ? "✓ Completed" : "⏳ Pending"}
                  </span>
                  {lesson.homework.feedback && (
                    <span className="ml-2 text-gray-600">• {lesson.homework.feedback}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No progress data recorded for this lesson</p>
        </div>
      )}
    </div>
  );
}

function SkillMiniBar({ skill, value }: { skill: string; value: number }) {
  const skillLabels = {
    reading: "📖 Reading",
    writing: "✍️ Writing", 
    speaking: "🗣️ Speaking",
    listening: "👂 Listening",
    grammar: "📝 Grammar",
    vocabulary: "📚 Vocabulary",
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return "bg-red-200 text-red-800";
    if (score <= 5) return "bg-yellow-200 text-yellow-800";
    if (score <= 7) return "bg-blue-200 text-blue-800";
    return "bg-green-200 text-green-800";
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
      <span className="text-xs font-medium text-gray-700">
        {skillLabels[skill as keyof typeof skillLabels]}
      </span>
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(value)}`}>
        {value}/10
      </span>
    </div>
  );
}

function SkillsProgressChart({ lessons }: { lessons: LessonHistoryItem[] }) {
  // Get lessons with skills data, sorted chronologically (oldest first for chart)
  const lessonsWithSkills = lessons
    .filter(lesson => lesson.skills)
    .reverse()
    .slice(-5); // Show last 5 lessons

  if (lessonsWithSkills.length < 2) return null;

  const skills = ["reading", "writing", "speaking", "listening", "grammar", "vocabulary"];
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Progress Overview</h3>
      <div className="space-y-3">
        {skills.map(skill => (
          <SkillProgressLine 
            key={skill} 
            skill={skill} 
            lessons={lessonsWithSkills} 
          />
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-600 flex items-center justify-between">
        <span>Oldest</span>
        <span>→ Progress Direction →</span>
        <span>Most Recent</span>
      </div>
    </div>
  );
}

function SkillProgressLine({ skill, lessons }: { skill: string; lessons: LessonHistoryItem[] }) {
  const skillLabels = {
    reading: "📖 Reading",
    writing: "✍️ Writing",
    speaking: "🗣️ Speaking", 
    listening: "👂 Listening",
    grammar: "📝 Grammar",
    vocabulary: "📚 Vocabulary",
  };

  const values = lessons.map(lesson => lesson.skills?.[skill as keyof typeof lesson.skills] || 0);
  const trend = values[values.length - 1] - values[0]; // Latest - Earliest

  return (
    <div className="flex items-center space-x-3">
      <div className="w-24 text-xs font-medium text-gray-700">
        {skillLabels[skill as keyof typeof skillLabels]}
      </div>
      <div className="flex-1 flex items-center space-x-1">
        {values.map((value, index) => (
          <div key={index} className="flex-1 flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  value <= 3 ? "bg-red-400" :
                  value <= 5 ? "bg-yellow-400" :
                  value <= 7 ? "bg-blue-400" : "bg-green-400"
                }`}
                style={{ width: `${(value / 10) * 100}%` }}
              />
            </div>
            <span className="ml-1 text-xs font-medium text-gray-600 w-6">
              {value}
            </span>
          </div>
        ))}
      </div>
      <div className={`text-xs font-bold px-2 py-1 rounded-full ${
        trend > 0 ? "bg-green-100 text-green-700" :
        trend < 0 ? "bg-red-100 text-red-700" :
        "bg-gray-100 text-gray-700"
      }`}>
        {trend > 0 ? `+${trend}` : trend === 0 ? "=" : trend}
      </div>
    </div>
  );
} 