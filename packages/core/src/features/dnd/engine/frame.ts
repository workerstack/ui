// Pointer frames: each one follows the latest pointer with the dragged element, the target list, the index, the
// expanders and auto-scroll.
import { contains } from "../geometry/hit-test.ts";
import { clampAlong } from "../geometry/list-index.ts";
import { autoScroll } from "../scroll/auto-scroll.ts";
import { refreshOffsets } from "../scroll/scroll-chain.ts";
import { current, scrolled } from "../scroll/scroll-position.ts";
import type { Drag } from "./drag.types.ts";
import { computeIndex, pickTarget, relayout } from "./layout.ts";
import { along, moveDragged } from "./paint.ts";
import { origin } from "./slot.ts";
import { setTarget } from "./target.ts";

const EXPAND_MS = 500;
// An expander the drag has opened: it doesn't open again.

const OPENED = -1;
// A frame after a long pause (a hidden tab) counts as this long, so auto-scroll doesn't jump.

const MAX_FRAME_MS = 100;

/** Moves the dragged element after the pointer; in place, along the axis plus the scrolling, inside its list. */
function followPointer(drag: Drag): void {
  const { pointer, point, homeState, lift } = drag;
  let t = { x: pointer.x - point.x, y: pointer.y - point.y };

  if (drag.inPlace) {
    const delta = scrolled(homeState.chain);
    const o = origin(drag);
    const c = current(homeState.content, homeState.chain);
    t =
      homeState.axis === "x"
        ? along(homeState, clampAlong(o.x, t.x + delta.x, { length: c.width, size: lift.width, start: c.x }))
        : along(homeState, clampAlong(o.y, t.y + delta.y, { length: c.height, size: lift.height, start: c.y }));
  }

  if (t.x !== drag.translate.x || t.y !== drag.translate.y) moveDragged(drag, t);
}

/** Opens expanders the pointer has rested on long enough. */
function runExpanders(drag: Drag, time: number): void {
  for (const [exp, entry] of drag.expanding) {
    if (!contains(current(entry.rect, entry.chain), drag.pointer)) {
      entry.since = 0;
    } else if (entry.since === 0) {
      entry.since = time;
    } else if (entry.since > 0 && time - entry.since >= EXPAND_MS) {
      entry.since = OPENED;
      exp.onExpand();
    }
  }
}

/** Follows the latest pointer: the dragged element, the target list, then the index. */
export function update(drag: Drag, time: number): void {
  if (drag.changed) relayout(drag);

  if (drag.scrollDirty) {
    drag.scrollDirty = false;
    refreshOffsets(drag.cache.values());
  }

  followPointer(drag);
  const list = pickTarget(drag);
  setTarget(drag, list, list === null ? 0 : computeIndex(drag, list));
  runExpanders(drag, time);
}

/** One animation frame of a pointer drag; schedules the next. */
export function tick(drag: Drag, time: number): void {
  if (drag.phase !== "dragging") return;
  const elapsed = Math.min(time - drag.lastTime, MAX_FRAME_MS);
  drag.lastTime = time;
  update(drag, time);
  // Auto-scroll through the chain of the list under the pointer.
  const chain = (drag.target ?? drag.homeState).chain;

  if (autoScroll(chain, drag.scroll, { elapsed, pointer: drag.pointer, time })) drag.scrollDirty = true;
  drag.frame = requestAnimationFrame((next) => tick(drag, next));
}
