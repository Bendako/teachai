import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new lesson
export const createLesson = mutation({
  args: {
    teacherId: v.id("users"),
    studentId: v.id("students"),
    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(),
    duration: v.number(),
    lessonPlan: v.optional(v.object({
      objectives: v.array(v.string()),
      activities: v.array(v.string()),
      materials: v.array(v.string()),
      homework: v.optional(v.string()),
    })),
  },
  returns: v.id("lessons"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("lessons", {
      teacherId: args.teacherId,
      studentId: args.studentId,
      title: args.title,
      description: args.description,
      scheduledAt: args.scheduledAt,
      duration: args.duration,
      status: "planned",
      lessonPlan: args.lessonPlan,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get lessons for a teacher
export const getLessonsByTeacher = query({
  args: { 
    teacherId: v.id("users"),
    status: v.optional(v.union(
      v.literal("planned"), 
      v.literal("in_progress"), 
      v.literal("completed"), 
      v.literal("cancelled")
    )),
  },
  returns: v.array(v.object({
    _id: v.id("lessons"),
    _creationTime: v.number(),
    teacherId: v.id("users"),
    studentId: v.id("students"),
    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(),
    duration: v.number(),
    status: v.union(
      v.literal("planned"), 
      v.literal("in_progress"), 
      v.literal("completed"), 
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("lessons")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId));
    
    if (args.status) {
      return await query
        .filter((q) => q.eq(q.field("status"), args.status))
        .order("desc")
        .collect();
    }
    
    return await query.order("desc").collect();
  },
});

// Get lessons for a student
export const getLessonsByStudent = query({
  args: { studentId: v.id("students") },
  returns: v.array(v.object({
    _id: v.id("lessons"),
    _creationTime: v.number(),
    teacherId: v.id("users"),
    studentId: v.id("students"),
    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(),
    duration: v.number(),
    status: v.union(
      v.literal("planned"), 
      v.literal("in_progress"), 
      v.literal("completed"), 
      v.literal("cancelled")
    ),
    lessonPlan: v.optional(v.object({
      objectives: v.array(v.string()),
      activities: v.array(v.string()),
      materials: v.array(v.string()),
      homework: v.optional(v.string()),
    })),
    isAiGenerated: v.optional(v.boolean()),
    aiProvider: v.optional(v.union(v.literal("openai"), v.literal("claude"))),
    generationId: v.optional(v.id("ai_generation_history")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_student_and_scheduled", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .collect();
  },
});

// Update lesson status
export const updateLessonStatus = mutation({
  args: {
    lessonId: v.id("lessons"),
    status: v.union(
      v.literal("planned"), 
      v.literal("in_progress"), 
      v.literal("completed"), 
      v.literal("cancelled")
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.lessonId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

// Get a single lesson
export const getLesson = query({
  args: { lessonId: v.id("lessons") },
  returns: v.union(
    v.object({
      _id: v.id("lessons"),
      _creationTime: v.number(),
      teacherId: v.id("users"),
      studentId: v.id("students"),
      title: v.string(),
      description: v.optional(v.string()),
      scheduledAt: v.number(),
      duration: v.number(),
      status: v.union(
        v.literal("planned"), 
        v.literal("in_progress"), 
        v.literal("completed"), 
        v.literal("cancelled")
      ),
      lessonPlan: v.optional(v.object({
        objectives: v.array(v.string()),
        activities: v.array(v.string()),
        materials: v.array(v.string()),
        homework: v.optional(v.string()),
      })),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lessonId);
  },
}); 

// Get or create a lesson for a student (reuse active lessons)
export const getOrCreateLesson = mutation({
  args: {
    teacherId: v.id("users"),
    studentId: v.id("students"),
    title: v.string(),
    description: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  returns: v.id("lessons"),
  handler: async (ctx, args) => {
    // First, check if there's an existing active lesson (planned or in_progress)
    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_student_and_scheduled", (q) => q.eq("studentId", args.studentId))
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "planned"),
          q.eq(q.field("status"), "in_progress")
        )
      )
      .order("desc")
      .first();

    if (existingLesson) {
      // Update the existing lesson to in_progress if it was planned
      if (existingLesson.status === "planned") {
        await ctx.db.patch(existingLesson._id, {
          status: "in_progress",
          updatedAt: Date.now(),
        });
      }
      return existingLesson._id;
    }

    // No existing active lesson, create a new one
    return await ctx.db.insert("lessons", {
      teacherId: args.teacherId,
      studentId: args.studentId,
      title: args.title,
      description: args.description,
      scheduledAt: Date.now(),
      duration: args.duration || 60,
      status: "in_progress",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
}); 

// Get lessons for a specific date range (for calendar view)
export const getLessonsByDateRange = query({
  args: { 
    teacherId: v.id("users"),
    startDate: v.number(), // Unix timestamp for start of date range
    endDate: v.number(),   // Unix timestamp for end of date range
  },
  returns: v.array(v.object({
    _id: v.id("lessons"),
    _creationTime: v.number(),
    teacherId: v.id("users"),
    studentId: v.id("students"),
    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(),
    duration: v.number(),
    status: v.union(
      v.literal("planned"), 
      v.literal("in_progress"), 
      v.literal("completed"), 
      v.literal("cancelled")
    ),
    lessonPlan: v.optional(v.object({
      objectives: v.array(v.string()),
      activities: v.array(v.string()),
      materials: v.array(v.string()),
      homework: v.optional(v.string()),
    })),
    isAiGenerated: v.optional(v.boolean()),
    aiProvider: v.optional(v.union(v.literal("openai"), v.literal("claude"))),
    generationId: v.optional(v.id("ai_generation_history")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .filter((q) => 
        q.and(
          q.gte(q.field("scheduledAt"), args.startDate),
          q.lte(q.field("scheduledAt"), args.endDate)
        )
      )
      .order("asc")
      .collect();
  },
});

// Get lessons for a specific day
export const getLessonsByDay = query({
  args: { 
    teacherId: v.id("users"),
    date: v.number(), // Unix timestamp for the specific day
  },
  returns: v.array(v.object({
    _id: v.id("lessons"),
    _creationTime: v.number(),
    teacherId: v.id("users"),
    studentId: v.id("students"),
    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(),
    duration: v.number(),
    status: v.union(
      v.literal("planned"), 
      v.literal("in_progress"), 
      v.literal("completed"), 
      v.literal("cancelled")
    ),
    lessonPlan: v.optional(v.object({
      objectives: v.array(v.string()),
      activities: v.array(v.string()),
      materials: v.array(v.string()),
      homework: v.optional(v.string()),
    })),
    isAiGenerated: v.optional(v.boolean()),
    aiProvider: v.optional(v.union(v.literal("openai"), v.literal("claude"))),
    generationId: v.optional(v.id("ai_generation_history")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })),
  handler: async (ctx, args) => {
    // Get start and end of the day
    const startOfDay = new Date(args.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(args.date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await ctx.db
      .query("lessons")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .filter((q) => 
        q.and(
          q.gte(q.field("scheduledAt"), startOfDay.getTime()),
          q.lte(q.field("scheduledAt"), endOfDay.getTime())
        )
      )
      .order("asc")
      .collect();
  },
});

// Update lesson schedule (reschedule)
export const rescheduleLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
    newScheduledAt: v.number(),
    newDuration: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updateData: {
      scheduledAt: number;
      updatedAt: number;
      duration?: number;
    } = {
      scheduledAt: args.newScheduledAt,
      updatedAt: Date.now(),
    };
    
    if (args.newDuration !== undefined) {
      updateData.duration = args.newDuration;
    }
    
    await ctx.db.patch(args.lessonId, updateData);
  },
});

// Check for scheduling conflicts
export const checkSchedulingConflicts = query({
  args: {
    teacherId: v.id("users"),
    scheduledAt: v.number(),
    duration: v.number(),
    excludeLessonId: v.optional(v.id("lessons")), // For rescheduling existing lessons
  },
  returns: v.array(v.object({
    _id: v.id("lessons"),
    title: v.string(),
    scheduledAt: v.number(),
    duration: v.number(),
  })),
  handler: async (ctx, args) => {
    const lessonStart = args.scheduledAt;
    const lessonEnd = args.scheduledAt + (args.duration * 60 * 1000); // Convert minutes to milliseconds
    
    // Query lessons that might conflict
    const existingLessons = await ctx.db
      .query("lessons")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .filter((q) => 
        q.and(
          q.neq(q.field("status"), "cancelled"),
          // Check if the lesson overlaps with our time slot
          q.or(
            // Existing lesson starts during our lesson
            q.and(
              q.gte(q.field("scheduledAt"), lessonStart),
              q.lt(q.field("scheduledAt"), lessonEnd)
            ),
            // Our lesson starts during existing lesson
            q.and(
              q.lte(q.field("scheduledAt"), lessonStart),
              q.gt(
                q.field("scheduledAt"), 
                lessonStart - 60 * 60 * 1000 // Check 1 hour before for potential overlaps
              )
            )
          )
        )
      )
      .collect();

    // Filter out the current lesson if rescheduling
    const conflicts = existingLessons.filter(lesson => {
      if (args.excludeLessonId && lesson._id === args.excludeLessonId) {
        return false;
      }
      
      // Calculate existing lesson end time
      const existingStart = lesson.scheduledAt;
      const existingEnd = lesson.scheduledAt + (lesson.duration * 60 * 1000);
      
      // Check for actual overlap
      return (
        (lessonStart < existingEnd && lessonEnd > existingStart)
      );
    });

    return conflicts.map(lesson => ({
      _id: lesson._id,
      title: lesson.title,
      scheduledAt: lesson.scheduledAt,
      duration: lesson.duration,
    }));
  },
}); 