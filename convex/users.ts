import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthenticatedIdentity } from "./auth";

// Create or update user profile
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.union(v.literal("teacher"), v.literal("student"), v.literal("parent"))),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    } else {
      // Create new user (default to teacher role)
      return await ctx.db.insert("users", {
        clerkId: identity.subject,
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        role: "teacher",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      clerkId: v.string(),
      name: v.string(),
      email: v.string(),
      imageUrl: v.optional(v.string()),
      role: v.union(v.literal("teacher"), v.literal("student"), v.literal("parent")),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await requireAuthenticatedIdentity(ctx);
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || user._id !== args.userId) {
      throw new ConvexError("Not found or access denied");
    }
    return user;
  },
});

// Get all users
export const getUsers = query({
  handler: async () => {
    throw new ConvexError("Legacy administrative user listing disabled");
  },
});
