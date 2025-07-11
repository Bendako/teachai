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

type SkillTrendData = {
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
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-700 font-medium">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Insights into your teaching and student progress</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Time Range Filter */}
          <select
            value={timeRange || "all"}
            onChange={(e) => setTimeRange(e.target.value === "all" ? undefined : parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="1">Last Week</option>
            <option value="4">Last Month</option>
            <option value="12">Last 3 Months</option>
            <option value="all">All Time</option>
          </select>
          <Button variant="outline" onClick={onClose} className="font-medium">
            ✕ Close
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Skills Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Average Skills Performance</h3>
        <SkillsOverviewChart skills={analytics.avgSkillImprovement} />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity (Last 7 Days)</h3>
        <ActivityChart data={analytics.recentActivity} />
      </div>

      {/* Student Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Student Performance Comparison</h3>
        <StudentComparisonTable students={studentComparison} />
      </div>

      {/* Top Topics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Most Covered Topics</h3>
        <TopicsChart topics={analytics.topTopics} />
      </div>

      {/* Skills Progression Trends */}
      {skillTrends.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Skills Progression Over Time</h3>
          <SkillProgressionChart trends={skillTrends} />
        </div>
      )}
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
  const trendColors = {
    positive: "bg-green-50 border-green-200",
    negative: "bg-red-50 border-red-200", 
    neutral: "bg-yellow-50 border-yellow-200",
    stable: "bg-blue-50 border-blue-200",
    mixed: "bg-gray-50 border-gray-200"
  };

  return (
    <div className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-md ${trendColors[trend]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="text-3xl">{icon}</div>
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
    <div className="space-y-4">
      {Object.entries(skills).map(([skill, score]) => (
        <div key={skill} className="flex items-center space-x-4">
          <div className="w-24 text-sm font-medium text-gray-700">
            {skillLabels[skill as keyof typeof skillLabels]}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full transition-all duration-500 ${
                score >= 8 ? "bg-green-500" :
                score >= 6 ? "bg-blue-500" :
                score >= 4 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${(score / 10) * 100}%` }}
            />
          </div>
          <div className="w-12 text-sm font-bold text-gray-900">
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
    <div className="space-y-4">
      <div className="flex items-end space-x-2 h-32">
        {data.map((day, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-blue-500 rounded-t-md transition-all duration-300 hover:bg-blue-600"
              style={{ 
                height: maxLessons > 0 ? `${(day.lessonsCount / maxLessons) * 100}%` : "4px",
                minHeight: "4px"
              }}
              title={`${day.lessonsCount} lessons`}
            />
            <div className="text-xs text-gray-600 mt-2">
              {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-gray-500">
        Total: {data.reduce((sum, day) => sum + day.lessonsCount, 0)} lessons this week
      </div>
    </div>
  );
}

function StudentComparisonTable({ students }: { students: StudentComparisonData[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 font-semibold text-gray-900">Student</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-900">Level</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-900">Lessons</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-900">Avg Score</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-900">Best Skill</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-900">Improvement</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            const avgScore = Object.values(student.averageSkills).reduce((a: number, b: number) => a + b, 0) / 6;
            const bestSkill = Object.entries(student.averageSkills)
              .reduce((a, b) => (a[1] as number) > (b[1] as number) ? a : b)[0];
            const totalImprovement = Object.values(student.improvement).reduce((a: number, b: number) => a + b, 0);
            
            return (
              <tr key={student.studentId} className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-gray-50" : ""}`}>
                <td className="py-3 px-2 font-medium text-gray-900">{student.studentName}</td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    student.level === 'beginner' ? 'bg-emerald-50 text-emerald-700' :
                    student.level === 'intermediate' ? 'bg-blue-50 text-blue-700' :
                    'bg-purple-50 text-purple-700'
                  }`}>
                    {student.level}
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-700">{student.totalLessons}</td>
                <td className="py-3 px-2">
                  <span className={`font-semibold ${
                    avgScore >= 8 ? 'text-green-600' :
                    avgScore >= 6 ? 'text-blue-600' :
                    avgScore >= 4 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {avgScore.toFixed(1)}/10
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-700 capitalize">{bestSkill}</td>
                <td className="py-3 px-2">
                  <span className={`font-semibold ${
                    totalImprovement > 0 ? 'text-green-600' :
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
        <div className="text-center py-8 text-gray-500">
          No student data available
        </div>
      )}
    </div>
  );
}

function TopicsChart({ topics }: { topics: Array<{ topic: string; count: number }> }) {
  const maxCount = Math.max(...topics.map(t => t.count));

  return (
    <div className="space-y-3">
      {topics.slice(0, 8).map((topic, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-32 text-sm font-medium text-gray-700 truncate">
            {topic.topic}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div 
              className="h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${(topic.count / maxCount) * 100}%` }}
            />
          </div>
          <div className="w-8 text-sm font-bold text-gray-900">
            {topic.count}
          </div>
        </div>
      ))}
      {topics.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          No topics data available
        </div>
      )}
    </div>
  );
}

function SkillProgressionChart({ trends }: { trends: any[] }) {
  const skills = ["reading", "writing", "speaking", "listening", "grammar", "vocabulary"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Showing progression trends for {trends.length} students over selected time period
      </p>
      
      {skills.map((skill, skillIndex) => (
        <div key={skill} className="space-y-2">
          <h4 className="font-medium text-gray-900 capitalize">
            {skill} Progression
          </h4>
          <div className="relative h-20 bg-gray-50 rounded-lg p-4">
            {trends.map((student, studentIndex) => {
              if (student.progressData.length < 2) return null;
              
              const skillData = student.progressData.map((p: any) => p.skills[skill]);
              const improvement = skillData[skillData.length - 1] - skillData[0];
              
              return (
                <div 
                  key={student.studentId}
                  className="flex items-center space-x-2 mb-1"
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors[studentIndex % colors.length] }}
                  />
                  <span className="text-xs text-gray-700 flex-1">
                    {student.studentName}
                  </span>
                  <span className={`text-xs font-medium ${
                    improvement > 0 ? 'text-green-600' :
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