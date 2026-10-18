import { useSyncExternalStore } from "react";

let currentTimestamp = 0;
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);

  // Initialize once on client
  if (currentTimestamp === 0 && typeof window !== "undefined") {
    currentTimestamp = Date.now();
    callback();
  }

  // Update periodically (once per minute)
  const timer = setInterval(() => {
    currentTimestamp = Date.now();
    listeners.forEach((l) => l());
  }, 60000);

  return () => {
    clearInterval(timer);
    listeners.delete(callback);
  };
}

function getSnapshot(): number {
  return currentTimestamp;
}

function getServerSnapshot(): number {
  return 0;
}

export function useCurrentTimestamp(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
