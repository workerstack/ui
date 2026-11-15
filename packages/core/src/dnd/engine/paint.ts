import type { Point } from "../geometry/geometry.types.ts";
import { gridShift } from "../geometry/hit-test.ts";
import { px } from "../internal/css.ts";
import { SHIFT } from "../motion/motion.constants.ts";
import type { Drag } from "./drag.types.ts";
import type { ListState } from "./engine.types.ts";

/** A translate value. */
export function translateValue(t: Point): string {
  return `${px(t.x)} ${px(t.y)}`;
}

/** Writes a displaced element's translate, transitioned once transitions are on. */
function put(drag: Drag, target: HTMLElement, t: Point): void {
  if (drag.transitions) drag.ledger.set(target, { transition: `translate ${SHIFT}` });
  drag.ledger.set(target, { translate: translateValue(t) });
}

/** Moves the dragged element and its followers. */
export function moveDragged(drag: Drag, t: Point): void {
  drag.translate = t;

  for (const node of [drag.el, ...drag.followers]) drag.ledger.set(node, { translate: translateValue(t) });
}

/** A distance along the list's main axis, as a point. */
export function along(list: ListState, value: number): Point {
  return list.axis === "x" ? { x: value, y: 0 } : { x: 0, y: value };
}

/** Draws every box from its list's gap index: displaced ones move on by the dragged size. */
export function paint(drag: Drag, list: ListState): void {
  for (const [j, box] of list.boxes.entries()) {
    const t = list.grid
      ? gridShift(list.slots, j, list.index)
      : along(list, box.shift + (j >= list.index ? list.sign * list.amount : 0));

    const key = `${t.x} ${t.y}`;

    if (key === box.key) continue;
    box.key = key;

    for (const node of [box.el, ...box.followers]) put(drag, node, t);
  }
}
