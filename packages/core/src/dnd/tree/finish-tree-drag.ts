import { say } from "../announce/live-region.ts";
import { commitTree } from "./commit-tree.ts";
import { rowName, type TreeContext } from "./tree-context.ts";
import type { TreeDrag } from "./tree-drag.types.ts";
import { mark, updateTree } from "./tree-frame.ts";

/** How a tree drag ends: a drop where the pointer is, or a cancel. */
export type TreeEnding = "drop" | "cancel";

/** Takes the drag down: its frame, listeners, marks, chip and styles. */
function restore(tree: TreeContext, drag: TreeDrag): void {
  for (const off of drag.offs.splice(0)) off();
  tree.drag = undefined;

  for (const row of drag.subtree) delete row.el.dataset.dndSource;
  mark(tree, drag, null);

  if (tree.chip?.matches(":popover-open") === true) tree.chip.hidePopover();
  tree.chip?.removeAttribute("popover");
  drag.ledger.restore();
  tree.setActive(null);
}

/** Ends a tree drag: a drop commits the move unless it is blocked; a cancel or a blocked drop says so. */
export function finishTreeDrag(tree: TreeContext, drag: TreeDrag, ending: TreeEnding): void {
  cancelAnimationFrame(drag.frame);
  const isDrop = ending === "drop";

  // A release between frames drops where the pointer is, not where the last frame saw it.
  if (isDrop) updateTree(tree, drag, performance.now());
  restore(tree, drag);
  const isFocused = document.activeElement === drag.source.el;
  const { move } = drag;

  if (isDrop && move !== null && !drag.blocked) return commitTree(tree, drag.tree, { isFocused, move });

  if (isDrop && move === null) return;
  say(tree.messages.canceled(rowName(tree, drag.id), drag.from.index + 1), drag.modal);
}
