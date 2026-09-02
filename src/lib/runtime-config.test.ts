import { describe, expect, it } from "vitest";

import { resolveRuntimeMode } from "./runtime-config";

describe("resolveRuntimeMode", () => {
  it("selects the secret-free public mode when Clerk is not configured", () => {
    expect(resolveRuntimeMode({})).toBe("public");
  });

  it("selects authenticated mode when a Clerk publishable key is configured", () => {
    expect(
      resolveRuntimeMode({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_synthetic",
      }),
    ).toBe("authenticated");
  });
});
