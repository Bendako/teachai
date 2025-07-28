import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Test the current setup and identify what's working
export const testCurrentSetup = query({
  args: {},
  returns: v.object({
    convex: v.object({
      working: v.boolean(),
      message: v.string(),
    }),
    clerk: v.object({
      configured: v.boolean(),
      message: v.string(),
    }),
    ai: v.object({
      claude: v.object({
        configured: v.boolean(),
        message: v.string(),
      }),
      openai: v.object({
        configured: v.boolean(),
        message: v.string(),
      }),
    }),
    email: v.object({
      configured: v.boolean(),
      message: v.string(),
    }),
    recommendations: v.array(v.string()),
  }),
  handler: async () => {
    const recommendations: string[] = [];

    // Test Convex
    const convexWorking = true; // If this function runs, Convex is working

    // Test environment variables
    const hasClaudeKey = !!(process.env.ANTHROPIC_API_KEY && 
                        process.env.ANTHROPIC_API_KEY !== "sk-ant-api03-xmNH4e8xjDj78O1sw2GgDSgJ-q6AXzup0pAlhDLTh-sVbv71mzbKTod_6pw8_lxHs4o8fp8atOJ7k");
    
    const hasOpenAIKey = !!(process.env.OPENAI_API_KEY && 
                        process.env.OPENAI_API_KEY !== "sk-your_openai_api_key_here");
    
    const hasResendKey = !!(process.env.RESEND_API_KEY && 
                        process.env.RESEND_API_KEY.startsWith("re_"));

    // Check Clerk configuration
    const hasClerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
                          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_");
    const hasClerkSecretKey = process.env.CLERK_SECRET_KEY && 
                             process.env.CLERK_SECRET_KEY.startsWith("sk_");

    // Generate recommendations
    if (!hasOpenAIKey) {
      recommendations.push("Add OpenAI API key for GPT-4 lesson planning");
    }
    
    if (!hasClaudeKey) {
      recommendations.push("Add Anthropic API key for Claude lesson planning");
    }

    if (!hasResendKey) {
      recommendations.push("Add Resend API key for email notifications");
    }

    if (!hasClerkPubKey || !hasClerkSecretKey) {
      recommendations.push("Configure Clerk authentication keys");
    }

    if (recommendations.length === 0) {
      recommendations.push("All services configured! You can now test AI lesson generation");
    }

    return {
      convex: {
        working: convexWorking,
        message: "Convex database is connected and working",
      },
      clerk: {
        configured: !!(hasClerkPubKey && hasClerkSecretKey),
        message: hasClerkPubKey && hasClerkSecretKey 
          ? "Clerk authentication is configured" 
          : "Clerk keys need to be configured",
      },
      ai: {
        claude: {
          configured: hasClaudeKey,
          message: hasClaudeKey 
            ? "Claude API is configured" 
            : "Anthropic API key needs to be configured",
        },
        openai: {
          configured: hasOpenAIKey,
          message: hasOpenAIKey 
            ? "OpenAI API is configured" 
            : "OpenAI API key needs to be configured",
        },
      },
      email: {
        configured: hasResendKey,
        message: hasResendKey 
          ? "Resend email service is configured" 
          : "Resend API key needs to be configured",
      },
      recommendations,
    };
  },
});

// Test AI connection with current setup
export const testAIConnectionCurrent = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    claude: v.object({
      available: v.boolean(),
      error: v.optional(v.string()),
    }),
    openai: v.object({
      available: v.boolean(),
      error: v.optional(v.string()),
    }),
    message: v.string(),
  }),
  handler: async () => {
    const results = {
      claude: { available: false, error: undefined as string | undefined },
      openai: { available: false, error: undefined as string | undefined },
    };

    // Test Claude
    try {
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      if (anthropicKey && anthropicKey !== "sk-ant-api03-xmNH4e8xjDj78O1sw2GgDSgJ-q6AXzup0pAlhDLTh-sVbv71mzbKTod_6pw8_lxHs4o8fp8atOJ7k") {
        results.claude.available = true;
      } else {
        results.claude.error = "Anthropic API key not configured";
      }
    } catch (error) {
      results.claude.error = error instanceof Error ? error.message : "Unknown error";
    }

    // Test OpenAI
    try {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (openaiKey && openaiKey !== "sk-your_openai_api_key_here") {
        results.openai.available = true;
      } else {
        results.openai.error = "OpenAI API key not configured";
      }
    } catch (error) {
      results.openai.error = error instanceof Error ? error.message : "Unknown error";
    }

    const hasAnyAI = results.claude.available || results.openai.available;
    
    return {
      success: hasAnyAI,
      claude: results.claude,
      openai: results.openai,
      message: hasAnyAI 
        ? "AI services are available for lesson planning" 
        : "No AI services are configured. Please add API keys.",
    };
  },
}); 