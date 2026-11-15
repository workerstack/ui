import { flush } from "solid-js";

import { dragState } from "../internal/drag-state.ts";
import { afterCommit } from "./after-commit.ts";
import type { Drag, Landing } from "./drag.types.ts";
import type { SortableMove } from "./engine.types.ts";
import { moveTo } from "./target.ts";

const DRAGGED_MARKS = ["dndDragging", "dndDropping", "dndKeyboard", "dndBlocked"] as const;
const LIST_MARKS = ["dndSource", "dndTarget", "dndBlocked"] as const;

/** Where every box and the dragged element show now: FLIP starts from here once the DOM has the new order. */
function snapshot(drag: Drag, landing: Landing): Map<string, DOMRect> {
  const before = new Map<string, DOMRect>();
  const lists = new Set([drag.homeState, landing.list]);

  for (const list of lists) for (const box of list.boxes) before.set(box.reg.id, box.el.getBoundingClientRect());
  before.set(drag.item.id, drag.el.getBoundingClientRect());

  return before;
}

/** Takes the lift down: the top layer, the placeholders, every inline style and mark, and the drag itself. */
function restoreLift(drag: Drag, landing: Landing): void {
  const { el } = drag;
  const isAcross = landing.list !== drag.homeState;

  if (el.matches(":popover-open")) el.hidePopover();
  el.removeAttribute("popover");

  // The list the item went to gets the item itself; a home it left closes after the commit.
  for (const list of drag.states) if (list !== drag.homeState || !isAcross) list.placeholder?.remove();
  drag.ledger.restore();

  for (const mark of DRAGGED_MARKS) delete el.dataset[mark];

  for (const follower of drag.followers) delete follower.dataset.dndDragging;

  for (const list of drag.states) for (const mark of LIST_MARKS) delete list.el.dataset[mark];
  delete document.documentElement.dataset.dndActive;
  drag.item.setDragging(false);
  drag.options.setActive(null);
  dragState().running = false;
  drag.registry.drag = undefined;
}

/**
 * Commits a settled drop: the lift comes down, `onMove` applies the move to the app's data and `flush()` renders it
 * in the same task, so the screen doesn't change. A throwing `onMove` still leaves nothing lifted.
 */
export function commit(drag: Drag, landing: Landing): void {
  drag.finishDrop = undefined;
  const hasMoved = landing.isDrop && (landing.list !== drag.homeState || landing.index !== drag.from);
  const move: SortableMove | null = hasMoved ? moveTo(drag, landing.list, landing.index) : null;
  const before = snapshot(drag, landing);
  restoreLift(drag, landing);

  try {
    if (move !== null) drag.options.onMove(move);
  } finally {
    flush();
    afterCommit(drag, { before, landing, move });
  }
}
