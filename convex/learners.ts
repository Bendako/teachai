import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import {
  requireActiveWorkspaceMembership,
  requireAuthenticatedIdentity,
} from "./auth";

const learnerWriteRoles = ["owner", "admin"] as const;
const learnerReadRoles = ["owner", "admin"] as const;

export const createLearner = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  returns: v.id("learners"),
  handler: async (ctx, args) => {
    const { identity } = await requireActiveWorkspaceMembership(
      ctx,
      args.workspaceId,
      learnerWriteRoles,
    );
    const now = Date.now();

    return await ctx.db.insert("learners", {
      workspaceId: args.workspaceId,
      name: args.name,
      createdByIdentityId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getLearner = query({
  args: {
    learnerId: v.id("learners"),
    workspaceId: v.id("workspaces"),
  },
  returns: v.union(
    v.object({
      _id: v.id("learners"),
      _creationTime: v.number(),
      workspaceId: v.id("workspaces"),
      name: v.string(),
      createdByIdentityId: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireActiveWorkspaceMembership(ctx, args.workspaceId, learnerReadRoles);
    const learner = await ctx.db.get(args.learnerId);
    if (!learner || learner.workspaceId !== args.workspaceId) {
      throw new ConvexError("Not found or access denied");
    }
    return learner;
  },
});
