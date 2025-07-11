import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create AI generation history record
export const createGenerationHistory = mutation({
  args: {
    teacherId: v.id("users"),
    studentId: v.id("students"),
    aiProvider: v.union(v.literal("openai"), v.literal("claude")),
    model: v.string(),
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
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
  },
  returns: v.id("ai_generation_history"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("ai_generation_history", {
      teacherId: args.teacherId,
      studentId: args.studentId,
      aiProvider: args.aiProvider,
      model: args.model,
      requestType: args.requestType,
      parameters: args.parameters,
      progressData: args.progressData,
      response: {
        success: false,
        data: undefined,
        error: undefined,
        tokensUsed: undefined,
        processingTime: undefined,
      },
      status: args.status,
      createdAt: Date.now(),
      completedAt: undefined,
    });
  },
});

// Update AI generation history with response
export const updateGenerationHistory = mutation({
  args: {
    generationId: v.id("ai_generation_history"),
    response: v.object({
      success: v.boolean(),
      data: v.optional(v.any()),
      error: v.optional(v.string()),
      tokensUsed: v.optional(v.number()),
      processingTime: v.optional(v.number()),
    }),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    aiProvider: v.optional(v.union(v.literal("openai"), v.literal("claude"))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updates: Record<string, any> = {
      response: args.response,
      status: args.status,
    };

    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = Date.now();
    }

    if (args.aiProvider) {
      updates.aiProvider = args.aiProvider;
    }

    await ctx.db.patch(args.generationId, updates);
  },
});

// Get generation history for a teacher
export const getGenerationHistory = query({
  args: {
    teacherId: v.id("users"),
    limit: v.optional(v.number()),
    requestType: v.optional(v.union(
      v.literal("lesson_plan_generation"),
      v.literal("progress_analysis"),
      v.literal("lesson_adaptation")
    )),
  },
  returns: v.array(v.object({
    _id: v.id("ai_generation_history"),
    _creationTime: v.number(),
    studentId: v.id("students"),
    aiProvider: v.union(v.literal("openai"), v.literal("claude")),
    model: v.string(),
    requestType: v.union(
      v.literal("lesson_plan_generation"),
      v.literal("progress_analysis"),
      v.literal("lesson_adaptation")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const query = ctx.db
      .query("ai_generation_history")
      .withIndex("by_teacher_and_status", (q) => q.eq("teacherId", args.teacherId));

    if (args.requestType) {
      const results = await query.collect();
      return results
        .filter(record => record.requestType === args.requestType)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    }

    return await query
      .order("desc")
      .take(limit);
  },
});

// Get generation statistics for a teacher
export const getGenerationStats = query({
  args: {
    teacherId: v.id("users"),
    timeframeDays: v.optional(v.number()),
  },
  returns: v.object({
    totalGenerations: v.number(),
    successfulGenerations: v.number(),
    failedGenerations: v.number(),
    avgProcessingTime: v.number(),
    totalTokensUsed: v.number(),
    providerUsage: v.object({
      openai: v.number(),
      claude: v.number(),
    }),
    requestTypeBreakdown: v.object({
      lesson_plan_generation: v.number(),
      progress_analysis: v.number(),
      lesson_adaptation: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    const timeframeDays = args.timeframeDays || 30;
    const timeframeCutoff = Date.now() - (timeframeDays * 24 * 60 * 60 * 1000);

    const generations = await ctx.db
      .query("ai_generation_history")
      .withIndex("by_teacher_and_status", (q) => q.eq("teacherId", args.teacherId))
      .filter((q) => q.gte(q.field("createdAt"), timeframeCutoff))
      .collect();

    const stats = {
      totalGenerations: generations.length,
      successfulGenerations: 0,
      failedGenerations: 0,
      avgProcessingTime: 0,
      totalTokensUsed: 0,
      providerUsage: {
        openai: 0,
        claude: 0,
      },
      requestTypeBreakdown: {
        lesson_plan_generation: 0,
        progress_analysis: 0,
        lesson_adaptation: 0,
      },
    };

    let totalProcessingTime = 0;
    let processedCount = 0;

    for (const generation of generations) {
      // Count by status
      if (generation.status === "completed") {
        stats.successfulGenerations++;
      } else if (generation.status === "failed") {
        stats.failedGenerations++;
      }

      // Count by provider
      if (generation.aiProvider === "openai") {
        stats.providerUsage.openai++;
      } else if (generation.aiProvider === "claude") {
        stats.providerUsage.claude++;
      }

      // Count by request type
      stats.requestTypeBreakdown[generation.requestType]++;

      // Processing time and tokens
      if (generation.response.processingTime) {
        totalProcessingTime += generation.response.processingTime;
        processedCount++;
      }
      if (generation.response.tokensUsed) {
        stats.totalTokensUsed += generation.response.tokensUsed;
      }
    }

    stats.avgProcessingTime = processedCount > 0 ? Math.round(totalProcessingTime / processedCount) : 0;

    return stats;
  },
}); 