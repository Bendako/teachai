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
const getWorkspace = makeFunctionReference<
  "query",
  { workspaceId: Id<"workspaces"> },
  { _id: Id<"workspaces">; name: string }
>("workspaces:getWorkspace");

describe("Workspace authorization", () => {
  it("lets an authenticated creator read the Workspace created for their owner membership", async () => {
    const t = convexTest(schema, modules);
    const owner = t.withIdentity({ subject: "clerk_owner_alpha" });

    const workspaceId = await owner.mutation(createWorkspace, {
      name: "Alpha Teaching",
    });

    await expect(
      owner.query(getWorkspace, { workspaceId }),
    ).resolves.toMatchObject({
      _id: workspaceId,
      name: "Alpha Teaching",
    });
  });
});
