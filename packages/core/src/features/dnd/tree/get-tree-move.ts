import { flatten } from "./tree-dom.ts";
import { treeStep } from "./tree-step.ts";
import type { TreeDirection, TreeMove } from "./tree.types.ts";

/** The move for a menu or shortcut: "up", "down", "indent" or "outdent"; null when impossible. */
export function getTreeMove(
  root: HTMLElement,
  id: string,
  step: {
    /** Which way the row moves. */
    direction: TreeDirection;
    /** Rows that can take children; rows with aria-expanded by default. */
    canHaveChildren?: (id: string) => boolean;
  },
): TreeMove | null {
  return treeStep(flatten(root, step.canHaveChildren), id, step.direction);
}
