import { v } from "convex/values";
import { query } from "./_generated/server";

// Simple test function to verify deployment works
export const testFunction = query({
  args: {},
  returns: v.object({
    message: v.string(),
    timestamp: v.number(),
  }),
  handler: async () => {
    return {
      message: "Test function is working!",
      timestamp: Date.now(),
    };
  },
}); 