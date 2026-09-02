import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";

const disabled = () => {
  throw new ConvexError("Legacy public setup function disabled");
};

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
  handler: disabled,
});

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
  handler: disabled,
});
