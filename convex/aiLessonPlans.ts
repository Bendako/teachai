import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create AI lesson plan record
export const createAILessonPlan = mutation({
  args: {
    teacherId: v.id("users"),
    studentId: v.id("students"),
    generationId: v.id("ai_generation_history"),
    title: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    estimatedDuration: v.number(),
    objectives: v.array(v.string()),
    activities: v.array(v.object({
      name: v.string(),
      description: v.string(),
      duration: v.number(),
      materials: v.array(v.string()),
      skillsTargeted: v.array(v.string()),
    })),
    materials: v.array(v.string()),
    homework: v.optional(v.object({
      description: v.string(),
      estimatedTime: v.number(),
      resources: v.array(v.string()),
    })),
    assessmentCriteria: v.array(v.string()),
    adaptationNotes: v.string(),
  },
  returns: v.id("ai_lesson_plans"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("ai_lesson_plans", {
      teacherId: args.teacherId,
      studentId: args.studentId,
      generationId: args.generationId,
      title: args.title,
      description: args.description,
      difficulty: args.difficulty,
      estimatedDuration: args.estimatedDuration,
      objectives: args.objectives,
      activities: args.activities,
      materials: args.materials,
      homework: args.homework,
      assessmentCriteria: args.assessmentCriteria,
      adaptationNotes: args.adaptationNotes,
      isUsed: false,
      usedInLessonId: undefined,
      teacherFeedback: undefined,
      createdAt: Date.now(),
    });
  },
});

// Get AI lesson plans for a teacher
export const getAILessonPlans = query({
  args: {
    teacherId: v.id("users"),
    studentId: v.optional(v.id("students")),
    isUsed: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("ai_lesson_plans"),
    _creationTime: v.number(),
    studentId: v.id("students"),
    title: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    estimatedDuration: v.number(),
    objectives: v.array(v.string()),
    activities: v.array(v.object({
      name: v.string(),
      description: v.string(),
      duration: v.number(),
      materials: v.array(v.string()),
      skillsTargeted: v.array(v.string()),
    })),
    materials: v.array(v.string()),
    homework: v.optional(v.object({
      description: v.string(),
      estimatedTime: v.number(),
      resources: v.array(v.string()),
    })),
    assessmentCriteria: v.array(v.string()),
    adaptationNotes: v.string(),
    isUsed: v.boolean(),
    usedInLessonId: v.optional(v.id("lessons")),
    teacherFeedback: v.optional(v.object({
      rating: v.number(),
      comments: v.string(),
      improvements: v.array(v.string()),
    })),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    let query = ctx.db
      .query("ai_lesson_plans")
      .withIndex("by_teacher_and_student", (q) => q.eq("teacherId", args.teacherId));

    if (args.studentId) {
      query = query.filter((q) => q.eq(q.field("studentId"), args.studentId));
    }

    if (args.isUsed !== undefined) {
      query = query.filter((q) => q.eq(q.field("isUsed"), args.isUsed));
    }

    return await query
      .order("desc")
      .take(limit);
  },
});

// Get a specific AI lesson plan
export const getAILessonPlan = query({
  args: { lessonPlanId: v.id("ai_lesson_plans") },
  returns: v.union(
    v.object({
      _id: v.id("ai_lesson_plans"),
      _creationTime: v.number(),
      teacherId: v.id("users"),
      studentId: v.id("students"),
      generationId: v.id("ai_generation_history"),
      title: v.string(),
      description: v.string(),
      difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
      estimatedDuration: v.number(),
      objectives: v.array(v.string()),
      activities: v.array(v.object({
        name: v.string(),
        description: v.string(),
        duration: v.number(),
        materials: v.array(v.string()),
        skillsTargeted: v.array(v.string()),
      })),
      materials: v.array(v.string()),
      homework: v.optional(v.object({
        description: v.string(),
        estimatedTime: v.number(),
        resources: v.array(v.string()),
      })),
      assessmentCriteria: v.array(v.string()),
      adaptationNotes: v.string(),
      isUsed: v.boolean(),
      usedInLessonId: v.optional(v.id("lessons")),
      teacherFeedback: v.optional(v.object({
        rating: v.number(),
        comments: v.string(),
        improvements: v.array(v.string()),
      })),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lessonPlanId);
  },
});

// Mark AI lesson plan as used in a lesson
export const markLessonPlanAsUsed = mutation({
  args: {
    lessonPlanId: v.id("ai_lesson_plans"),
    lessonId: v.id("lessons"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.lessonPlanId, {
      isUsed: true,
      usedInLessonId: args.lessonId,
    });
  },
});

// Add teacher feedback to AI lesson plan
export const addTeacherFeedback = mutation({
  args: {
    lessonPlanId: v.id("ai_lesson_plans"),
    feedback: v.object({
      rating: v.number(),
      comments: v.string(),
      improvements: v.array(v.string()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.lessonPlanId, {
      teacherFeedback: args.feedback,
    });
  },
});

// Get AI lesson plan usage statistics
export const getLessonPlanStats = query({
  args: {
    teacherId: v.id("users"),
    timeframeDays: v.optional(v.number()),
  },
  returns: v.object({
    totalGenerated: v.number(),
    totalUsed: v.number(),
    usageRate: v.number(),
    avgRating: v.number(),
    difficultyBreakdown: v.object({
      beginner: v.number(),
      intermediate: v.number(),
      advanced: v.number(),
    }),
    topSkillsTargeted: v.array(v.string()),
    avgDuration: v.number(),
  }),
  handler: async (ctx, args) => {
    const timeframeDays = args.timeframeDays || 30;
    const timeframeCutoff = Date.now() - (timeframeDays * 24 * 60 * 60 * 1000);

    const lessonPlans = await ctx.db
      .query("ai_lesson_plans")
      .withIndex("by_teacher_and_used", (q) => q.eq("teacherId", args.teacherId))
      .filter((q) => q.gte(q.field("createdAt"), timeframeCutoff))
      .collect();

    const stats = {
      totalGenerated: lessonPlans.length,
      totalUsed: 0,
      usageRate: 0,
      avgRating: 0,
      difficultyBreakdown: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
      },
      topSkillsTargeted: [] as string[],
      avgDuration: 0,
    };

    if (lessonPlans.length === 0) {
      return stats;
    }

    let totalRating = 0;
    let ratedCount = 0;
    let totalDuration = 0;
    const skillCounts: Record<string, number> = {};

    for (const plan of lessonPlans) {
      // Count used plans
      if (plan.isUsed) {
        stats.totalUsed++;
      }

      // Count by difficulty
      stats.difficultyBreakdown[plan.difficulty]++;

      // Collect ratings
      if (plan.teacherFeedback?.rating) {
        totalRating += plan.teacherFeedback.rating;
        ratedCount++;
      }

      // Collect durations
      totalDuration += plan.estimatedDuration;

      // Collect skills
      for (const activity of plan.activities) {
        for (const skill of activity.skillsTargeted) {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        }
      }
    }

    stats.usageRate = Math.round((stats.totalUsed / stats.totalGenerated) * 100);
    stats.avgRating = ratedCount > 0 ? Math.round((totalRating / ratedCount) * 10) / 10 : 0;
    stats.avgDuration = Math.round(totalDuration / lessonPlans.length);

    // Get top 5 skills
    const sortedSkills = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([skill]) => skill);
    stats.topSkillsTargeted = sortedSkills;

    return stats;
  },
});

// Get unused AI lesson plans for a student (suggestions)
export const getUnusedLessonPlansForStudent = query({
  args: {
    teacherId: v.id("users"),
    studentId: v.id("students"),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("ai_lesson_plans"),
    title: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    estimatedDuration: v.number(),
    objectives: v.array(v.string()),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const plans = await ctx.db
      .query("ai_lesson_plans")
      .withIndex("by_teacher_and_student", (q) => 
        q.eq("teacherId", args.teacherId).eq("studentId", args.studentId)
      )
      .filter((q) => q.eq(q.field("isUsed"), false))
      .order("desc")
      .take(limit);

    return plans.map(plan => ({
      _id: plan._id,
      title: plan.title,
      description: plan.description,
      difficulty: plan.difficulty,
      estimatedDuration: plan.estimatedDuration,
      objectives: plan.objectives,
      createdAt: plan.createdAt,
    }));
  },
}); 