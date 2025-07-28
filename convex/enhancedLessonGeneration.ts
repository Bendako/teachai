"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Analyze previous lesson performance
function analyzePreviousLessonPerformance(progress: {
  skills: {
    reading: number;
    writing: number;
    speaking: number;
    listening: number;
    grammar: number;
    vocabulary: number;
  };
}) {
  const skills = progress.skills;
  const skillEntries = Object.entries(skills) as [string, number][];
  
  // Find areas for improvement (scores < 7)
  const areasForImprovement = skillEntries
    .filter(([, score]) => score < 7)
    .map(([skill]) => skill);

  // Find strengths (scores >= 8)
  const strengths = skillEntries
    .filter(([, score]) => score >= 8)
    .map(([skill]) => skill);

  // Calculate average score
  const averageScore = skillEntries.reduce((sum, [, score]) => sum + score, 0) / skillEntries.length;

  return {
    areasForImprovement,
    strengths,
    averageScore,
    overallPerformance: averageScore >= 8 ? "excellent" : averageScore >= 6 ? "good" : "needs_improvement",
  };
}

// Generate enhanced prompt with previous lesson context
function generateEnhancedPrompt({
  student,
  previousLesson,
  previousProgress,
  performanceAnalysis,
  focusSkills,
  lessonDuration,
  additionalContext,
}: {
  student: { name: string; level: string };
  previousLesson: { title: string; scheduledAt: number };
  previousProgress: { topicsCovered: string[]; skills: { reading: number; writing: number; speaking: number; listening: number; grammar: number; vocabulary: number }; notes: string };
  performanceAnalysis: { areasForImprovement: string[]; strengths: string[]; overallPerformance: string };
  focusSkills?: string[];
  lessonDuration: number;
  additionalContext?: string;
}) {
  const previousLessonDate = new Date(previousLesson.scheduledAt).toLocaleDateString();
  
  return `You are an expert English teacher creating a follow-up lesson plan. Generate a comprehensive lesson plan in JSON format that builds upon the previous lesson.

STUDENT PROFILE:
- Name: ${student.name}
- Level: ${student.level}
- Previous lesson date: ${previousLessonDate}

PREVIOUS LESSON CONTEXT:
- Title: ${previousLesson.title}
- Topics covered: ${previousProgress.topicsCovered.join(", ")}
- Skills assessed:
  - Reading: ${previousProgress.skills.reading}/10
  - Writing: ${previousProgress.skills.writing}/10
  - Speaking: ${previousProgress.skills.speaking}/10
  - Listening: ${previousProgress.skills.listening}/10
  - Grammar: ${previousProgress.skills.grammar}/10
  - Vocabulary: ${previousProgress.skills.vocabulary}/10

PERFORMANCE ANALYSIS:
- Areas for improvement: ${performanceAnalysis.areasForImprovement.join(", ")}
- Strengths: ${performanceAnalysis.strengths.join(", ")}
- Overall performance: ${performanceAnalysis.overallPerformance}
- Teacher's notes: ${previousProgress.notes}

CURRENT LESSON REQUIREMENTS:
- Focus skills: ${focusSkills?.join(", ") || "Based on areas for improvement"}
- Lesson duration: ${lessonDuration} minutes
${additionalContext ? `- Additional context: ${additionalContext}` : ""}

Create a lesson plan that:
1. Builds upon the topics covered in the previous lesson
2. Focuses on improving the identified weak areas
3. Maintains and reinforces the student's strengths
4. Introduces new concepts that naturally follow from previous learning
5. Provides appropriate challenge level for the student
6. Includes activities that target the focus skills
7. Fits within the specified time duration

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Engaging lesson title that references previous learning",
  "description": "Brief lesson overview that connects to previous lesson",
  "difficulty": "${student.level}",
  "estimatedDuration": ${lessonDuration},
  "objectives": [
    "Objective 1 that builds on previous lesson",
    "Objective 2 that addresses weak areas",
    "Objective 3 that introduces new concepts"
  ],
  "activities": [
    {
      "name": "Activity name",
      "description": "Detailed activity description",
      "duration": 15,
      "materials": ["Material 1", "Material 2"],
      "skillsTargeted": ["reading", "speaking"]
    }
  ],
  "materials": ["Material 1", "Material 2", "Material 3"],
  "homework": {
    "description": "Homework that reinforces today's learning",
    "estimatedTime": 20,
    "resources": ["Resource 1", "Resource 2"]
  },
  "assessmentCriteria": [
    "Criterion 1",
    "Criterion 2",
    "Criterion 3"
  ],
  "adaptationNotes": "Notes on how to adapt this lesson based on student progress"
}`;
}

// Generate lesson plan with Claude
async function generateWithClaude(prompt: string) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Invalid response type from Claude");
    }

    return JSON.parse(content.text);
  } catch (error) {
    console.error("Claude API error:", error);
    throw new Error(`Claude generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

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
      const limit = args.limit || 5;

      // Get recent completed lessons
      const recentLessons = await ctx.runQuery(api.lessons.getLessonsByStudent, {
        studentId: args.studentId,
      });

      const completedLessons = recentLessons
        .filter(lesson => lesson.status === "completed")
        .slice(0, limit);

      const lessonsWithContext = [];

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
      // Step 1: Get previous lesson data
      const previousLesson = await ctx.runQuery(api.lessons.getLesson, {
        lessonId: args.previousLessonId,
      });

      if (!previousLesson) {
        return { success: false, error: "Previous lesson not found" };
      }

      // Step 2: Get progress data from previous lesson
      const previousProgress = await ctx.runQuery(api.progress.getProgressByLesson, {
        lessonId: args.previousLessonId,
      });

      if (!previousProgress) {
        return { success: false, error: "Previous lesson progress not found" };
      }

      // Step 3: Get student data
      const student = await ctx.runQuery(api.students.getStudent, {
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

