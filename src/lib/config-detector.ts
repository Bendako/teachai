export interface ServiceConfig {
  hasClerk: boolean;
  hasConvex: boolean;
  clerkPublishableKey?: string;
  convexUrl?: string;
}

export function detectClerkConfig(): boolean {
  if (typeof window !== 'undefined') {
    return !!(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      (window as unknown as Record<string, unknown>).__CLERK_PUBLISHABLE_KEY
    );
  }
  
  return !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
  );
}

export function detectConvexConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CONVEX_URL ||
    process.env.CONVEX_DEPLOYMENT
  );
}

export function getServiceConfig(): ServiceConfig {
  const hasClerk = detectClerkConfig();
  const hasConvex = detectConvexConfig();
  
  return {
    hasClerk,
    hasConvex,
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
  };
}

export function getMissingServices(): string[] {
  const config = getServiceConfig();
  const missing: string[] = [];
  
  if (!config.hasClerk) {
    missing.push('Clerk Authentication');
  }
  
  if (!config.hasConvex) {
    missing.push('Convex Database');
  }
  
  return missing;
}

export function isFullyConfigured(): boolean {
  const config = getServiceConfig();
  return config.hasClerk && config.hasConvex;
}
