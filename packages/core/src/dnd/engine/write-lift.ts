// The lift's write phase, after every read.
import { px } from "../internal/css.ts";
import { createPlaceholder } from "./create-placeholder.ts";
import type { Drag } from "./drag.types.ts";
import { paint } from "./paint.ts";

// Safari anchors fixed elements to the visual viewport while pinch-zoomed (dnd-kit).
const SAFARI = /^((?!chrome|android).)*safari/i;

/** Lifts the dragged element into the top layer, where it renders above everything and is never clipped. */
function liftIntoTopLayer(drag: Drag): void {
  const { lift, el, homeState } = drag;
  homeState.placeholder = createPlaceholder(drag, homeState, homeState.axis === "x" ? lift.width : lift.height);
  const viewport = SAFARI.test(navigator.userAgent) ? visualViewport : null;
  drag.ledger.set(el, {
    ...drag.reset,
    bottom: "auto",
    "box-sizing": "border-box",
    height: px(lift.height),
    left: px(lift.x + (viewport?.offsetLeft ?? 0)),
    margin: "0",
    "pointer-events": "none",
    position: "fixed",
    right: "auto",
    top: px(lift.y + (viewport?.offsetTop ?? 0)),
    translate: "0px 0px",
    width: px(lift.width),
    "will-change": "translate",
  });
  el.setAttribute("popover", "manual");
  el.showPopover();
}

/** Marks the dragged element, its home, its followers and the scrollers in play. */
function mark(drag: Drag): void {
  const { el, ledger } = drag;
  el.dataset.dndDragging = "";

  if (drag.pointerId === null) el.dataset.dndKeyboard = "";
  drag.homeState.el.dataset.dndSource = "";
  drag.homeState.el.dataset.dndTarget = "";

  for (const scroller of drag.cache.values())
    if (!scroller.doc && scroller.el instanceof HTMLElement) ledger.set(scroller.el, { "overflow-anchor": "none" });

  // Followers move with the item and share its dragging state, e.g. a column's cells.
  for (const follower of drag.followers) {
    ledger.set(follower, { position: "relative", "z-index": "1" });
    follower.dataset.dndDragging = "";
  }
}

/** Writes the lift: the page's drag styles, the lifted element, its marks and the pre-shifted home list. */
export function writeLift(drag: Drag): void {
  const root = document.documentElement;
  drag.ledger.set(root, { "-webkit-user-select": "none", cursor: "grabbing", "user-select": "none" });
  root.dataset.dndActive = "";
  getSelection()?.removeAllRanges();

  if (drag.inPlace) drag.ledger.set(drag.el, { position: "relative", "z-index": "1" });
  else liftIntoTopLayer(drag);
  mark(drag);
  paint(drag, drag.homeState);
  // Transitions start one frame after the pre-shift has painted: turned on in the same frame, the pre-shift itself
  // would animate and the items would slide at lift.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      drag.transitions = !drag.reduced;
    }),
  );
}
