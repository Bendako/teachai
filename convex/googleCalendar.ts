import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

// Generate Google OAuth URL (placeholder for now)
export const generateAuthUrl = action({
  args: { teacherId: v.id("users") },
  returns: v.string(),
  handler: async (ctx, args) => {
    // For now, return a placeholder URL
    // In a real implementation, this would generate the actual Google OAuth URL
    const clientId = process.env.GOOGLE_CLIENT_ID || "your_client_id_here";
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";
    
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly'
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&response_type=code` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&state=${encodeURIComponent(args.teacherId)}`;

    return authUrl;
  },
});

// Handle Google OAuth callback and store tokens
export const handleAuthCallback = action({
  args: { 
    code: v.string(),
    teacherId: v.id("users")
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    calendarId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      // For now, simulate a successful connection
      // In a real implementation, this would exchange the code for tokens
      console.log("OAuth callback received for teacher:", args.teacherId);
      return {
        success: true,
        message: "Google Calendar connected successfully! (Demo mode)",
        calendarId: "primary",
      };
    } catch (error) {
      console.error("Google Calendar auth error:", error);
      return {
        success: false,
        message: `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

// Store Google Calendar connection
export const storeGoogleCalendarConnection = mutation({
  args: {
    teacherId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.string(),
    tokenExpiry: v.number(),
    calendarId: v.string(),
  },
  returns: v.id("google_calendar_connections"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if connection already exists
    const existingConnection = await ctx.db
      .query("google_calendar_connections")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .first();

    if (existingConnection) {
      // Update existing connection
      await ctx.db.patch(existingConnection._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        tokenExpiry: args.tokenExpiry,
        calendarId: args.calendarId,
        isActive: true,
        updatedAt: now,
      });
      return existingConnection._id;
    } else {
      // Create new connection
      return await ctx.db.insert("google_calendar_connections", {
        teacherId: args.teacherId,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        tokenExpiry: args.tokenExpiry,
        calendarId: args.calendarId,
        isActive: true,
        syncSettings: {
          syncDirection: "two_way",
          syncLessons: true,
          syncAvailability: true,
          autoSync: true,
          syncInterval: 15, // 15 minutes
        },
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Get Google Calendar connection for a teacher
export const getGoogleCalendarConnection = query({
  args: { teacherId: v.id("users") },
  returns: v.union(
    v.object({
      _id: v.id("google_calendar_connections"),
      teacherId: v.id("users"),
      calendarId: v.optional(v.string()),
      isActive: v.boolean(),
      lastSyncAt: v.optional(v.number()),
      syncSettings: v.optional(v.object({
        syncDirection: v.union(v.literal("one_way"), v.literal("two_way")),
        syncLessons: v.boolean(),
        syncAvailability: v.boolean(),
        autoSync: v.boolean(),
        syncInterval: v.number(),
      })),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("google_calendar_connections")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .first();
  },
});

// Sync Google Calendar events (simplified version)
export const syncGoogleCalendar = action({
  args: { 
    teacherId: v.id("users"),
    syncDirection: v.optional(v.union(v.literal("import"), v.literal("export"), v.literal("both")))
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    eventsProcessed: v.number(),
    eventsCreated: v.number(),
    eventsUpdated: v.number(),
  }),
  handler: async (ctx, args) => {
    try {
      // For now, simulate a successful sync
      // In a real implementation, this would actually sync with Google Calendar
      console.log("Sync requested for teacher:", args.teacherId, "direction:", args.syncDirection || "both");
      
      return {
        success: true,
        message: `Sync completed successfully. Processed 5 events. (Demo mode)`,
        eventsProcessed: 5,
        eventsCreated: 2,
        eventsUpdated: 3,
      };
    } catch (error) {
      console.error("Google Calendar sync error:", error);
      return {
        success: false,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        eventsProcessed: 0,
        eventsCreated: 0,
        eventsUpdated: 0,
      };
    }
  },
});

// Disconnect Google Calendar
export const disconnectGoogleCalendar = mutation({
  args: { teacherId: v.id("users") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const connection = await ctx.db
      .query("google_calendar_connections")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .first();

    if (connection) {
      await ctx.db.patch(connection._id, {
        isActive: false,
        updatedAt: Date.now(),
      });
      return true;
    }
    return false;
  },
});

// Get sync history
export const getSyncHistory = query({
  args: { 
    teacherId: v.id("users"),
    limit: v.optional(v.number())
  },
  returns: v.array(v.object({
    _id: v.id("calendar_sync_history"),
    syncType: v.union(
      v.literal("initial_sync"),
      v.literal("incremental_sync"),
      v.literal("manual_sync"),
      v.literal("error_sync")
    ),
    direction: v.union(v.literal("import"), v.literal("export"), v.literal("both")),
    eventsProcessed: v.number(),
    eventsCreated: v.number(),
    eventsUpdated: v.number(),
    eventsDeleted: v.number(),
    errors: v.optional(v.array(v.string())),
    syncDuration: v.number(),
    status: v.union(v.literal("success"), v.literal("partial"), v.literal("failed")),
    startedAt: v.number(),
    completedAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    return await ctx.db
      .query("calendar_sync_history")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .order("desc")
      .take(limit);
  },
});

// Record sync history
export const recordSyncHistory = mutation({
  args: {
    teacherId: v.id("users"),
    syncType: v.union(
      v.literal("initial_sync"),
      v.literal("incremental_sync"),
      v.literal("manual_sync"),
      v.literal("error_sync")
    ),
    direction: v.union(v.literal("import"), v.literal("export"), v.literal("both")),
    eventsProcessed: v.number(),
    eventsCreated: v.number(),
    eventsUpdated: v.number(),
    eventsDeleted: v.number(),
    errors: v.optional(v.array(v.string())),
    syncDuration: v.number(),
    status: v.union(v.literal("success"), v.literal("partial"), v.literal("failed")),
    startedAt: v.number(),
    completedAt: v.number(),
  },
  returns: v.id("calendar_sync_history"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("calendar_sync_history", args);
  },
}); 