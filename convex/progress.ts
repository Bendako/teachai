import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new progress record for a lesson
export const createProgress = mutation({
  args: {
    lessonId: v.id("lessons"),
    studentId: v.id("students"),
    teacherId: v.id("users"),
    skills: v.object({
      reading: v.number(),
      writing: v.number(),
      speaking: v.number(),
      listening: v.number(),
      grammar: v.number(),
      vocabulary: v.number(),
    }),
    topicsCovered: v.array(v.string()),
    notes: v.string(),
    homework: v.optional(v.object({
      assigned: v.string(),
      completed: v.boolean(),
      feedback: v.optional(v.string()),
    })),
  },
  returns: v.id("progress"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("progress", {
      lessonId: args.lessonId,
      studentId: args.studentId,
      teacherId: args.teacherId,
      skills: args.skills,
      topicsCovered: args.topicsCovered,
      notes: args.notes,
      homework: args.homework,
      createdAt: Date.now(),
    });
  },
});

// Update progress during a lesson
export const updateProgress = mutation({
  args: {
    progressId: v.id("progress"),
    skills: v.optional(v.object({
      reading: v.number(),
      writing: v.number(),
      speaking: v.number(),
      listening: v.number(),
      grammar: v.number(),
      vocabulary: v.number(),
    })),
    topicsCovered: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    homework: v.optional(v.object({
      assigned: v.string(),
      completed: v.boolean(),
      feedback: v.optional(v.string()),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { progressId, ...updates } = args;
    
    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(progressId, cleanUpdates);
    }
  },
});

// Get progress for a specific lesson
export const getProgressByLesson = query({
  args: { lessonId: v.id("lessons") },
  returns: v.union(
    v.object({
      _id: v.id("progress"),
      _creationTime: v.number(),
      lessonId: v.id("lessons"),
      studentId: v.id("students"),
      teacherId: v.id("users"),
      skills: v.object({
        reading: v.number(),
        writing: v.number(),
        speaking: v.number(),
        listening: v.number(),
        grammar: v.number(),
        vocabulary: v.number(),
      }),
      topicsCovered: v.array(v.string()),
      notes: v.string(),
      homework: v.optional(v.object({
        assigned: v.string(),
        completed: v.boolean(),
        feedback: v.optional(v.string()),
      })),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("progress")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .unique();
  },
});

// Get all progress for a student (progress history)
export const getProgressByStudent = query({
  args: { 
    studentId: v.id("students"),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("progress"),
    _creationTime: v.number(),
    lessonId: v.id("lessons"),
    skills: v.object({
      reading: v.number(),
      writing: v.number(),
      speaking: v.number(),
      listening: v.number(),
      grammar: v.number(),
      vocabulary: v.number(),
    }),
    topicsCovered: v.array(v.string()),
    notes: v.string(),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("progress")
      .withIndex("by_student_and_created", (q) => q.eq("studentId", args.studentId))
      .order("desc");
    
    if (args.limit) {
      return await query.take(args.limit);
    }
    
    return await query.collect();
  },
});

// Get progress summary for a teacher (all students)
export const getProgressSummaryByTeacher = query({
  args: { teacherId: v.id("users") },
  returns: v.array(v.object({
    _id: v.id("progress"),
    _creationTime: v.number(),
    studentId: v.id("students"),
    lessonId: v.id("lessons"),
    skills: v.object({
      reading: v.number(),
      writing: v.number(),
      speaking: v.number(),
      listening: v.number(),
      grammar: v.number(),
      vocabulary: v.number(),
    }),
    topicsCovered: v.array(v.string()),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("progress")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .order("desc")
      .take(50); // Limit to recent 50 progress records
  },
});

// Calculate average skills for a student
export const getStudentSkillsAverage = query({
  args: { studentId: v.id("students") },
  returns: v.object({
    reading: v.number(),
    writing: v.number(),
    speaking: v.number(),
    listening: v.number(),
    grammar: v.number(),
    vocabulary: v.number(),
    totalSessions: v.number(),
  }),
  handler: async (ctx, args) => {
    const progressRecords = await ctx.db
      .query("progress")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    if (progressRecords.length === 0) {
      return {
        reading: 0,
        writing: 0,
        speaking: 0,
        listening: 0,
        grammar: 0,
        vocabulary: 0,
        totalSessions: 0,
      };
    }

    const skillsSum = progressRecords.reduce(
      (acc, record) => ({
        reading: acc.reading + record.skills.reading,
        writing: acc.writing + record.skills.writing,
        speaking: acc.speaking + record.skills.speaking,
        listening: acc.listening + record.skills.listening,
        grammar: acc.grammar + record.skills.grammar,
        vocabulary: acc.vocabulary + record.skills.vocabulary,
      }),
      { reading: 0, writing: 0, speaking: 0, listening: 0, grammar: 0, vocabulary: 0 }
    );

    const count = progressRecords.length;

    return {
      reading: Math.round((skillsSum.reading / count) * 10) / 10,
      writing: Math.round((skillsSum.writing / count) * 10) / 10,
      speaking: Math.round((skillsSum.speaking / count) * 10) / 10,
      listening: Math.round((skillsSum.listening / count) * 10) / 10,
      grammar: Math.round((skillsSum.grammar / count) * 10) / 10,
      vocabulary: Math.round((skillsSum.vocabulary / count) * 10) / 10,
      totalSessions: count,
    };
  },
}); 

// Get lesson history with progress data for a student
export const getLessonHistoryByStudent = query({
  args: { 
    studentId: v.id("students"),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    // Lesson data
    lessonId: v.id("lessons"),
    lessonTitle: v.string(),
    lessonDate: v.number(),
    lessonDuration: v.number(),
    lessonStatus: v.union(
      v.literal("planned"), 
      v.literal("in_progress"), 
      v.literal("completed"), 
      v.literal("cancelled")
    ),
    
    // Progress data (optional if no progress recorded)
    progressId: v.optional(v.id("progress")),
    skills: v.optional(v.object({
      reading: v.number(),
      writing: v.number(),
      speaking: v.number(),
      listening: v.number(),
      grammar: v.number(),
      vocabulary: v.number(),
    })),
    topicsCovered: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    homework: v.optional(v.object({
      assigned: v.string(),
      completed: v.boolean(),
      feedback: v.optional(v.string()),
    })),
    progressCreatedAt: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    // Get all lessons for the student, ordered by most recent first
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_student_and_scheduled", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .take(args.limit || 20);

    // For each lesson, try to find corresponding progress data
    const lessonHistory = [];
    
    for (const lesson of lessons) {
      const progress = await ctx.db
        .query("progress")
        .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
        .unique();

      lessonHistory.push({
        // Lesson data
        lessonId: lesson._id,
        lessonTitle: lesson.title,
        lessonDate: lesson.scheduledAt,
        lessonDuration: lesson.duration,
        lessonStatus: lesson.status,
        
        // Progress data (if exists)
        progressId: progress?._id,
        skills: progress?.skills,
        topicsCovered: progress?.topicsCovered,
        notes: progress?.notes,
        homework: progress?.homework,
        progressCreatedAt: progress?.createdAt,
      });
    }

    return lessonHistory;
  },
}); 

// Get recent progress for dashboard
export const getRecentProgress = query({
  args: { teacherId: v.id("users") },
  returns: v.array(v.object({
    _id: v.id("progress"),
    _creationTime: v.number(),
    studentName: v.string(),
    lessonTitle: v.string(),
    skills: v.object({
      reading: v.number(),
      writing: v.number(),
      speaking: v.number(),
      listening: v.number(),
      grammar: v.number(),
      vocabulary: v.number(),
    }),
  })),
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("progress")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .order("desc")
      .take(10);

    // Get student and lesson names for each progress record
    const progressWithNames = await Promise.all(
      progress.map(async (prog) => {
        const student = await ctx.db.get(prog.studentId);
        const lesson = await ctx.db.get(prog.lessonId);
        return {
          _id: prog._id,
          _creationTime: prog._creationTime,
          studentName: student?.name || "Unknown Student",
          lessonTitle: lesson?.title || "Unknown Lesson",
          skills: prog.skills,
        };
      })
    );

    return progressWithNames;
  },
}); 