import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => undefined;

/** Returns false during SSR hydration and true once the client snapshot is active. */
export function useMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
