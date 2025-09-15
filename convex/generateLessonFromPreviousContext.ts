"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { analyzePreviousLessonPerformance, generateEnhancedPrompt, generateWithClaude } from "./lessonHelpers";

// Enhanced lesson generation with previous lesson context
export const generateLessonFromPreviousContext = action({
  args: {
    teacherId: v.id("users"),
    studentId: v.id("students"),
    previousLessonId: v.id("lessons"),
    focusSkills: v.optional(v.array(v.string())),
    lessonDuration: v.optional(v.number()),
    additionalContext: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    lessonPlan: v.optional(v.object({
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
      previousLessonContext: v.object({
        topicsCovered: v.array(v.string()),
        skillsAssessed: v.object({
          reading: v.number(),
          writing: v.number(),
          speaking: v.number(),
          listening: v.number(),
          grammar: v.number(),
          vocabulary: v.number(),
        }),
        areasForImprovement: v.array(v.string()),
        strengths: v.array(v.string()),
        notes: v.string(),
      }),
    })),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      // Step 1: Get previous lesson data using internal function
      const previousLesson = await ctx.runQuery(internal.lessons.internalGetLesson, {
        lessonId: args.previousLessonId,
      });

      if (!previousLesson) {
        return { success: false, error: "Previous lesson not found" };
      }

      // Step 2: Get progress data from previous lesson using internal function
      const previousProgress = await ctx.runQuery(internal.progress.internalGetProgressByLesson, {
        lessonId: args.previousLessonId,
      });

      if (!previousProgress) {
        return { success: false, error: "Previous lesson progress not found" };
      }

      // Step 3: Get student data using internal function
      const student = await ctx.runQuery(internal.students.internalGetStudent, {
        studentId: args.studentId,
      });

      if (!student) {
        return { success: false, error: "Student not found" };
      }

      // Step 4: Analyze previous lesson performance
      const performanceAnalysis = analyzePreviousLessonPerformance(previousProgress);

      // Step 5: Generate enhanced prompt with previous lesson context
      const enhancedPrompt = generateEnhancedPrompt({
        student,
        previousLesson,
        previousProgress,
        performanceAnalysis,
        focusSkills: args.focusSkills,
        lessonDuration: args.lessonDuration || 60,
        additionalContext: args.additionalContext,
      });

      // Step 6: Generate lesson plan with Claude
      const lessonPlan = await generateWithClaude(enhancedPrompt);

      // Step 7: Add previous lesson context to the response
      const enhancedLessonPlan = {
        ...lessonPlan,
        previousLessonContext: {
          topicsCovered: previousProgress.topicsCovered,
          skillsAssessed: previousProgress.skills,
          areasForImprovement: performanceAnalysis.areasForImprovement,
          strengths: performanceAnalysis.strengths,
          notes: previousProgress.notes,
        },
      };

      return {
        success: true,
        lessonPlan: enhancedLessonPlan,
      };

    } catch (error) {
      console.error("Enhanced lesson generation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
}); 