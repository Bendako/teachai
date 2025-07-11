"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { useState } from "react";

type StudentComparisonData = {
  studentId: Id<"students">;
  studentName: string;
  level: "beginner" | "intermediate" | "advanced";
  averageSkills: {
    reading: number;
    writing: number;
    speaking: number;
    listening: number;
    grammar: number;
    vocabulary: number;
  };
  totalLessons: number;
  improvement: {
    reading: number;
    writing: number;
    speaking: number;
    listening: number;
    grammar: number;
    vocabulary: number;
  };
  lastLessonDate?: number;
};



interface AnalyticsDashboardProps {
  teacherId: Id<"users">;
  onClose: () => void;
}

export function AnalyticsDashboard({ teacherId, onClose }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<number | undefined>(4); // 4 weeks default

  const analytics = useQuery(api.analytics.getTeacherAnalytics, { 
    teacherId,
    timeRangeWeeks: timeRange 
  });
  
  const studentComparison = useQuery(api.analytics.getStudentComparison, { teacherId });
  const skillTrends = useQuery(api.analytics.getSkillProgressionTrends, { 
    teacherId,
    weeks: timeRange || 12 
  });

  if (analytics === undefined || studentComparison === undefined || skillTrends === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
          <span className="text-sm font-medium text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-start pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">Insights into your teaching and student progress</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Time Range Filter */}
          <select
            value={timeRange || "all"}
            onChange={(e) => setTimeRange(e.target.value === "all" ? undefined : parseInt(e.target.value))}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
          >
            <option value="1">Last Week</option>
            <option value="4">Last Month</option>
            <option value="12">Last 3 Months</option>
            <option value="all">All Time</option>
          </select>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="text-xs font-medium px-3 py-1.5 h-auto bg-white hover:bg-gray-50 border-gray-200"
          >
            <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Students"
          value={analytics.totalStudents.toString()}
          subtitle={`${analytics.activeStudents} active`}
          icon="users"
          trend={analytics.activeStudents === analytics.totalStudents ? "stable" : "mixed"}
        />
        <MetricCard
          title="Lessons Completed"
          value={analytics.completedLessons.toString()}
          subtitle={`of ${analytics.totalLessons} total`}
          icon="book"
          trend="positive"
        />
        <MetricCard
          title="Avg Speaking Score"
          value={analytics.avgSkillImprovement.speaking.toString()}
          subtitle="out of 10"
          icon="microphone"
          trend={analytics.avgSkillImprovement.speaking >= 7 ? "positive" : 
                 analytics.avgSkillImprovement.speaking >= 5 ? "neutral" : "negative"}
        />
        <MetricCard
          title="Top Topic"
          value={analytics.topTopics[0]?.topic || "No data"}
          subtitle={analytics.topTopics[0] ? `${analytics.topTopics[0].count} times` : ""}
          icon="edit"
          trend="stable"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Average Skills Performance</h3>
          <SkillsOverviewChart skills={analytics.avgSkillImprovement} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity (Last 7 Days)</h3>
          <ActivityChart data={analytics.recentActivity} />
        </div>
      </div>

      {/* Student Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Student Performance Comparison</h3>
        <StudentComparisonTable students={studentComparison} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Topics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Most Covered Topics</h3>
          <TopicsChart topics={analytics.topTopics} />
        </div>

        {/* Skills Progression Trends */}
        {skillTrends.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Skills Progression Over Time</h3>
            <SkillProgressionChart trends={skillTrends} />
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, trend }: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  trend: "positive" | "negative" | "neutral" | "stable" | "mixed";
}) {
  const trendStyles = {
    positive: "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200",
    negative: "bg-gradient-to-br from-red-50 to-red-100 border-red-200", 
    neutral: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
    stable: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
    mixed: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
  };

  const iconMap = {
    users: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    book: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    microphone: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    edit: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  };

  return (
    <div className={`rounded-lg p-4 border transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${trendStyles[trend]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-lg font-bold text-gray-900 mb-0.5">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="text-gray-600 opacity-70">
          {iconMap[icon as keyof typeof iconMap]}
        </div>
      </div>
    </div>
  );
}

function SkillsOverviewChart({ skills }: { skills: Record<string, number> }) {
  const skillLabels = {
    reading: "Reading",
    writing: "Writing",
    speaking: "Speaking",
    listening: "Listening",
    grammar: "Grammar",
    vocabulary: "Vocabulary",
  };

  return (
    <div className="space-y-3">
      {Object.entries(skills).map(([skill, score]) => (
        <div key={skill} className="flex items-center space-x-3">
          <div className="w-16 text-xs font-medium text-gray-700">
            {skillLabels[skill as keyof typeof skillLabels]}
          </div>
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-700 ${
                score >= 8 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" :
                score >= 6 ? "bg-gradient-to-r from-blue-400 to-blue-500" :
                score >= 4 ? "bg-gradient-to-r from-amber-400 to-amber-500" : "bg-gradient-to-r from-red-400 to-red-500"
              }`}
              style={{ width: `${(score / 10) * 100}%` }}
            />
          </div>
          <div className="w-8 text-xs font-bold text-gray-900">
            {score}/10
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityChart({ data }: { data: Array<{ date: number; lessonsCount: number }> }) {
  const maxLessons = Math.max(...data.map(d => d.lessonsCount));

  return (
    <div className="space-y-3">
      <div className="flex items-end space-x-1.5 h-24">
        {data.map((day, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-gradient-to-t from-indigo-400 to-indigo-500 rounded-t transition-all duration-300 hover:from-indigo-500 hover:to-indigo-600"
              style={{ 
                height: maxLessons > 0 ? `${(day.lessonsCount / maxLessons) * 100}%` : "2px",
                minHeight: "2px"
              }}
              title={`${day.lessonsCount} lessons`}
            />
            <div className="text-xs text-gray-500 mt-1.5">
              {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center text-xs text-gray-500">
        Total: {data.reduce((sum, day) => sum + day.lessonsCount, 0)} lessons this week
      </div>
    </div>
  );
}

function StudentComparisonTable({ students }: { students: StudentComparisonData[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 px-2 font-semibold text-gray-900">Student</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-900">Level</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-900">Lessons</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-900">Avg Score</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-900">Best Skill</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-900">Improvement</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            const avgScore = Object.values(student.averageSkills).reduce((a: number, b: number) => a + b, 0) / 6;
            const bestSkill = Object.entries(student.averageSkills)
              .reduce((a, b) => (a[1] as number) > (b[1] as number) ? a : b)[0];
            const totalImprovement = Object.values(student.improvement).reduce((a: number, b: number) => a + b, 0);
            
            return (
              <tr key={student.studentId} className={`border-b border-gray-50 hover:bg-gray-25 transition-colors ${index % 2 === 0 ? "bg-gray-25" : ""}`}>
                <td className="py-2 px-2 font-medium text-gray-900">{student.studentName}</td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    student.level === 'beginner' ? 'bg-emerald-100 text-emerald-700' :
                    student.level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {student.level}
                  </span>
                </td>
                <td className="py-2 px-2 text-gray-700">{student.totalLessons}</td>
                <td className="py-2 px-2">
                  <span className={`font-semibold ${
                    avgScore >= 8 ? 'text-emerald-600' :
                    avgScore >= 6 ? 'text-blue-600' :
                    avgScore >= 4 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {avgScore.toFixed(1)}/10
                  </span>
                </td>
                <td className="py-2 px-2 text-gray-700 capitalize">{bestSkill}</td>
                <td className="py-2 px-2">
                  <span className={`font-semibold ${
                    totalImprovement > 0 ? 'text-emerald-600' :
                    totalImprovement < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {totalImprovement > 0 ? '+' : ''}{totalImprovement.toFixed(1)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {students.length === 0 && (
        <div className="text-center py-6 text-xs text-gray-500">
          No student data available
        </div>
      )}
    </div>
  );
}

function TopicsChart({ topics }: { topics: Array<{ topic: string; count: number }> }) {
  const maxCount = Math.max(...topics.map(t => t.count));

  return (
    <div className="space-y-2.5">
      {topics.slice(0, 6).map((topic, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className="w-20 text-xs font-medium text-gray-700 truncate">
            {topic.topic}
          </div>
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div 
              className="h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(topic.count / maxCount) * 100}%` }}
            />
          </div>
          <div className="w-6 text-xs font-bold text-gray-900">
            {topic.count}
          </div>
        </div>
      ))}
      {topics.length === 0 && (
        <div className="text-center py-4 text-xs text-gray-500">
          No topics data available
        </div>
      )}
    </div>
  );
}

function SkillProgressionChart({ trends }: { 
  trends: Array<{
    studentId: Id<"students">;
    studentName: string;
    progressData: Array<{
      date: number;
      skills: {
        reading: number;
        writing: number;
        speaking: number;
        listening: number;
        grammar: number;
        vocabulary: number;
      };
    }>;
  }>
}) {
  const skills = ["reading", "writing", "speaking", "listening", "grammar", "vocabulary"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Showing progression trends for {trends.length} students over selected time period
      </p>
      
      {skills.slice(0, 4).map((skill) => (
        <div key={skill} className="space-y-1.5">
          <h4 className="text-xs font-medium text-gray-900 capitalize">
            {skill} Progression
          </h4>
          <div className="relative bg-gray-50 rounded-lg p-3">
            {trends.slice(0, 4).map((student, studentIndex) => {
              if (student.progressData.length < 2) return null;
              
              const skillData = student.progressData.map((p) => p.skills[skill as keyof typeof p.skills]);
              const improvement = skillData[skillData.length - 1] - skillData[0];
              
              return (
                <div 
                  key={student.studentId}
                  className="flex items-center space-x-2 mb-1"
                >
                  <div 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: colors[studentIndex % colors.length] }}
                  />
                  <span className="text-xs text-gray-700 flex-1 truncate">
                    {student.studentName}
                  </span>
                  <span className={`text-xs font-medium ${
                    improvement > 0 ? 'text-emerald-600' :
                    improvement < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
} 