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
    title: v.string(),
    scheduledAt: v.number(),
    duration: v.number(),
    status: v.union(
      v.literal("planned"), 
      v.literal("in_progress"), 
      v.literal("completed"), 
      v.literal("cancelled")
    ),
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