import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table for storing teacher profiles
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("teacher"), v.literal("student"), v.literal("parent")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),
  
  // Students table for storing student profiles and details
  students: defineTable({
    teacherId: v.id("users"), // Which teacher this student belongs to
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    level: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    goals: v.array(v.string()),
    notes: v.optional(v.string()),
    parentInfo: v.optional(v.object({
      name: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      relationship: v.string(),
    })),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_teacher_and_active", ["teacherId", "isActive"])
    .index("by_level", ["level"])
    .index("by_created_at", ["createdAt"]),
  
  // Lessons table for lesson planning and scheduling
  lessons: defineTable({
    teacherId: v.id("users"),
    studentId: v.id("students"),
    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(), // Unix timestamp
    duration: v.number(), // Duration in minutes
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
  })
    .index("by_teacher", ["teacherId"])
    .index("by_student", ["studentId"])
    .index("by_teacher_and_status", ["teacherId", "status"])
    .index("by_scheduled_at", ["scheduledAt"])
    .index("by_student_and_scheduled", ["studentId", "scheduledAt"]),
  
  // Progress table for tracking student progress during lessons
  progress: defineTable({
    lessonId: v.id("lessons"),
    studentId: v.id("students"),
    teacherId: v.id("users"),
    skills: v.object({
      reading: v.number(), // Score 1-10
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
  })
    .index("by_lesson", ["lessonId"])
    .index("by_student", ["studentId"])
    .index("by_teacher", ["teacherId"])
    .index("by_student_and_created", ["studentId", "createdAt"]),
});
