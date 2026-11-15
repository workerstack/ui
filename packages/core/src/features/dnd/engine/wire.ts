// A running drag's listeners: what ends it from outside, and the keyboard or pointer that moves it.
import { say } from "../announce/live-region.ts";
import type { Point } from "../geometry/geometry.types.ts";
import { LAST } from "../internal/dnd.constants.ts";
import { SHIFT } from "../motion/motion.constants.ts";
import { follow } from "../pointer/follow.ts";
import { listen } from "../pointer/listen.ts";
import { aim } from "../scroll/auto-scroll.ts";
import { refreshOffsets } from "../scroll/scroll-chain.ts";
import type { Drag } from "./drag.types.ts";
import { endDrag } from "./end-drag.ts";
import type { ListState } from "./engine.types.ts";
import { tick } from "./frame.ts";
import type { KeySession } from "./keyboard.types.ts";
import { relayout, visible } from "./layout.ts";
import { itemName } from "./names.ts";
import { moveDragged } from "./paint.ts";
import { draggedRect, translateTo } from "./slot.ts";
import { isAllowed, setTarget } from "./target.ts";

/** Cancels the browser's default for the event. */
function prevent(event: Event): void {
  event.preventDefault();
}

/** Adds a listener on `target` that the drag's cleanups remove. */
function on(drag: Drag, target: EventTarget, listener: { type: string; fn: (event: Event) => void }): void {
  target.addEventListener(listener.type, listener.fn);
  drag.offs.push(() => target.removeEventListener(listener.type, listener.fn));
}

/** Moves the gap to `index` in `list`, the item with it, and keeps the slot in view (keyboard). */
function place(drag: Drag, list: ListState, index: number): void {
  setTarget(drag, list, index);
  drag.ledger.set(drag.el, { transition: drag.reduced ? "none" : `translate ${SHIFT}` });
  moveDragged(drag, translateTo(drag, list, index));
  // Keep the new slot in view: the item there now, or the last one at the end.
  (list.boxes[index] ?? list.boxes.at(LAST))?.el.scrollIntoView({ block: "nearest", inline: "nearest" });
  refreshOffsets(drag.cache.values());
}

/** The session a keyboard plug-in runs one drag through. */
function keySession(drag: Drag): KeySession {
  return {
    activator: drag.activator,
    allowed: (list, index) => isAllowed(drag, list, index),
    box: () => draggedRect(drag),
    end: (drop) => endDrag(drag, drop ? "drop" : "cancel"),
    lists: () => drag.states,
    messages: drag.options.messages,
    name: () => itemName(drag),
    place: (list, index) => place(drag, list, index),
    remeasure: () => {
      if (drag.changed) relayout(drag);
    },
    say: (text) => say(text, drag.modal),
    target: () => drag.target ?? drag.homeState,
    visible,
  };
}

/** Follows the dragging pointer until its release, a cancel or the loss of its capture. */
function wirePointer(drag: Drag, pointerId: number): void {
  const { activator } = drag;

  try {
    activator.setPointerCapture(pointerId);
  } catch {
    // The pointer is gone already: the release ends the drag.
  }

  // Only the activator's own loss counts: a touch is first captured by the element under it (an icon inside a
  // handle), and that capture moving here bubbles up as a loss too.
  on(drag, activator, {
    fn: (event) => {
      if (event.target === activator) endDrag(drag, "cancel");
    },
    type: "lostpointercapture",
  });

  function move(next: Point): void {
    aim(drag.scroll.intent, drag.pointer, next);
    drag.pointer = next;
  }

  drag.offs.push(follow(pointerId, { end: (drop) => endDrag(drag, drop ? "drop" : "cancel"), move }));
  drag.frame = requestAnimationFrame((time) => tick(drag, time));
}

/** Wires a lifted drag: hiding the page, blurring or resizing the window cancels it; scrolling marks it to measure. */
export function wire(drag: Drag): void {
  on(drag, document, {
    fn: () => {
      if (document.hidden) endDrag(drag, "cancel");
    },
    type: "visibilitychange",
  });
  drag.offs.push(
    listen("blur", () => endDrag(drag, "cancel")),
    listen("resize", () => endDrag(drag, "cancel")),
    listen(
      "scroll",
      () => {
        drag.scrollDirty = true;
      },
      { capture: true, passive: true },
    ),
    listen("contextmenu", prevent),
    listen("dragstart", prevent),
  );

  // Only the keyboard plug-in starts drags without a pointer.
  if (drag.pointerId === null) drag.offs.push(...(drag.options.keyboard?.drag(keySession(drag)) ?? []));
  else wirePointer(drag, drag.pointerId);
}
