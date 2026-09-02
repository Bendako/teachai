import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";

const disabled = () => {
  throw new ConvexError("Legacy public test function disabled");
};

export const testFunction = query({
  args: {},
  returns: v.object({
    message: v.string(),
    timestamp: v.number(),
  }),
  handler: disabled,
});

export const testAILessonGenerationIntegration = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    results: v.object({
      teacherCreated: v.boolean(),
      studentCreated: v.boolean(),
      teacherId: v.optional(v.id("users")),
      studentId: v.optional(v.id("students")),
      progressAnalysisWorking: v.boolean(),
      aiLessonPlanFunctionsAvailable: v.boolean(),
      lessonCreationWorking: v.boolean(),
    }),
    message: v.string(),
  }),
  handler: disabled,
});

export const testAIServiceAvailable = query({
  args: {},
  returns: v.object({
    available: v.boolean(),
    message: v.string(),
  }),
  handler: disabled,
});
