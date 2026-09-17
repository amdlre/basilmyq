"use client";

import { useCallback, useSyncExternalStore } from "react";
import type {
  ColumnOrderState,
  ColumnSizingState,
  VisibilityState,
} from "@tanstack/react-table";

import type { TableDensity } from "./types";

export type TablePreferences = {
  columnOrder: ColumnOrderState;
  columnVisibility: VisibilityState;
  columnSizing: ColumnSizingState;
  density: TableDensity;
};

const DEFAULTS: TablePreferences = {
  columnOrder: [],
  columnVisibility: {},
  columnSizing: {},
  density: "comfortable",
};

function storageKeyFor(key: string): string {
  return `basilmyq.table.${key}`;
}

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab editing the same preferences should be picked up too.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/**
 * `useSyncExternalStore` demands a referentially stable snapshot, so the parsed
 * object is cached against the raw string it came from. Without this the store
 * would return a new object every render and React would loop.
 */
const snapshotCache = new Map<
  string,
  { raw: string | null; value: TablePreferences }
>();

function getSnapshot(key: string): TablePreferences {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(storageKeyFor(key));
  } catch {
    // Private mode or blocked storage — behave as if nothing was saved.
    raw = null;
  }

  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) return cached.value;

  let value = DEFAULTS;
  if (raw) {
    try {
      value = {
        ...DEFAULTS,
        ...(JSON.parse(raw) as Partial<TablePreferences>),
      };
    } catch {
      value = DEFAULTS;
    }
  }

  snapshotCache.set(key, { raw, value });
  return value;
}

function getServerSnapshot(): TablePreferences {
  return DEFAULTS;
}

/**
 * Column order, visibility, sizing and density, persisted per table.
 *
 * Read through an external store rather than an effect: the server renders the
 * defaults, React swaps in the stored values after hydration, and there is no
 * markup mismatch and no cascading render.
 */
export function useTablePreferences(key: string) {
  const preferences = useSyncExternalStore(
    subscribe,
    () => getSnapshot(key),
    getServerSnapshot,
  );

  const isHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const update = useCallback(
    (patch: Partial<TablePreferences>) => {
      const next = { ...getSnapshot(key), ...patch };
      try {
        window.localStorage.setItem(storageKeyFor(key), JSON.stringify(next));
      } catch {
        // Storage unavailable — preferences simply do not persist.
      }
      snapshotCache.set(key, {
        raw: window.localStorage.getItem(storageKeyFor(key)),
        value: next,
      });
      emit();
    },
    [key],
  );

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKeyFor(key));
    } catch {
      // Nothing to clean up.
    }
    snapshotCache.delete(key);
    emit();
  }, [key]);

  return { preferences, update, reset, isHydrated };
}
