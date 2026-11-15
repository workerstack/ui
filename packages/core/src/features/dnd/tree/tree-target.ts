import { NONE } from "../internal/dnd.constants.ts";
import { subtreeEnd } from "./tree-rows.ts";
import type { TreePlace, TreeRow, TreeTarget } from "./tree.types.ts";
import { zoneOf } from "./zone-of.ts";

/**
 * Where the pointer points: its y in content coordinates, and how far it has travelled across since the lift (logical:
 * positive goes deeper in either direction), with the pixels per level.
 */
export type TreePointer = { y: number; dx: number; indent: number };

/** What the pointer is over: a gap among the rows without the dragged subtree, or a row taking it inside. */
type Hit = { gap: number; inside?: undefined } | { gap?: undefined; inside: TreeTarget };

/** The gap's index among the rows without the dragged subtree, or an "inside" target on the row under the pointer. */
function hitAt(rows: readonly TreeRow[], s: number, y: number): Hit {
  const e = subtreeEnd(rows, s);
  const found = rows.findIndex((row) => y < row.top + row.height);
  const i = found === NONE ? rows.length - 1 : found;
  const row = rows[i];

  if (row === undefined || (i >= s && i < e)) return { gap: s };
  const k = i < s ? i : i - (e - s);
  const zone = zoneOf(y, row);

  if (zone !== "inside") return { gap: zone === "before" ? k : k + 1 };
  const index = row.size - (rows[s]?.parent === row.id ? 1 : 0);

  return { inside: { depth: row.depth + 1, index, inside: row.id, line: row.top, parent: row.id } };
}

/** The parent and index of a gap at `gap` and `depth`: the nearest shallower row above, and the siblings between. */
function placeAt(list: readonly TreeRow[], gap: number, depth: number): TreePlace {
  const above = list.slice(0, gap).toReversed();
  const end = above.findIndex((row) => row.depth < depth);
  const between = end === NONE ? above : above.slice(0, end);

  return {
    index: between.filter((row) => row.depth === depth).length,
    parent: end === NONE ? null : (above[end]?.id ?? null),
  };
}

/** The shallowest and deepest a gap allows. */
type DepthRange = { min: number; max: number };

/** The depths a gap between `above` and `below` allows: from the row below's, to one past a holding row above. */
function depthRange(above: TreeRow | undefined, below: TreeRow | undefined): DepthRange {
  if (above === undefined) return { max: 0, min: below?.depth ?? 0 };

  return { max: above.depth + (above.holds ? 1 : 0), min: below?.depth ?? 0 };
}

/** Where the dragged row `s` lands for the pointer. The dragged subtree is not a target. */
export function treeTarget(rows: readonly TreeRow[], s: number, pointer: TreePointer): TreeTarget {
  const hit = hitAt(rows, s, pointer.y);

  if (hit.inside !== undefined) return hit.inside;
  const list = [...rows.slice(0, s), ...rows.slice(subtreeEnd(rows, s))];
  const above = list[hit.gap - 1];
  const below = list[hit.gap];
  const { min, max } = depthRange(above, below);
  const wanted = (rows[s]?.depth ?? 0) + Math.round(pointer.dx / pointer.indent);
  const depth = Math.max(min, Math.min(max, wanted));
  const line = above === undefined ? (below?.top ?? 0) : above.top + above.height;

  return { ...placeAt(list, hit.gap, depth), depth, inside: null, line };
}
