import { ConvexError, v } from "convex/values";

import { mutation } from "./_generated/server";

// Kept as a public compatibility stub so older clients fail closed. Synthetic
// fixtures belong in convex-test or a separately reviewed internal workflow.
export const seedSampleData = mutation({
  args: { teacherId: v.id("users") },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    data: v.object({
      studentsCreated: v.number(),
      lessonsCreated: v.number(),
      progressRecordsCreated: v.number(),
    }),
  }),
  handler: async () => {
    throw new ConvexError("Legacy public seed function disabled");
  },
});
