"use node";

import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// Lazy initialization of AI clients to prevent deployment errors
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('placeholder') || apiKey.includes('place')) {
    throw new Error("OPENAI_API_KEY is not configured or is placeholder");
  }
  return new OpenAI({ apiKey });
}

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey });
}

// Configuration
const AI_CONFIG = {
  primaryProvider: (process.env.AI_PRIMARY_PROVIDER as "openai" | "claude") || "claude",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o",
  claudeModel: process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022",
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || "4000"),
  temperature: parseFloat(process.env.AI_TEMPERATURE || "0.7"),
};

// Types for AI responses
export interface LessonPlanGenerationRequest {
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

export interface GeneratedLessonPlan {
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

// Generate system prompt for lesson plan generation
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

// Call OpenAI API
async function generateWithOpenAI(prompt: string): Promise<GeneratedLessonPlan> {
  try {
    const openai = getOpenAIClient();
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

    // Parse JSON response
    const lessonPlan = JSON.parse(content) as GeneratedLessonPlan;
    return lessonPlan;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`OpenAI generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// Call Anthropic Claude API
async function generateWithClaude(prompt: string): Promise<GeneratedLessonPlan> {
  try {
    const anthropic = getAnthropicClient();
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

    // Parse JSON response
    const lessonPlan = JSON.parse(content.text) as GeneratedLessonPlan;
    return lessonPlan;
  } catch (error) {
    console.error("Claude API error:", error);
    throw new Error(`Claude generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// Main AI generation function with fallback
async function generateLessonPlanWithAI(request: LessonPlanGenerationRequest): Promise<{
  lessonPlan: GeneratedLessonPlan;
  provider: "openai" | "claude";
  tokensUsed?: number;
}> {
  const prompt = generateLessonPlanPrompt(request);
  
  try {
    // Try primary provider first
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

// Simplified AI lesson plan generation (without database dependencies)
export const generateAILessonPlanSimple = action({
  args: {
    studentLevel: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    focusSkills: v.array(v.string()),
    lessonDuration: v.number(),
    specificGoals: v.array(v.string()),
    additionalContext: v.optional(v.string()),
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
    })),
    provider: v.optional(v.union(v.literal("openai"), v.literal("claude"))),
    error: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    try {
      // Generate lesson plan with AI
      const request: LessonPlanGenerationRequest = {
        studentLevel: args.studentLevel,
        focusSkills: args.focusSkills,
        lessonDuration: args.lessonDuration,
        specificGoals: args.specificGoals,
        additionalContext: args.additionalContext,
        progressData: args.progressData,
      };

      const result = await generateLessonPlanWithAI(request);

      return {
        success: true,
        lessonPlan: result.lessonPlan,
        provider: result.provider,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      console.error("AI lesson plan generation failed:", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

// Generate upload URL for file attachments
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Get file URL for viewing uploaded files
export const getFileUrl = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Test AI connection
export const testAIConnection = action({
  args: {},
  returns: v.object({
    openai: v.object({
      available: v.boolean(),
      error: v.optional(v.string()),
    }),
    claude: v.object({
      available: v.boolean(),
      error: v.optional(v.string()),
    }),
  }),
  handler: async () => {
    const results = {
      openai: { available: false, error: undefined as string | undefined },
      claude: { available: false, error: undefined as string | undefined },
    };

    // Test OpenAI
    try {
      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5,
      });
      results.openai.available = !!response.choices[0]?.message?.content;
    } catch (error) {
      results.openai.error = error instanceof Error ? error.message : "Unknown error";
    }

    // Test Claude
    try {
      const anthropic = getAnthropicClient();
      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 5,
        messages: [{ role: "user", content: "Hello" }],
      });
      results.claude.available = response.content.length > 0;
    } catch (error) {
      results.claude.error = error instanceof Error ? error.message : "Unknown error";
    }

    return results;
  },
}); 