// @vitest-environment edge-runtime
/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { makeFunctionReference } from "convex/server";
import { describe, expect, it } from "vitest";

import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { api } from "./_generated/api";

const modules = import.meta.glob("./**/*.ts");
const makeTest = () => convexTest(schema, modules);

const createStudent = makeFunctionReference<
  "mutation",
  {
    teacherId: Id<"users">;
    name: string;
    level: "beginner" | "intermediate" | "advanced";
    goals: string[];
  },
  Id<"students">
>("students:createStudent");
const getStudent = makeFunctionReference<
  "query",
  { studentId: Id<"students"> },
  unknown
>("students:getStudent");
const createUser = makeFunctionReference<
  "mutation",
  {
    clerkId: string;
    name: string;
    email: string;
    role?: "teacher" | "student" | "parent";
  },
  Id<"users">
>("users:createUser");
const getUsers = makeFunctionReference<"query", Record<string, never>, unknown[]>(
  "users:getUsers",
);
const seedSampleData = makeFunctionReference<
  "mutation",
  { teacherId: Id<"users"> },
  unknown
>("seedData:seedSampleData");
const testIntegration = makeFunctionReference<
  "mutation",
  Record<string, never>,
  unknown
>("test:testAILessonGenerationIntegration");
const testSetup = makeFunctionReference<
  "query",
  Record<string, never>,
  unknown
>("testSetup:testCurrentSetup");
const getLessonsByStudent = makeFunctionReference<
  "query",
  { studentId: Id<"students"> },
  unknown[]
>("lessons:getLessonsByStudent");
const updateLessonStatus = makeFunctionReference<
  "mutation",
  { lessonId: Id<"lessons">; status: "planned" | "in_progress" | "completed" | "cancelled" },
  null
>("lessons:updateLessonStatus");
const getLesson = makeFunctionReference<
  "query",
  { lessonId: Id<"lessons"> },
  unknown
>("lessons:getLesson");
const generateLessonFromPreviousContext = makeFunctionReference<
  "action",
  {
    teacherId: Id<"users">;
    studentId: Id<"students">;
    previousLessonId: Id<"lessons">;
  },
  { success: boolean; error?: string }
>("generateLessonFromPreviousContext:generateLessonFromPreviousContext");
const getProgressByLesson = makeFunctionReference<
  "query",
  { lessonId: Id<"lessons"> },
  unknown
>("progress:getProgressByLesson");
const updateProgress = makeFunctionReference<
  "mutation",
  { progressId: Id<"progress">; notes?: string },
  null
>("progress:updateProgress");
const generateUploadUrl = makeFunctionReference<"mutation", Record<string, never>, string>(
  "files:generateUploadUrl",
);
const getGoogleCalendarConnection = makeFunctionReference<
  "query",
  { teacherId: Id<"users"> },
  unknown
>("googleCalendar:getGoogleCalendarConnection");
const storeGoogleCalendarConnection = makeFunctionReference<
  "mutation",
  {
    teacherId: Id<"users">;
    accessToken: string;
    refreshToken: string;
    tokenExpiry: number;
    calendarId: string;
  },
  Id<"google_calendar_connections">
>("googleCalendar:storeGoogleCalendarConnection");

async function insertLegacyUser(
  t: ReturnType<typeof makeTest>,
  clerkId: string,
) {
  return await t.run(async (ctx) => {
    const now = Date.now();
    return await ctx.db.insert("users", {
      name: `Synthetic ${clerkId}`,
      email: `${clerkId}@example.test`,
      clerkId,
      role: "teacher",
      createdAt: now,
      updatedAt: now,
    });
  });
}

const syntheticStudent = {
  name: "Synthetic Legacy Student",
  level: "beginner" as const,
  goals: ["Synthetic goal"],
};

describe("legacy public boundary containment", () => {
  it("denies unauthenticated and cross-identity legacy Lesson access and writes", async () => {
    const t = makeTest();
    const ownerId = await insertLegacyUser(t, "clerk_lesson_owner");
    const studentId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("students", {
        teacherId: ownerId,
        name: "Synthetic Legacy Student",
        level: "beginner",
        goals: ["Synthetic goal"],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    });
    const lessonId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("lessons", {
        teacherId: ownerId,
        studentId,
        title: "Synthetic Legacy Lesson",
        scheduledAt: now,
        duration: 60,
        status: "planned",
        createdAt: now,
        updatedAt: now,
      });
    });
    const attacker = t.withIdentity({ subject: "clerk_lesson_attacker" });
    await insertLegacyUser(t, "clerk_lesson_attacker");

    await expect(t.query(getLessonsByStudent, { studentId })).rejects.toThrow("Unauthenticated");
    await expect(attacker.query(getLessonsByStudent, { studentId })).rejects.toThrow("Not found or access denied");
    await expect(attacker.mutation(updateLessonStatus, { lessonId, status: "cancelled" })).rejects.toThrow("Not found or access denied");
    await expect(t.run(async (ctx) => (await ctx.db.get(lessonId))?.status)).resolves.toBe("planned");
  });

  it("authenticates before revealing whether a legacy Lesson exists", async () => {
    const t = makeTest();
    const ownerId = await insertLegacyUser(t, "clerk_auth_order_owner");
    const studentId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("students", {
        teacherId: ownerId,
        name: "Synthetic Auth Order Student",
        level: "beginner",
        goals: ["Synthetic goal"],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    });
    const lessonId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("lessons", {
        teacherId: ownerId,
        studentId,
        title: "Synthetic Auth Order Lesson",
        scheduledAt: now,
        duration: 60,
        status: "planned",
        createdAt: now,
        updatedAt: now,
      });
    });

    await expect(t.query(getLesson, { lessonId })).rejects.toThrow("Unauthenticated");
    await t.run(async (ctx) => {
      await ctx.db.delete(lessonId);
    });
    await expect(
      t.query(getLesson, { lessonId }),
    ).rejects.toThrow("Unauthenticated");
  });

  it("rejects unauthenticated lesson generation before protected lookup", async () => {
    const t = makeTest();
    const ownerId = await insertLegacyUser(t, "clerk_generation_owner");
    const studentId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("students", {
        teacherId: ownerId,
        name: "Synthetic Generation Student",
        level: "beginner",
        goals: ["Synthetic goal"],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    });
    const lessonId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("lessons", {
        teacherId: ownerId,
        studentId,
        title: "Synthetic Generation Lesson",
        scheduledAt: now,
        duration: 60,
        status: "planned",
        createdAt: now,
        updatedAt: now,
      });
    });

    await expect(
      t.action(generateLessonFromPreviousContext, {
        teacherId: ownerId,
        studentId,
        previousLessonId: lessonId,
      }),
    ).resolves.toMatchObject({ success: false, error: "Unauthenticated" });
  });

  it("contains Progress, Files, and Google Calendar boundaries", async () => {
    const t = makeTest();
    const ownerId = await insertLegacyUser(t, "clerk_surface_owner");
    const attackerId = await insertLegacyUser(t, "clerk_surface_attacker");
    const fixture = await t.run(async (ctx) => {
      const now = Date.now();
      const studentId = await ctx.db.insert("students", {
        teacherId: ownerId,
        name: "Synthetic Surface Student",
        level: "beginner",
        goals: ["Synthetic goal"],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      const lessonId = await ctx.db.insert("lessons", {
        teacherId: ownerId,
        studentId,
        title: "Synthetic Surface Lesson",
        scheduledAt: now,
        duration: 60,
        status: "planned",
        createdAt: now,
        updatedAt: now,
      });
      const progressId = await ctx.db.insert("progress", {
        lessonId,
        studentId,
        teacherId: ownerId,
        skills: { reading: 1, writing: 1, speaking: 1, listening: 1, grammar: 1, vocabulary: 1 },
        topicsCovered: ["Synthetic topic"],
        notes: "Synthetic notes",
        createdAt: now,
      });
      return { lessonId, progressId };
    });
    const attacker = t.withIdentity({ subject: "clerk_surface_attacker" });
    const owner = t.withIdentity({ subject: "clerk_surface_owner" });

    await expect(t.query(getProgressByLesson, { lessonId: fixture.lessonId })).rejects.toThrow("Unauthenticated");
    await expect(attacker.query(getProgressByLesson, { lessonId: fixture.lessonId })).rejects.toThrow("Not found or access denied");
    await expect(attacker.mutation(updateProgress, { progressId: fixture.progressId, notes: "attacker" })).rejects.toThrow("Not found or access denied");
    await expect(t.mutation(generateUploadUrl, {})).rejects.toThrow("disabled");
    await expect(t.query(getGoogleCalendarConnection, { teacherId: ownerId })).rejects.toThrow("Unauthenticated");
    await expect(attacker.query(getGoogleCalendarConnection, { teacherId: ownerId })).rejects.toThrow("Not found or access denied");
    await expect(attacker.mutation(storeGoogleCalendarConnection, {
      teacherId: ownerId,
      accessToken: "synthetic-access",
      refreshToken: "synthetic-refresh",
      tokenExpiry: Date.now(),
      calendarId: "synthetic-calendar",
    })).rejects.toThrow("Not found or access denied");
    await expect(owner.query(getGoogleCalendarConnection, { teacherId: ownerId })).resolves.toBeNull();
    await expect(t.run(async (ctx) => (await ctx.db.get(fixture.progressId))?.notes)).resolves.toBe("Synthetic notes");
    void attackerId;
  });

  it("authenticates before revealing whether a legacy Progress record exists", async () => {
    const t = makeTest();
    const ownerId = await insertLegacyUser(t, "clerk_progress_auth_order_owner");
    const fixture = await t.run(async (ctx) => {
      const now = Date.now();
      const studentId = await ctx.db.insert("students", {
        teacherId: ownerId,
        name: "Synthetic Progress Auth Order Student",
        level: "beginner",
        goals: ["Synthetic goal"],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      const lessonId = await ctx.db.insert("lessons", {
        teacherId: ownerId,
        studentId,
        title: "Synthetic Progress Auth Order Lesson",
        scheduledAt: now,
        duration: 60,
        status: "planned",
        createdAt: now,
        updatedAt: now,
      });
      const progressId = await ctx.db.insert("progress", {
        lessonId,
        studentId,
        teacherId: ownerId,
        skills: { reading: 1, writing: 1, speaking: 1, listening: 1, grammar: 1, vocabulary: 1 },
        topicsCovered: ["Synthetic topic"],
        notes: "Synthetic notes",
        createdAt: now,
      });
      return { progressId };
    });

    await expect(t.mutation(updateProgress, { progressId: fixture.progressId, notes: "unauthenticated" }))
      .rejects.toThrow("Unauthenticated");
    await t.run(async (ctx) => {
      await ctx.db.delete(fixture.progressId);
    });
    await expect(t.mutation(updateProgress, { progressId: fixture.progressId, notes: "unauthenticated" }))
      .rejects.toThrow("Unauthenticated");
    await expect(t.run(async (ctx) => await ctx.db.get(fixture.progressId))).resolves.toBeNull();
  });

  it("denies unauthenticated and cross-identity legacy Student access", async () => {
    const t = makeTest();
    const ownerTeacherId = await insertLegacyUser(t, "clerk_legacy_owner");
    const attacker = t.withIdentity({ subject: "clerk_legacy_attacker" });
    await insertLegacyUser(t, "clerk_legacy_attacker");

    await expect(
      t.mutation(createStudent, {
        teacherId: ownerTeacherId,
        ...syntheticStudent,
      }),
    ).rejects.toThrow("Unauthenticated");
    await expect(
      attacker.mutation(createStudent, {
        teacherId: ownerTeacherId,
        ...syntheticStudent,
      }),
    ).rejects.toThrow("Not found or access denied");

    const owner = t.withIdentity({ subject: "clerk_legacy_owner" });
    const studentId = await owner.mutation(createStudent, {
      teacherId: ownerTeacherId,
      ...syntheticStudent,
    });
    const unauthorizedError = attacker.query(getStudent, { studentId });
    await expect(unauthorizedError).rejects.toThrow(
      "Not found or access denied",
    );
    await expect(
      attacker.query(getStudent, {
        studentId: "99999;students" as Id<"students">,
      }),
    ).rejects.toThrow("Not found or access denied");
  });

  it("derives a legacy User Clerk identifier from authenticated identity", async () => {
    const t = makeTest();
    const caller = t.withIdentity({ subject: "clerk_actual_caller" });

    const userId = await caller.mutation(createUser, {
      clerkId: "clerk_spoofed_victim",
      name: "Synthetic Caller",
      email: "caller@example.test",
    });
    const user = await t.run(async (ctx) => await ctx.db.get(userId));

    expect(user?.clerkId).toBe("clerk_actual_caller");
  });

  it("does not let a caller choose or change their legacy privilege role", async () => {
    const t = makeTest();
    const caller = t.withIdentity({ subject: "clerk_role_caller" });

    const userId = await caller.mutation(createUser, {
      clerkId: "clerk_spoofed_victim",
      name: "Synthetic Caller",
      email: "caller@example.test",
      role: "teacher",
    });

    await caller.mutation(createUser, {
      clerkId: "clerk_spoofed_victim",
      name: "Synthetic Caller Updated",
      email: "caller-updated@example.test",
      role: "parent",
    });

    const user = await t.run(async (ctx) => await ctx.db.get(userId));
    expect(user?.role).toBe("teacher");
  });

  it("disables public seed, integration-test, setup, and all-user admin surfaces", async () => {
    const t = makeTest();
    const teacherId = await insertLegacyUser(t, "clerk_legacy_owner");
    const owner = t.withIdentity({ subject: "clerk_legacy_owner" });

    await expect(
      owner.mutation(seedSampleData, { teacherId }),
    ).rejects.toThrow("disabled");
    await expect(owner.mutation(testIntegration, {})).rejects.toThrow("disabled");
    await expect(owner.query(testSetup, {})).rejects.toThrow("disabled");
    await expect(owner.query(getUsers, {})).rejects.toThrow("disabled");

    await expect(
      t.run(async (ctx) => ({
        students: (await ctx.db.query("students").collect()).length,
        lessons: (await ctx.db.query("lessons").collect()).length,
        progress: (await ctx.db.query("progress").collect()).length,
      })),
    ).resolves.toEqual({ students: 0, lessons: 0, progress: 0 });
  });

  it("does not expose the AI connection probe as a public action", () => {
    expect(api.aiService).not.toHaveProperty("testAIConnection");
  });
});
