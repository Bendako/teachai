"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configuration
const AI_CONFIG = {
  primaryProvider: (process.env.AI_PRIMARY_PROVIDER as "openai" | "claude") || "claude",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o",
  claudeModel: process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022",
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || "4000"),
  temperature: parseFloat(process.env.AI_TEMPERATURE || "0.7"),
};

// Types
interface LessonPlanGenerationRequest {
  studentLevel: string;
  focusSkills: string[];
  lessonDuration: number;
  specificGoals: string[];
  additionalContext?: string;
  progressData: {
    recentSkillsAverage: {
      reading: number;
      writing: number;
      speaking: number;
      listening: number;
      grammar: number;
      vocabulary: number;
    };
    weakAreas: string[];
    strongAreas: string[];
    recentTopics: string[];
    totalLessons: number;
  };
}

interface ProgressAnalysisResult {
  studentLevel: string;
  recommendations: {
    focusSkills: string[];
    suggestedActivities: string[];
    difficultyAdjustment: "increase" | "maintain" | "decrease";
  };
  progressTrend: "improving" | "stable" | "declining";
  progressData: {
    recentSkillsAverage: {
      reading: number;
      writing: number;
      speaking: number;
      listening: number;
      grammar: number;
      vocabulary: number;
    };
    weakAreas: string[];
    strongAreas: string[];
    recentTopics: string[];
    totalLessons: number;
  };
}



interface GeneratedLessonPlan {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedDuration: number;
  objectives: string[];
  activities: Array<{
    name: string;
    description: string;
    duration: number;
    materials: string[];
    skillsTargeted: string[];
  }>;
  materials: string[];
  homework?: {
    description: string;
    estimatedTime: number;
    resources: string[];
  };
  assessmentCriteria: string[];
  adaptationNotes: string;
}

// Type for the return value of generateComprehensiveLessonPlan
type GenerateComprehensiveLessonPlanResult = {
  success: boolean;
  generationId?: Id<"ai_generation_history">;
  lessonPlanId?: Id<"ai_lesson_plans">;
  lessonPlan?: GeneratedLessonPlan;
  progressAnalysis?: {
    recommendations: {
      focusSkills: string[];
      suggestedActivities: string[];
      difficultyAdjustment: "increase" | "maintain" | "decrease";
    };
    progressTrend: "improving" | "stable" | "declining";
  };
  error?: string;
};

// Generate comprehensive lesson plan with AI
export const generateComprehensiveLessonPlan = action({
  args: {
    teacherId: v.id("users"),
    studentId: v.id("students"),
    focusSkills: v.optional(v.array(v.string())),
    lessonDuration: v.optional(v.number()),
    specificGoals: v.optional(v.array(v.string())),
    additionalContext: v.optional(v.string()),
    attachedFiles: v.optional(v.array(v.id("_storage"))),
  },
  returns: v.object({
    success: v.boolean(),
    generationId: v.optional(v.id("ai_generation_history")),
    lessonPlanId: v.optional(v.id("ai_lesson_plans")),
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
    })),
    progressAnalysis: v.optional(v.object({
      recommendations: v.object({
        focusSkills: v.array(v.string()),
        suggestedActivities: v.array(v.string()),
        difficultyAdjustment: v.union(v.literal("increase"), v.literal("maintain"), v.literal("decrease")),
      }),
      progressTrend: v.union(v.literal("improving"), v.literal("stable"), v.literal("declining")),
    })),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<GenerateComprehensiveLessonPlanResult> => {
    const startTime = Date.now();
    
    try {
      // Step 1: Get student data
      const student = await ctx.runQuery(api.students.getStudent, {
        studentId: args.studentId,
      });
      
      if (!student) {
        return { success: false, error: "Student not found" };
      }

      // Step 2: Analyze student progress
      const progressAnalysis: ProgressAnalysisResult = await ctx.runQuery(api.progressAnalysis.analyzeStudentProgress, {
        studentId: args.studentId,
        timeframeWeeks: 4,
      });

      // Step 3: Prepare generation parameters
      const focusSkills = args.focusSkills || progressAnalysis.recommendations.focusSkills;
      const lessonDuration = args.lessonDuration || 60; // Default 60 minutes
      const specificGoals = args.specificGoals || [`Improve ${focusSkills.join(" and ")}`];

      // Step 4: Create generation history record
      const generationId: Id<"ai_generation_history"> = await ctx.runMutation(api.aiGeneration.createGenerationHistory, {
        teacherId: args.teacherId,
        studentId: args.studentId,
        aiProvider: AI_CONFIG.primaryProvider,
        model: AI_CONFIG.primaryProvider === "claude" ? AI_CONFIG.claudeModel : AI_CONFIG.openaiModel,
        requestType: "lesson_plan_generation",
        parameters: {
          studentLevel: progressAnalysis.studentLevel,
          focusSkills,
          lessonDuration,
          specificGoals,
          additionalContext: args.additionalContext,
        },
        progressData: progressAnalysis.progressData,
        status: "pending",
      });

      // Step 5: Generate lesson plan with AI
      const request: LessonPlanGenerationRequest = {
        studentLevel: progressAnalysis.studentLevel,
        focusSkills,
        lessonDuration,
        specificGoals,
        additionalContext: args.additionalContext,
        progressData: progressAnalysis.progressData,
      };

      const result = await generateLessonPlanWithAI(request);
      const processingTime = Date.now() - startTime;

      // Step 6: Update generation history with success
      await ctx.runMutation(api.aiGeneration.updateGenerationHistory, {
        generationId,
        response: {
          success: true,
          data: result.lessonPlan,
          tokensUsed: result.tokensUsed,
          processingTime,
        },
        status: "completed",
        aiProvider: result.provider,
      });

      // Step 7: Create AI lesson plan record
      const lessonPlanId: Id<"ai_lesson_plans"> = await ctx.runMutation(api.aiLessonPlans.createAILessonPlan, {
        teacherId: args.teacherId,
        studentId: args.studentId,
        generationId,
        ...result.lessonPlan,
      });

      return {
        success: true,
        generationId,
        lessonPlanId,
        lessonPlan: result.lessonPlan,
        progressAnalysis: {
          recommendations: progressAnalysis.recommendations,
          progressTrend: progressAnalysis.progressTrend,
        },
      };

         } catch (error) {
       const errorMessage = error instanceof Error ? error.message : "Unknown error";
       
       console.error("Comprehensive lesson plan generation failed:", error);
       return {
         success: false,
         error: errorMessage,
       };
     }
  },
});

// Type for the return value of createLessonFromAILessonPlan
type CreateLessonFromAILessonPlanResult = {
  success: boolean;
  lessonId?: Id<"lessons">;
  error?: string;
};

// Convert AI lesson plan to regular lesson
export const createLessonFromAILessonPlan = action({
  args: {
    teacherId: v.id("users"),
    studentId: v.id("students"),
    aiLessonPlanId: v.id("ai_lesson_plans"),
    scheduledAt: v.number(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    lessonId: v.optional(v.id("lessons")),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<CreateLessonFromAILessonPlanResult> => {
    try {
      // Get the AI lesson plan
      const aiLessonPlan = await ctx.runQuery(api.aiLessonPlans.getAILessonPlan, {
        lessonPlanId: args.aiLessonPlanId,
      });

      if (!aiLessonPlan) {
        return { success: false, error: "AI lesson plan not found" };
      }

      // Create regular lesson with AI-generated content
      const lessonId: Id<"lessons"> = await ctx.runMutation(api.lessons.createLesson, {
        teacherId: args.teacherId,
        studentId: args.studentId,
        title: args.title || aiLessonPlan.title,
        description: args.description || aiLessonPlan.description,
        scheduledAt: args.scheduledAt,
        duration: aiLessonPlan.estimatedDuration,
        lessonPlan: {
          objectives: aiLessonPlan.objectives,
          activities: aiLessonPlan.activities.map((activity) => 
             `${activity.name}: ${activity.description} (${activity.duration} min)`
           ),
          materials: aiLessonPlan.materials,
          homework: aiLessonPlan.homework?.description,
        },
      });

      // Mark AI lesson plan as used
      await ctx.runMutation(api.aiLessonPlans.markLessonPlanAsUsed, {
        lessonPlanId: args.aiLessonPlanId,
        lessonId,
      });

      return {
        success: true,
        lessonId,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to create lesson from AI lesson plan:", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

// Type for the return value of batchGenerateLessonPlans
type BatchGenerateLessonPlansResult = {
  success: boolean;
  results: Array<{
    studentId: Id<"students">;
    success: boolean;
    lessonPlanId?: Id<"ai_lesson_plans">;
    error?: string;
  }>;
  totalGenerated: number;
  totalFailed: number;
};

// Batch generate lesson plans for multiple students
export const batchGenerateLessonPlans = action({
  args: {
    teacherId: v.id("users"),
    studentIds: v.array(v.id("students")),
    lessonDuration: v.optional(v.number()),
    additionalContext: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    results: v.array(v.object({
      studentId: v.id("students"),
      success: v.boolean(),
      lessonPlanId: v.optional(v.id("ai_lesson_plans")),
      error: v.optional(v.string()),
    })),
    totalGenerated: v.number(),
    totalFailed: v.number(),
  }),
  handler: async (ctx, args): Promise<BatchGenerateLessonPlansResult> => {
    const results: Array<{
      studentId: Id<"students">;
      success: boolean;
      lessonPlanId?: Id<"ai_lesson_plans">;
      error?: string;
    }> = [];
    let totalGenerated = 0;
    let totalFailed = 0;

    for (const studentId of args.studentIds) {
      try {
        const result: GenerateComprehensiveLessonPlanResult = await ctx.runAction(api.lessonGeneration.generateComprehensiveLessonPlan, {
          teacherId: args.teacherId,
          studentId,
          lessonDuration: args.lessonDuration,
          additionalContext: args.additionalContext,
        });

        if (result.success) {
          totalGenerated++;
          results.push({
            studentId,
            success: true,
            lessonPlanId: result.lessonPlanId,
          });
        } else {
          totalFailed++;
          results.push({
            studentId,
            success: false,
            error: result.error,
          });
        }
      } catch (error) {
        totalFailed++;
        results.push({
          studentId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      success: totalGenerated > 0,
      results,
      totalGenerated,
      totalFailed,
    };
  },
});

// Helper functions for AI generation
function generateLessonPlanPrompt(request: LessonPlanGenerationRequest): string {
  const { studentLevel, focusSkills, lessonDuration, specificGoals, additionalContext, progressData } = request;
  
  return `You are an expert English teacher creating a personalized lesson plan. Generate a comprehensive lesson plan in JSON format.

STUDENT PROFILE:
- Level: ${studentLevel}
- Total lessons completed: ${progressData.totalLessons}
- Focus skills: ${focusSkills.join(", ")}
- Specific goals: ${specificGoals.join(", ")}
- Lesson duration: ${lessonDuration} minutes

CURRENT PROGRESS:
- Reading: ${progressData.recentSkillsAverage.reading}/10
- Writing: ${progressData.recentSkillsAverage.writing}/10
- Speaking: ${progressData.recentSkillsAverage.speaking}/10
- Listening: ${progressData.recentSkillsAverage.listening}/10
- Grammar: ${progressData.recentSkillsAverage.grammar}/10
- Vocabulary: ${progressData.recentSkillsAverage.vocabulary}/10

STRENGTHS: ${progressData.strongAreas.join(", ")}
AREAS FOR IMPROVEMENT: ${progressData.weakAreas.join(", ")}
RECENT TOPICS: ${progressData.recentTopics.join(", ")}

${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ""}

Create a lesson plan that:
1. Focuses on improving weak areas while maintaining strengths
2. Introduces new topics that build on recent learning
3. Includes varied activities that target the focus skills
4. Provides appropriate challenge level for the student
5. Fits within the specified time duration

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Engaging lesson title",
  "description": "Brief lesson overview",
  "difficulty": "${studentLevel}",
  "estimatedDuration": ${lessonDuration},
  "objectives": ["Specific learning objective 1", "Specific learning objective 2"],
  "activities": [
    {
      "name": "Activity name",
      "description": "Detailed activity description with instructions",
      "duration": 15,
      "materials": ["Required material 1", "Required material 2"],
      "skillsTargeted": ["speaking", "listening"]
    }
  ],
  "materials": ["All materials needed for the lesson"],
  "homework": {
    "description": "Homework assignment description",
    "estimatedTime": 20,
    "resources": ["Resource 1", "Resource 2"]
  },
  "assessmentCriteria": ["How to assess student progress"],
  "adaptationNotes": "Notes on how to adapt the lesson based on student response"
}`;
}

async function generateWithOpenAI(prompt: string): Promise<GeneratedLessonPlan> {
  try {
    const response = await openai.chat.completions.create({
      model: AI_CONFIG.openaiModel,
      messages: [
        {
          role: "system",
          content: "You are an expert English teacher. Always respond with valid JSON only, no additional text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    return JSON.parse(content) as GeneratedLessonPlan;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`OpenAI generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function generateWithClaude(prompt: string): Promise<GeneratedLessonPlan> {
  try {
    const response = await anthropic.messages.create({
      model: AI_CONFIG.claudeModel,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
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

    return JSON.parse(content.text) as GeneratedLessonPlan;
  } catch (error) {
    console.error("Claude API error:", error);
    throw new Error(`Claude generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function generateLessonPlanWithAI(request: LessonPlanGenerationRequest): Promise<{
  lessonPlan: GeneratedLessonPlan;
  provider: "openai" | "claude";
  tokensUsed?: number;
}> {
  const prompt = generateLessonPlanPrompt(request);
  
  try {
    if (AI_CONFIG.primaryProvider === "claude") {
      try {
        const lessonPlan = await generateWithClaude(prompt);
        return { lessonPlan, provider: "claude" };
      } catch (error) {
        console.warn("Claude failed, falling back to OpenAI:", error);
        const lessonPlan = await generateWithOpenAI(prompt);
        return { lessonPlan, provider: "openai" };
      }
    } else {
      try {
        const lessonPlan = await generateWithOpenAI(prompt);
        return { lessonPlan, provider: "openai" };
      } catch (error) {
        console.warn("OpenAI failed, falling back to Claude:", error);
        const lessonPlan = await generateWithClaude(prompt);
        return { lessonPlan, provider: "claude" };
      }
    }
  } catch (error) {
    console.error("All AI providers failed:", error);
    throw new Error("AI lesson plan generation failed with all providers");
  }
} 