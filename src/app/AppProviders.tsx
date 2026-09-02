"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { createContext, type ReactNode, useContext } from "react";

import { resolveRuntimeMode } from "@/lib/runtime-config";

const ClerkConfiguredContext = createContext(false);

export function useClerkConfigured(): boolean {
  return useContext(ClerkConfiguredContext);
}

export default function AppProviders({
  children,
  publishableKey,
}: {
  children: ReactNode;
  publishableKey: string | undefined;
}) {
  const clerkConfigured =
    resolveRuntimeMode({
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: publishableKey,
    }) === "authenticated";

  if (!clerkConfigured) {
    return (
      <ClerkConfiguredContext.Provider value={false}>
        {children}
      </ClerkConfiguredContext.Provider>
    );
  }

  return (
    <ClerkConfiguredContext.Provider value>
      <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
    </ClerkConfiguredContext.Provider>
  );
}
