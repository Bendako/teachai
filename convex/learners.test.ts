// @vitest-environment edge-runtime
/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { makeFunctionReference } from "convex/server";
import { describe, expect, it } from "vitest";

import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const createWorkspace = makeFunctionReference<
  "mutation",
  { name: string },
  Id<"workspaces">
>("workspaces:createWorkspace");
const createLearner = makeFunctionReference<
  "mutation",
  { workspaceId: Id<"workspaces">; name: string },
  Id<"learners">
>("learners:createLearner");
const getLearner = makeFunctionReference<
  "query",
  { learnerId: Id<"learners">; workspaceId: Id<"workspaces"> },
  { _id: Id<"learners">; workspaceId: Id<"workspaces">; name: string }
>("learners:getLearner");

describe("Learner Workspace isolation", () => {
  it("allows an owner to create and read a Learner in their Workspace", async () => {
    const t = convexTest(schema, modules);
    const owner = t.withIdentity({ subject: "clerk_owner_alpha" });
    const workspaceId = await owner.mutation(createWorkspace, {
      name: "Alpha Teaching",
    });

    const learnerId = await owner.mutation(createLearner, {
      workspaceId,
      name: "Synthetic Learner Alpha",
    });

    await expect(owner.query(getLearner, { learnerId, workspaceId })).resolves.toMatchObject({
      _id: learnerId,
      workspaceId,
      name: "Synthetic Learner Alpha",
    });
  });

  it("allows an active Admin Member to create and read a Learner", async () => {
    const t = convexTest(schema, modules);
    const owner = t.withIdentity({ subject: "clerk_owner_alpha" });
    const admin = t.withIdentity({ subject: "clerk_admin_alpha" });
    const workspaceId = await owner.mutation(createWorkspace, {
      name: "Alpha Teaching",
    });
    await t.run(async (ctx) => {
      const now = Date.now();
      await ctx.db.insert("memberships", {
        workspaceId,
        memberIdentityId: "clerk_admin_alpha",
        role: "admin",
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    });

    const learnerId = await admin.mutation(createLearner, {
      workspaceId,
      name: "Synthetic Learner Admin",
    });

    await expect(admin.query(getLearner, { learnerId, workspaceId })).resolves.toMatchObject({
      _id: learnerId,
      workspaceId,
      name: "Synthetic Learner Admin",
    });
  });

  it("denies an active but unassigned Teacher read and create access without inserting a row", async () => {
    const t = convexTest(schema, modules);
    const owner = t.withIdentity({ subject: "clerk_owner_alpha" });
    const teacher = t.withIdentity({ subject: "clerk_teacher_alpha" });
    const workspaceId = await owner.mutation(createWorkspace, {
      name: "Alpha Teaching",
    });
    await t.run(async (ctx) => {
      const now = Date.now();
      await ctx.db.insert("memberships", {
        workspaceId,
        memberIdentityId: "clerk_teacher_alpha",
        role: "teacher",
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    });
    const learnerId = await owner.mutation(createLearner, {
      workspaceId,
      name: "Synthetic Learner Alpha",
    });
    const beforeCount = await t.run(async (ctx) =>
      (await ctx.db.query("learners").collect()).length,
    );

    await expect(teacher.query(getLearner, { learnerId, workspaceId })).rejects.toThrow(
      "Not found or access denied",
    );
    await expect(
      teacher.mutation(createLearner, {
        workspaceId,
        name: "Unassigned Teacher attempt",
      }),
    ).rejects.toThrow("Not found or access denied");
    await expect(
      t.run(async (ctx) => (await ctx.db.query("learners").collect()).length),
    ).resolves.toBe(beforeCount);
  });

  it("revokes Learner read and create access immediately when a Member is removed", async () => {
    const t = convexTest(schema, modules);
    const owner = t.withIdentity({ subject: "clerk_owner_alpha" });
    const teacher = t.withIdentity({ subject: "clerk_teacher_alpha" });
    const workspaceId = await owner.mutation(createWorkspace, {
      name: "Alpha Teaching",
    });
    const membershipId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("memberships", {
        workspaceId,
        memberIdentityId: "clerk_teacher_alpha",
        role: "admin",
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    });
    const learnerId = await owner.mutation(createLearner, {
      workspaceId,
      name: "Synthetic Learner Alpha",
    });
    await expect(teacher.query(getLearner, { learnerId, workspaceId })).resolves.toBeTruthy();

    await t.run(async (ctx) => {
      const now = Date.now();
      await ctx.db.patch(membershipId, {
        status: "removed",
        removedAt: now,
        updatedAt: now,
      });
    });

    await expect(teacher.query(getLearner, { learnerId, workspaceId })).rejects.toThrow(
      "Not found or access denied",
    );
    await expect(
      teacher.mutation(createLearner, {
        workspaceId,
        name: "Removed-member attempt",
      }),
    ).rejects.toThrow("Not found or access denied");
  });

  it("denies unauthenticated Learner reads and mutations", async () => {
    const t = convexTest(schema, modules);
    const owner = t.withIdentity({ subject: "clerk_owner_alpha" });
    const workspaceId = await owner.mutation(createWorkspace, {
      name: "Alpha Teaching",
    });
    const learnerId = await owner.mutation(createLearner, {
      workspaceId,
      name: "Synthetic Learner Alpha",
    });

    await expect(t.query(getLearner, { learnerId, workspaceId })).rejects.toThrow(
      "Unauthenticated",
    );
    await expect(
      t.mutation(createLearner, {
        workspaceId,
        name: "Unauthenticated attempt",
      }),
    ).rejects.toThrow("Unauthenticated");
  });

  it("denies a second Workspace both reading and creating Learners in the first Workspace", async () => {
    const t = convexTest(schema, modules);
    const ownerA = t.withIdentity({ subject: "clerk_owner_alpha" });
    const ownerB = t.withIdentity({ subject: "clerk_owner_beta" });
    const workspaceA = await ownerA.mutation(createWorkspace, {
      name: "Alpha Teaching",
    });
    await ownerB.mutation(createWorkspace, { name: "Beta Teaching" });
    const learnerId = await ownerA.mutation(createLearner, {
      workspaceId: workspaceA,
      name: "Synthetic Learner Alpha",
    });

    await expect(ownerB.query(getLearner, { learnerId, workspaceId: workspaceA })).rejects.toThrow(
      "Not found or access denied",
    );
    await expect(
      ownerB.mutation(createLearner, {
        workspaceId: workspaceA,
        name: "Cross-tenant attempt",
      }),
    ).rejects.toThrow("Not found or access denied");
  });
});
