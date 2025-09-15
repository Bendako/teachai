"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { analyzePreviousLessonPerformance } from "./lessonHelpers";

// Get previous lessons for context
export const getPreviousLessonsForContext = action({
  args: {
    studentId: v.id("students"),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    lessons: v.optional(v.array(v.object({
      lessonId: v.id("lessons"),
      title: v.string(),
      scheduledAt: v.number(),
      topicsCovered: v.array(v.string()),
      skillsAssessed: v.object({
        reading: v.number(),
        writing: v.number(),
        speaking: v.number(),
        listening: v.number(),
        grammar: v.number(),
        vocabulary: v.number(),
      }),
      notes: v.string(),
      performance: v.object({
        averageScore: v.number(),
        areasForImprovement: v.array(v.string()),
        strengths: v.array(v.string()),
        overallPerformance: v.string(),
      }),
    }))),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { api } = (await import("./_generated/api")) as any;
      const limit = args.limit || 5;

      // Get recent completed lessons
      const recentLessons = await ctx.runQuery(api.lessons.getLessonsByStudent, {
        studentId: args.studentId,
      });

      const completedLessons = recentLessons
        .filter((lesson: { status: "planned" | "in_progress" | "completed" | "cancelled" }) => lesson.status === "completed")
        .slice(0, limit);

      const lessonsWithContext: Array<{
        lessonId: Id<"lessons">;
        title: string;
        scheduledAt: number;
        topicsCovered: string[];
        skillsAssessed: {
          reading: number;
          writing: number;
          speaking: number;
          listening: number;
          grammar: number;
          vocabulary: number;
        };
        notes: string;
        performance: {
          averageScore: number;
          areasForImprovement: string[];
          strengths: string[];
          overallPerformance: string;
        };
      }> = [];

      for (const lesson of completedLessons) {
        const progress = await ctx.runQuery(api.progress.getProgressByLesson, {
          lessonId: lesson._id,
        });

        if (progress) {
          const performance = analyzePreviousLessonPerformance(progress);
          
          lessonsWithContext.push({
            lessonId: lesson._id,
            title: lesson.title,
            scheduledAt: lesson.scheduledAt,
            topicsCovered: progress.topicsCovered,
            skillsAssessed: progress.skills,
            notes: progress.notes,
            performance,
          });
        }
      }

      return {
        success: true,
        lessons: lessonsWithContext,
      };

    } catch (error) {
      console.error("Failed to get previous lessons:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
}); 