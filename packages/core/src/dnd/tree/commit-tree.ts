import { flush } from "solid-js";

import { modalOf, say } from "../announce/live-region.ts";
import { flip, reducedMotion } from "../motion/flip.ts";
import { SHIFT_MS } from "../motion/motion.constants.ts";
import { rowName, type TreeContext } from "./tree-context.ts";
import { flatten } from "./tree-dom.ts";
import type { TreeMove } from "./tree.types.ts";

/** A move to apply, and whether focus follows the moved row. */
export type TreeCommit = { move: TreeMove; isFocused: boolean };

/** Where every shown row is drawn now. */
function snapshot(root: HTMLElement): Map<string, DOMRect> {
  const visible = flatten(root).filter((row) => row.visible);

  return new Map(visible.map((row) => [row.id, row.el.getBoundingClientRect()]));
}

/** Applies a move: `onMove`, `flush()`, rows slide from where they were, focus and speech follow. */
export function commitTree(tree: TreeContext, root: HTMLElement, commit: TreeCommit): void {
  const { move } = commit;
  const before = snapshot(root);

  try {
    tree.options.onMove(move);
  } finally {
    flush();
  }

  const duration = reducedMotion() ? 0 : SHIFT_MS;
  const rows = flatten(root);

  for (const row of rows) {
    const rect = before.get(row.id);

    if (rect === undefined || !row.visible) continue;
    const now = row.el.getBoundingClientRect();
    flip(row.el, { duration, dx: rect.x - now.x, dy: rect.y - now.y });
  }

  const total = rows.filter((row) => row.parent === move.to.parent).length;
  const parent = move.to.parent === null ? undefined : rowName(tree, move.to.parent);

  if (commit.isFocused) rows.find((row) => row.id === move.id)?.el.focus({ preventScroll: true });
  const text = tree.messages.treeMoved({ item: rowName(tree, move.id), parent, position: move.to.index + 1, total });
  say(text, modalOf(root));
}
