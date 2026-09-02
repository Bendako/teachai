import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import {
  requireActiveWorkspaceMembership,
  requireAuthenticatedIdentity,
} from "./auth";

export const createWorkspace = mutation({
  args: { name: v.string() },
  returns: v.id("workspaces"),
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    const now = Date.now();
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      createdByIdentityId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("memberships", {
      workspaceId,
      memberIdentityId: identity.subject,
      role: "owner",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return workspaceId;
  },
});

export const getWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  returns: v.union(
    v.object({
      _id: v.id("workspaces"),
      _creationTime: v.number(),
      name: v.string(),
      createdByIdentityId: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireActiveWorkspaceMembership(ctx, args.workspaceId);
    return await ctx.db.get(args.workspaceId);
  },
});
