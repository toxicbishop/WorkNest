import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useCurrentTimestamp(): number {
  return useSyncExternalStore(
    emptySubscribe,
    () => Date.now(),
    () => 0
  );
}
