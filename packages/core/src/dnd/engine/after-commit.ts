import { say } from "../announce/live-region.ts";
import { flip } from "../motion/flip.ts";
import { SHIFT_EASING, SHIFT_MS } from "../motion/motion.constants.ts";
import { FOCUSABLE } from "../pointer/pointer.constants.ts";
import type { Drag, Landing } from "./drag.types.ts";
import type { SortableMove } from "./engine.types.ts";
import { itemName, listName } from "./names.ts";

/** A commit that has rendered: where things showed before it, where the drag landed, and the move it made. */
export type Committed = { before: Map<string, DOMRect>; landing: Landing; move: SortableMove | null };

/** Keyed items slide from where they were drawn to where the new order puts them. */
function flipAll(drag: Drag, before: Map<string, DOMRect>): void {
  if (drag.options.positional === true) return;

  for (const [id, rect] of before) {
    const node = drag.registry.byId.get(id)?.el;

    if (node?.isConnected !== true) continue;
    const now = node.getBoundingClientRect();
    flip(node, { duration: drag.reduced ? 0 : SHIFT_MS, dx: rect.x - now.x, dy: rect.y - now.y });
  }
}

/** Closes the placeholder of a home the item left. */
function closeHome(drag: Drag, landing: Landing): void {
  const ph = drag.homeState.placeholder;

  if (landing.list === drag.homeState || ph === undefined) return;
  const main = drag.homeState.axis === "x" ? "width" : "height";
  const frames = [{ [main]: ph.style.getPropertyValue(main) }, { [main]: "0px", margin: "0px" }];
  const close = ph.animate(frames, { duration: drag.reduced ? 0 : SHIFT_MS, easing: SHIFT_EASING });

  void close.finished.then(
    () => ph.remove(),
    () => ph.remove(),
  );
}

/** What the drag's end says. */
function spoken(drag: Drag, landing: Landing): string {
  const { messages } = drag.options;
  const name = itemName(drag);
  const position = landing.index + 1;
  const total = landing.list.boxes.length + 1;

  if (!landing.isDrop) return messages.canceled(name, drag.from + 1);

  if (landing.list !== drag.homeState) {
    return messages.movedAcross({
      from: listName(drag.homeState),
      item: name,
      position,
      to: listName(landing.list),
      total,
    });
  }

  return messages.dropped({ item: name, list: landing.list.reg.label?.(), position, total });
}

/** What takes focus after the commit: the item's handle or element, or the first focusable inside it. */
function focusTarget(drag: Drag): HTMLElement | null {
  const next = drag.registry.byId.get(drag.item.id);
  const target = next?.handle ?? next?.el;

  if (target === undefined) return null;

  return target.matches(FOCUSABLE) ? target : target.querySelector<HTMLElement>(FOCUSABLE);
}

/** Focus follows the item unless the user has moved it elsewhere since the drop; then the end is spoken. */
function refocus(drag: Drag, text: string): void {
  const focusable = focusTarget(drag);
  const now = document.activeElement;
  const isKept = now === null || now === document.body || drag.el.contains(now);

  if (drag.focused && isKept) focusable?.focus({ preventScroll: true });
  say(text, drag.modal);
}

/** Everything after the commit's `flush()`: FLIP, the home placeholder closing, `onDragEnd`, focus and speech. */
export function afterCommit(drag: Drag, committed: Committed): void {
  flipAll(drag, committed.before);
  closeHome(drag, committed.landing);
  drag.options.onDragEnd?.(committed.move);
  const text = spoken(drag, committed.landing);
  requestAnimationFrame(() => refocus(drag, text));
}
