import type { TreeRow, Zone } from "./tree.types.ts";

// A row that holds children: its top quarter is before, its bottom quarter after, the middle half inside.
const HOLDING_EDGE = 0.25;
// A row that can't hold splits at its midline.

const LEAF_EDGE = 0.5;

/** The zone of `row` at `y`: before, after, or (for a row that holds children) inside. */
export function zoneOf(y: number, row: Pick<TreeRow, "top" | "height" | "holds">): Zone {
  const at = (y - row.top) / row.height;
  const edge = row.holds ? HOLDING_EDGE : LEAF_EDGE;

  if (at < edge) return "before";

  if (at >= 1 - edge) return "after";

  return "inside";
}
