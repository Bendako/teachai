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
    // AI generation metadata
    isAiGenerated: v.optional(v.boolean()),
    aiProvider: v.optional(v.union(v.literal("openai"), v.literal("claude"))),
    generationId: v.optional(v.id("ai_generation_history")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_student", ["studentId"])
    .index("by_teacher_and_status", ["teacherId", "status"])
    .index("by_scheduled_at", ["scheduledAt"])
    .index("by_student_and_scheduled", ["studentId", "scheduledAt"])
    .index("by_generation_id", ["generationId"]),
  
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

  // AI-generated lesson plans with enhanced details
  ai_lesson_plans: defineTable({
    teacherId: v.id("users"),
    studentId: v.id("students"),
    generationId: v.id("ai_generation_history"),
    title: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    estimatedDuration: v.number(), // Duration in minutes
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
      rating: v.number(), // 1-5 scale
      comments: v.string(),
      improvements: v.array(v.string()),
    })),
    createdAt: v.number(),
  })
    .index("by_teacher_and_student", ["teacherId", "studentId"])
    .index("by_generation_id", ["generationId"])
    .index("by_teacher_and_used", ["teacherId", "isUsed"])
    .index("by_student_and_created", ["studentId", "createdAt"]),

  // AI generation history and metadata
  ai_generation_history: defineTable({
    teacherId: v.id("users"),
    studentId: v.id("students"),
    aiProvider: v.union(v.literal("openai"), v.literal("claude")),
    model: v.string(), // e.g., "gpt-4", "claude-3-sonnet"
    requestType: v.union(
      v.literal("lesson_plan_generation"),
      v.literal("progress_analysis"),
      v.literal("lesson_adaptation")
    ),
    parameters: v.object({
      studentLevel: v.string(),
      focusSkills: v.array(v.string()),
      lessonDuration: v.number(),
      specificGoals: v.array(v.string()),
      additionalContext: v.optional(v.string()),
    }),
    progressData: v.object({
      recentSkillsAverage: v.object({
        reading: v.number(),
        writing: v.number(),
        speaking: v.number(),
        listening: v.number(),
        grammar: v.number(),
        vocabulary: v.number(),
      }),
      weakAreas: v.array(v.string()),
      strongAreas: v.array(v.string()),
      recentTopics: v.array(v.string()),
      totalLessons: v.number(),
    }),
    response: v.object({
      success: v.boolean(),
      data: v.optional(v.any()), // The AI response data
      error: v.optional(v.string()),
      tokensUsed: v.optional(v.number()),
      processingTime: v.optional(v.number()),
    }),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_teacher_and_student", ["teacherId", "studentId"])
    .index("by_teacher_and_status", ["teacherId", "status"])
    .index("by_ai_provider", ["aiProvider"])
    .index("by_request_type", ["requestType"])
    .index("by_created_at", ["createdAt"]),

  // Student analysis for AI context
  student_analysis: defineTable({
    studentId: v.id("students"),
    teacherId: v.id("users"),
    analysisType: v.union(
      v.literal("progress_summary"),
      v.literal("learning_patterns"),
      v.literal("skill_assessment")
    ),
    analysis: v.object({
      overallProgress: v.string(),
      strengthsIdentified: v.array(v.string()),
      areasForImprovement: v.array(v.string()),
      learningStyle: v.optional(v.string()),
      motivationFactors: v.array(v.string()),
      recommendedFocus: v.array(v.string()),
      nextLevelReadiness: v.boolean(),
    }),
    dataPoints: v.object({
      lessonsAnalyzed: v.number(),
      timeframeWeeks: v.number(),
      averageSkillScores: v.object({
        reading: v.number(),
        writing: v.number(),
        speaking: v.number(),
        listening: v.number(),
        grammar: v.number(),
        vocabulary: v.number(),
      }),
      progressTrend: v.union(v.literal("improving"), v.literal("stable"), v.literal("declining")),
    }),
    generatedBy: v.union(v.literal("openai"), v.literal("claude")),
    createdAt: v.number(),
    validUntil: v.number(), // Timestamp when analysis expires
  })
    .index("by_student_and_teacher", ["studentId", "teacherId"])
    .index("by_student_and_type", ["studentId", "analysisType"])
    .index("by_teacher_and_created", ["teacherId", "createdAt"])
    .index("by_valid_until", ["validUntil"]),
});
