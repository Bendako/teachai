import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AppProviders, { useClerkConfigured } from "./AppProviders";

function RuntimeProbe() {
  const clerkConfigured = useClerkConfigured();

  return (
    <main>
      <h1>Public application</h1>
      <output>{clerkConfigured ? "authenticated" : "public"}</output>
    </main>
  );
}

describe("AppProviders secret-free integration", () => {
  it("renders the public application without constructing Clerk", () => {
    render(
      <AppProviders publishableKey={undefined}>
        <RuntimeProbe />
      </AppProviders>,
    );

    expect(
      screen.getByRole("heading", { name: "Public application" }),
    ).toBeInTheDocument();
    expect(screen.getByText("public")).toBeInTheDocument();
  });
});
