import { afterEach, describe, expect, it, vi } from "vitest";
import { type NextFetchEvent, NextRequest } from "next/server";

import middleware from "./middleware";

const event = {} as NextFetchEvent;

async function runMiddleware(pathname: string) {
  const result = await middleware(
    new NextRequest(`https://teachai.example${pathname}`),
    event,
  );

  expect(result).toBeInstanceOf(Response);
  return result as Response;
}

describe("secret-free middleware", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows only the public landing page when Clerk is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "");

    const response = await runMiddleware("/");

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it.each(["/dashboard", "/api/private", "/trpc/private"])(
    "returns a safe 404 for %s instead of disabling auth",
    async (pathname) => {
      vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "");

      const response = await runMiddleware(pathname);

      expect(response.status).toBe(404);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.text()).toContain("This page could not be found.");
    },
  );
});