import type { Rect } from "../geometry/geometry.types.ts";
import { contains, endStrip, gridIndex, intersect } from "../geometry/hit-test.ts";
import { listIndex, span } from "../geometry/list-index.ts";
import { pickList } from "../geometry/pick-list.ts";
import { NONE } from "../internal/dnd.constants.ts";
import { remeasureScrollers } from "../scroll/scroll-chain.ts";
import { current, scrollerRect } from "../scroll/scroll-position.ts";
import type { Drag } from "./drag.types.ts";
import type { ListState } from "./engine.types.ts";
import { measureList } from "./measure-list.ts";
import { isLinked, measureExpanders } from "./read-lift.ts";
import { childrenOf } from "./registry.ts";
import { draggedRect } from "./slot.ts";

/** A list's visible rect: its box clipped by its scrollers and the viewport; null when hidden. */
export function visible(list: ListState): Rect | null {
  let rect: Rect | null = current(list.rect, list.outer);

  for (const scroller of list.chain) if (rect !== null) rect = intersect(rect, scrollerRect(scroller));

  return rect;
}

/** The observer of hidden lists' containers: a report after the first marks layout for measuring again. */
function observer(drag: Drag): ResizeObserver {
  const resizes = new ResizeObserver(() => {
    if (drag.primed && drag.phase === "dragging") drag.changed = true;
    drag.primed = true;
  });

  drag.offs.push(() => resizes.disconnect());

  return resizes;
}

/**
 * Lists hidden at lift (a collapsed section, mounted but clipped to nothing) appear when the container clipping them
 * grows, which registers nothing: watch those containers and measure again on the next frame. Visible lists'
 * containers aren't watched, so placeholders growing in them cost nothing. The first report is the size at lift,
 * which is already known.
 */
export function watchHidden(drag: Drag): void {
  for (const list of drag.states) {
    if (visible(list) !== null) continue;

    for (const scroller of list.chain) {
      if (scroller.doc || drag.watched.has(scroller.el)) continue;
      drag.watched.add(scroller.el);
      drag.resizes ??= observer(drag);
      drag.resizes.observe(scroller.el);
    }
  }
}

/** Reads layout again after something changed it (a placeholder settled, a list appeared). */
export function relayout(drag: Drag): void {
  const { registry, homeState } = drag;
  drag.changed = false;
  remeasureScrollers(drag.cache.values());

  const next = [...registry.lists.values()]
    .filter((reg) => isLinked(drag, reg))
    .map((reg) => {
      const keep = drag.states.find((list) => list.reg === reg);

      return measureList(drag, { again: true, keep, members: childrenOf(registry, reg), reg });
    });

  const wanted = drag.target?.reg;
  const target = wanted === undefined ? null : next.find((list) => list.reg === wanted);
  const own = next.find((list) => list.reg === drag.home);

  // Home keeps its identity: the drag holds it.
  if (own !== undefined) next[next.indexOf(own)] = Object.assign(homeState, own);
  drag.states = next;
  drag.target = target !== null && target === own ? homeState : (target ?? null);
  measureExpanders(drag);
  watchHidden(drag);
}

/** The gap's index in `list` for where the dragged element is now. */
export function computeIndex(drag: Drag, list: ListState): number {
  const box = draggedRect(drag);

  if (list.grid) {
    const slots = list.slots.map((slot) => current(slot, list.chain));
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

    return Math.min(gridIndex(slots, center, list.index), list.boxes.length);
  }

  const centers = list.boxes.map((other) => {
    const s = span(current(other.rect, list.chain), list);

    return (s.start + s.end) / 2;
  });

  return listIndex(centers, list.index, { ...span(box, list), gap: list.amount });
}

/** The list under the pointer; null outside every list. */
export function pickTarget(drag: Drag): ListState | null {
  const { states, target, pointer } = drag;

  if (states.length <= 1) return drag.homeState;
  let pick = pickList(states.map(visible), pointer, target === null ? NONE : states.indexOf(target));
  // The gap past the target's end belongs to it, even before its placeholder has grown, unless the pointer rests on
  // an expander there: opening the gap would push it away.

  const isOnExpander = [...drag.expanding.values()].some((entry) =>
    contains(current(entry.rect, entry.chain), pointer),
  );

  if (pick === NONE && target !== null && !target.grid && !isOnExpander) {
    const end = endStrip(current(target.rect, target.outer), target, target.amount);

    if (contains(end, pointer)) pick = states.indexOf(target);
  }

  return states[pick] ?? null;
}
