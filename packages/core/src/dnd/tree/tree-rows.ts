import type { TreeRow } from "./tree.types.ts";

/** The end (exclusive) of the subtree starting at row `i`. */
export function subtreeEnd(rows: readonly TreeRow[], i: number): number {
  const depth = rows[i]?.depth ?? 0;
  let end = i + 1;

  while (end < rows.length && (rows[end]?.depth ?? 0) > depth) end++;

  return end;
}

/** The row's index among its parent's children. */
export function siblingIndex(rows: readonly TreeRow[], i: number): number {
  const parent = rows[i]?.parent;

  return rows.slice(0, i).filter((row) => row.parent === parent).length;
}
