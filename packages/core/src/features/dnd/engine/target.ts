import { px } from "../internal/css.ts";
import { SHIFT_EASING, SHIFT_MS } from "../motion/motion.constants.ts";
import { current } from "../scroll/scroll-position.ts";
import { createPlaceholder } from "./create-placeholder.ts";
import type { Drag } from "./drag.types.ts";
import type { ListState, SortableMove } from "./engine.types.ts";
import { paint } from "./paint.ts";
import { slotAt } from "./slot.ts";

/** The move that puts the dragged item at `index` of `list`. */
export function moveTo(drag: Drag, list: ListState, index: number): SortableMove {
  return { from: { index: drag.from, list: drag.home.id }, id: drag.item.id, to: { index, list: list.reg.id } };
}

/** Whether the item may go to `index` of `list`: `canMove`, asked once per destination. */
export function isAllowed(drag: Drag, list: ListState, index: number): boolean {
  const key = `${list.reg.id} ${index}`;
  const known = drag.allowed.get(key);

  if (known !== undefined) return known;
  const ok = drag.options.canMove?.(moveTo(drag, list, index)) ?? true;
  drag.allowed.set(key, ok);

  return ok;
}

/** A placeholder growing or shrinking to `to` pixels, and what runs once it settles. */
type Resize = { ph: HTMLElement; to: number; done?: () => void };

/** Animates a placeholder's size on the main axis; a relayout follows once it settles. */
function resize(drag: Drag, list: ListState, change: Resize): void {
  const main = list.axis === "x" ? "width" : "height";
  const { ph } = change;
  const value = ph.style.getPropertyValue(main);
  const start = value === "" ? "0px" : value;
  const to = px(change.to);
  ph.style.setProperty(main, to);

  function finish(): void {
    change.done?.();

    if (drag.phase === "dragging") drag.changed = true;
  }

  if (drag.reduced) return finish();

  ph.animate([{ [main]: start }, { [main]: to }], { duration: SHIFT_MS, easing: SHIFT_EASING }).finished.then(
    finish,
    finish,
  );
}

/** Closes the gap in the list the drag leaves, and shrinks away a placeholder it grew there. */
function leave(drag: Drag, left: ListState): void {
  delete left.el.dataset.dndTarget;
  delete left.el.dataset.dndBlocked;
  drag.ledger.set(left.el, { "--dnd-gap-size": "", "--dnd-gap-start": "" });
  left.index = left.boxes.length;
  paint(drag, left);
  const ph = left.placeholder;

  if (left === drag.homeState || ph === undefined) return;
  left.placeholder = undefined;
  resize(drag, left, { done: () => ph.remove(), ph, to: 0 });
}

/** Opens the gap at `index` of `list`, growing a placeholder in a list the drag entered. */
function open(drag: Drag, list: ListState, index: number): void {
  const isHorizontal = list.axis === "x";

  if (list !== drag.homeState && list.placeholder === undefined) {
    list.placeholder = createPlaceholder(drag, list, 0);
    resize(drag, list, { ph: list.placeholder, to: isHorizontal ? drag.lift.width : drag.lift.height });
  }

  list.index = index;
  paint(drag, list);
  // The gap's place for the app's slot outline, from the list's own box.
  const slot = slotAt(drag, list, index);
  const o = current(list.rect, list.outer);
  const { el } = list;

  const start = isHorizontal
    ? slot.x - o.x - el.clientLeft + el.scrollLeft
    : slot.y - o.y - el.clientTop + el.scrollTop;

  drag.ledger.set(el, {
    "--dnd-gap-size": px(isHorizontal ? drag.lift.width : drag.lift.height),
    "--dnd-gap-start": px(start),
  });
}

/** Marks the dragged element and the list blocked, or clears the mark. */
function markBlocked(drag: Drag, list: ListState | null): void {
  for (const node of list === null ? [drag.el] : [drag.el, list.el]) {
    if (drag.blocked) node.dataset.dndBlocked = "";
    else delete node.dataset.dndBlocked;
  }
}

/** Reports the target, index and block to `setActive` when they changed since the last report. */
function report(drag: Drag): void {
  const { target, blocked } = drag;
  const active = target === null ? `none ${blocked}` : `${target.reg.id} ${target.index} ${blocked}`;

  if (active === drag.reported) return;
  drag.reported = active;
  drag.options.setActive({
    blocked,
    id: drag.item.id,
    index: target?.index ?? drag.from,
    list: target?.reg.id ?? drag.home.id,
  });
}

/** Moves the gap into `list` at `index`, or closes it everywhere (null), and reports what changed. */
export function setTarget(drag: Drag, list: ListState | null, index: number): void {
  if (list !== drag.target) {
    if (drag.target !== null) leave(drag, drag.target);
    drag.target = list;

    if (list !== null) list.el.dataset.dndTarget = "";
  }

  drag.blocked = list !== null && !isAllowed(drag, list, index);
  markBlocked(drag, list);

  if (list !== null && !drag.blocked) open(drag, list, index);
  report(drag);
}
