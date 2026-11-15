import { siblingIndex } from "./tree-rows.ts";
import type { TreeDirection, TreeMove, TreePlace, TreeRow } from "./tree.types.ts";

/** The move one step of `direction` makes from `i`, when there is one. */
function stepTo(rows: readonly TreeRow[], i: number, direction: TreeDirection): TreePlace | null {
  const row = rows[i];

  if (row === undefined) return null;
  const index = siblingIndex(rows, i);
  const siblings = rows.filter((other) => other.parent === row.parent);

  if (direction === "up") return index > 0 ? { index: index - 1, parent: row.parent } : null;

  if (direction === "down") return index < siblings.length - 1 ? { index: index + 1, parent: row.parent } : null;

  if (direction === "indent") {
    const previous = siblings[index - 1];

    return previous?.holds === true ? { index: previous.size, parent: previous.id } : null;
  }

  const p = rows.findIndex((other) => other.id === row.parent);
  const parent = rows[p];

  return parent === undefined ? null : { index: siblingIndex(rows, p) + 1, parent: parent.parent };
}

/** The move for a menu or shortcut; null when impossible. */
export function treeStep(rows: readonly TreeRow[], id: string, direction: TreeDirection): TreeMove | null {
  const i = rows.findIndex((row) => row.id === id);
  const row = rows[i];
  const to = stepTo(rows, i, direction);

  if (row === undefined || to === null) return null;

  return { from: { index: siblingIndex(rows, i), parent: row.parent }, id, to };
}
