import { ConvexError, v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { internalQuery } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const workspaceRoles = ["owner", "admin", "teacher"] as const;
export type WorkspaceRole = (typeof workspaceRoles)[number];

type AuthorizationCtx = Pick<QueryCtx | MutationCtx, "auth" | "db">;

export async function requireAuthenticatedIdentity(ctx: AuthorizationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Unauthenticated");
  }
  return identity;
}

export async function requireLegacyTeacherIdentity(
  ctx: AuthorizationCtx,
  requestedTeacherId: Id<"users">,
) {
  const identity = await requireAuthenticatedIdentity(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (
    !user ||
    user._id !== requestedTeacherId ||
    user.role !== "teacher"
  ) {
    throw new ConvexError("Not found or access denied");
  }

  return { identity, user };
}

export async function requireLegacyStudentIdentity(
  ctx: AuthorizationCtx,
  requestedStudentId: Id<"students">,
) {
  await requireAuthenticatedIdentity(ctx);
  const student = await ctx.db.get(requestedStudentId);
  if (!student) throw new ConvexError("Not found or access denied");
  const teacher = await requireLegacyTeacherIdentity(ctx, student.teacherId);
  return { ...teacher, student };
}

export async function requireLegacyLessonIdentity(
  ctx: AuthorizationCtx,
  requestedLessonId: Id<"lessons">,
) {
  const identity = await requireAuthenticatedIdentity(ctx);
  const lesson = await ctx.db.get(requestedLessonId);
  if (!lesson) throw new ConvexError("Not found or access denied");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user || user._id !== lesson.teacherId || user.role !== "teacher") {
    throw new ConvexError("Not found or access denied");
  }
  const teacher = { identity, user };
  const student = await ctx.db.get(lesson.studentId);
  if (!student || student.teacherId !== lesson.teacherId) {
    throw new ConvexError("Not found or access denied");
  }
  return { ...teacher, lesson, student };
}

export async function requireActiveWorkspaceMembership(
  ctx: AuthorizationCtx,
  workspaceId: Id<"workspaces">,
  allowedRoles: readonly WorkspaceRole[] = workspaceRoles,
) {
  const identity = await requireAuthenticatedIdentity(ctx);
  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_workspace_and_identity", (q) =>
      q.eq("workspaceId", workspaceId).eq("memberIdentityId", identity.subject),
    )
    .unique();

  if (
    !membership ||
    membership.status !== "active" ||
    !allowedRoles.includes(membership.role)
  ) {
    throw new ConvexError("Not found or access denied");
  }

  return { identity, membership };
}

export const authorizeLessonGeneration = internalQuery({
  args: {
    identitySubject: v.string(),
    teacherId: v.id("users"),
    studentId: v.id("students"),
    lessonId: v.id("lessons"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const teacher = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.identitySubject))
      .unique();
    const lesson = await ctx.db.get(args.lessonId);
    const student = await ctx.db.get(args.studentId);
    if (
      !teacher ||
      teacher._id !== args.teacherId ||
      teacher.role !== "teacher" ||
      !lesson ||
      lesson.teacherId !== teacher._id ||
      !student ||
      lesson.studentId !== student._id ||
      student.teacherId !== teacher._id
    ) {
      throw new ConvexError("Not found or access denied");
    }
    return null;
  },
});
