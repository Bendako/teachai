export type RuntimeMode = "public" | "authenticated";

type PublicRuntimeEnvironment = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
};

export function resolveRuntimeMode(
  environment: PublicRuntimeEnvironment,
): RuntimeMode {
  return environment.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()
    ? "authenticated"
    : "public";
}
