"use client";

import { useCallback, useMemo } from "react";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";

export type SortEntry = { id: string; desc: boolean };

/** `sort` is stored as `id:asc,other:desc` so it stays readable in the URL. */
function parseSortParam(value: string): SortEntry[] {
  if (!value) return [];

  return value
    .split(",")
    .map((entry) => {
      const [id, direction] = entry.split(":");
      if (!id) return null;
      return { id, desc: direction === "desc" };
    })
    .filter((entry): entry is SortEntry => entry !== null);
}

function serializeSortParam(sorting: SortEntry[]): string {
  return sorting.map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`).join(",");
}

/**
 * Search, filters, sorting and pagination live in the query string, so a
 * filtered view is shareable and survives a refresh.
 *
 * Filter keys are dynamic, so the raw nuqs record is not statically indexable.
 * The narrowing is done once here and every caller gets a typed API.
 */
export function useTableUrlState(filterKeys: string[]) {
  const parsers = useMemo(() => {
    const filterParsers = Object.fromEntries(
      filterKeys.map((key) => [
        `f_${key}`,
        parseAsArrayOf(parseAsString).withDefault([]),
      ]),
    );

    return {
      q: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
      size: parseAsInteger.withDefault(20),
      sort: parseAsString.withDefault(""),
      ...filterParsers,
    };
  }, [filterKeys]);

  const [rawState, setRawState] = useQueryStates(parsers, {
    history: "replace",
    clearOnDefault: true,
  });

  const state = rawState as unknown as Record<string, unknown>;
  const setState = setRawState as unknown as (
    patch: Record<string, unknown>,
  ) => Promise<unknown>;

  const search = typeof state.q === "string" ? state.q : "";
  const page = typeof state.page === "number" ? state.page : 1;
  const size = typeof state.size === "number" ? state.size : 20;
  const sortRaw = typeof state.sort === "string" ? state.sort : "";

  const sorting = useMemo(() => parseSortParam(sortRaw), [sortRaw]);

  const getFilter = useCallback(
    (key: string): string[] => {
      const value = state[`f_${key}`];
      return Array.isArray(value) ? (value as string[]) : [];
    },
    [state],
  );

  const setSearch = useCallback(
    (value: string) => void setState({ q: value || null, page: null }),
    [setState],
  );

  const setFilter = useCallback(
    (key: string, values: string[]) =>
      void setState({
        [`f_${key}`]: values.length > 0 ? values : null,
        page: null,
      }),
    [setState],
  );

  const setSorting = useCallback(
    (next: SortEntry[]) =>
      void setState({ sort: serializeSortParam(next) || null }),
    [setState],
  );

  const setPagination = useCallback(
    (nextPage: number, nextSize: number) =>
      void setState({
        page: nextPage === 1 ? null : nextPage,
        size: nextSize === 20 ? null : nextSize,
      }),
    [setState],
  );

  return {
    search,
    page,
    size,
    sorting,
    getFilter,
    setSearch,
    setFilter,
    setSorting,
    setPagination,
  };
}
