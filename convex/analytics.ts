import { v } from "convex/values";
import { query } from "./_generated/server";

// Get overall teacher analytics and metrics
export const getTeacherAnalytics = query({
  args: { 
    teacherId: v.id("users"),
    timeRangeWeeks: v.optional(v.number()), // Number of weeks to look back
  },
  returns: v.object({
    totalStudents: v.number(),
    activeStudents: v.number(),
    totalLessons: v.number(),
    completedLessons: v.number(),
    avgSkillImprovement: v.object({
      reading: v.number(),
      writing: v.number(),
      speaking: v.number(),
      listening: v.number(),
      grammar: v.number(),
      vocabulary: v.number(),
    }),
    topTopics: v.array(v.object({
      topic: v.string(),
      count: v.number(),
    })),
    recentActivity: v.array(v.object({
      date: v.number(),
      lessonsCount: v.number(),
    })),
  }),
  handler: async (ctx, args) => {
    const timeFilter = args.timeRangeWeeks 
      ? Date.now() - (args.timeRangeWeeks * 7 * 24 * 60 * 60 * 1000)
      : 0;

    // Get all students for this teacher
    const allStudents = await ctx.db
      .query("students")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .collect();

    const activeStudents = allStudents.filter(s => s.isActive);

    // Get all lessons for this teacher
    const allLessons = await ctx.db
      .query("lessons")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .filter((q) => args.timeRangeWeeks ? q.gte(q.field("scheduledAt"), timeFilter) : true)
      .collect();

    const completedLessons = allLessons.filter(l => l.status === "completed");

    // Get all progress records for analytics
    const allProgress = await ctx.db
      .query("progress")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .filter((q) => args.timeRangeWeeks ? q.gte(q.field("createdAt"), timeFilter) : true)
      .collect();

    // Calculate average skill improvements
    const skillTotals = {
      reading: 0, writing: 0, speaking: 0, 
      listening: 0, grammar: 0, vocabulary: 0
    };
    
    if (allProgress.length > 0) {
      allProgress.forEach(progress => {
        Object.keys(skillTotals).forEach(skill => {
          skillTotals[skill as keyof typeof skillTotals] += 
            progress.skills[skill as keyof typeof progress.skills];
        });
      });

      Object.keys(skillTotals).forEach(skill => {
        skillTotals[skill as keyof typeof skillTotals] = 
          Math.round((skillTotals[skill as keyof typeof skillTotals] / allProgress.length) * 10) / 10;
      });
    }

    // Get most covered topics
    const topicCounts: Record<string, number> = {};
    allProgress.forEach(progress => {
      progress.topicsCovered.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });

    const topTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    // Calculate recent activity (last 7 days)
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const startOfDay = date.getTime();
      const endOfDay = startOfDay + (24 * 60 * 60 * 1000);
      
      const dayLessons = completedLessons.filter(
        lesson => lesson.scheduledAt >= startOfDay && lesson.scheduledAt < endOfDay
      );

      recentActivity.push({
        date: startOfDay,
        lessonsCount: dayLessons.length,
      });
    }

    return {
      totalStudents: allStudents.length,
      activeStudents: activeStudents.length,
      totalLessons: allLessons.length,
      completedLessons: completedLessons.length,
      avgSkillImprovement: skillTotals,
      topTopics,
      recentActivity,
    };
  },
});

// Get skill progression trends for all students over time
export const getSkillProgressionTrends = query({
  args: { 
    teacherId: v.id("users"),
    weeks: v.optional(v.number()),
  },
  returns: v.array(v.object({
    studentId: v.id("students"),
    studentName: v.string(),
    progressData: v.array(v.object({
      date: v.number(),
      skills: v.object({
        reading: v.number(),
        writing: v.number(),
        speaking: v.number(),
        listening: v.number(),
        grammar: v.number(),
        vocabulary: v.number(),
      }),
    })),
  })),
  handler: async (ctx, args) => {
    const timeFilter = args.weeks 
      ? Date.now() - (args.weeks * 7 * 24 * 60 * 60 * 1000)
      : Date.now() - (12 * 7 * 24 * 60 * 60 * 1000); // Default 12 weeks

    // Get active students
    const students = await ctx.db
      .query("students")
      .withIndex("by_teacher_and_active", (q) => 
        q.eq("teacherId", args.teacherId).eq("isActive", true)
      )
      .collect();

    const studentTrends = [];

    for (const student of students) {
      // Get progress records for this student
      const progressRecords = await ctx.db
        .query("progress")
        .withIndex("by_student_and_created", (q) => q.eq("studentId", student._id))
        .filter((q) => q.gte(q.field("createdAt"), timeFilter))
        .order("asc")
        .collect();

      const progressData = progressRecords.map(record => ({
        date: record.createdAt,
        skills: record.skills,
      }));

      if (progressData.length > 0) {
        studentTrends.push({
          studentId: student._id,
          studentName: student.name,
          progressData,
        });
      }
    }

    return studentTrends;
  },
});

// Get comparative student performance data
export const getStudentComparison = query({
  args: { 
    teacherId: v.id("users"),
  },
  returns: v.array(v.object({
    studentId: v.id("students"),
    studentName: v.string(),
    level: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    averageSkills: v.object({
      reading: v.number(),
      writing: v.number(),
      speaking: v.number(),
      listening: v.number(),
      grammar: v.number(),
      vocabulary: v.number(),
    }),
    totalLessons: v.number(),
    improvement: v.object({
      reading: v.number(),
      writing: v.number(),
      speaking: v.number(),
      listening: v.number(),
      grammar: v.number(),
      vocabulary: v.number(),
    }),
    lastLessonDate: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    // Get active students
    const students = await ctx.db
      .query("students")
      .withIndex("by_teacher_and_active", (q) => 
        q.eq("teacherId", args.teacherId).eq("isActive", true)
      )
      .collect();

    const comparisons = [];

    for (const student of students) {
      // Get all progress for this student
      const progressRecords = await ctx.db
        .query("progress")
        .withIndex("by_student", (q) => q.eq("studentId", student._id))
        .order("desc")
        .collect();

      if (progressRecords.length === 0) continue;

      // Calculate averages
      const skillTotals = {
        reading: 0, writing: 0, speaking: 0,
        listening: 0, grammar: 0, vocabulary: 0
      };

      progressRecords.forEach(record => {
        Object.keys(skillTotals).forEach(skill => {
          skillTotals[skill as keyof typeof skillTotals] += 
            record.skills[skill as keyof typeof record.skills];
        });
      });

      const averageSkills = Object.fromEntries(
        Object.entries(skillTotals).map(([skill, total]) => [
          skill, 
          Math.round((total / progressRecords.length) * 10) / 10
        ])
      ) as typeof skillTotals;

      // Calculate improvement (latest - earliest)
      const latestSkills = progressRecords[0].skills;
      const earliestSkills = progressRecords[progressRecords.length - 1].skills;
      
      const improvement = Object.fromEntries(
        Object.keys(skillTotals).map(skill => [
          skill,
          Math.round((latestSkills[skill as keyof typeof latestSkills] - 
                    earliestSkills[skill as keyof typeof earliestSkills]) * 10) / 10
        ])
      ) as typeof skillTotals;

      // Get lesson count
      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_student_and_scheduled", (q) => q.eq("studentId", student._id))
        .collect();

      comparisons.push({
        studentId: student._id,
        studentName: student.name,
        level: student.level,
        averageSkills,
        totalLessons: lessons.length,
        improvement,
        lastLessonDate: progressRecords[0]?.createdAt,
      });
    }

    return comparisons.sort((a, b) => b.totalLessons - a.totalLessons);
  },
}); 

// Get performance insights for dashboard
export const getPerformanceInsights = query({
  args: { teacherId: v.id("users") },
  returns: v.object({
    studentsNeedingAttention: v.array(v.string()),
    upcomingAssessments: v.array(v.string()),
    homeworkCompletionRate: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    // Get all students for this teacher
    const students = await ctx.db
      .query("students")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .collect();

    // Get recent progress for analysis
    const recentProgress = await ctx.db
      .query("progress")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .order("desc")
      .take(50);

    // Analyze students needing attention (simplified logic)
    const studentsNeedingAttention: string[] = [];
    for (const student of students) {
      const studentProgress = recentProgress.filter(p => p.studentId === student._id);
      if (studentProgress.length > 0) {
        const latestProgress = studentProgress[0];
        const avgScore = Object.values(latestProgress.skills).reduce((a, b) => a + b, 0) / 6;
        if (avgScore < 6) {
          studentsNeedingAttention.push(student.name);
        }
      }
    }

    // Get upcoming lessons (simplified as assessments)
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingLessons = await ctx.db
      .query("lessons")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .filter((q) => 
        q.and(
          q.gte(q.field("scheduledAt"), today.getTime()),
          q.lte(q.field("scheduledAt"), nextWeek.getTime())
        )
      )
      .collect();

    const upcomingAssessments = upcomingLessons.map(lesson => lesson.title);

    // Calculate homework completion rate (simplified)
    const homeworkProgress = recentProgress.filter(p => p.homework);
    const completedHomework = homeworkProgress.filter(p => p.homework?.completed);
    const homeworkCompletionRate = homeworkProgress.length > 0 
      ? Math.round((completedHomework.length / homeworkProgress.length) * 100)
      : undefined;

    return {
      studentsNeedingAttention,
      upcomingAssessments,
      homeworkCompletionRate,
    };
  },
}); 