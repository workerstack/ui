import { NONE } from "../internal/dnd.constants.ts";
import type { Flow, Point, Rect } from "./geometry.types.ts";

/** Whether `point` lies in `rect`, its far edges excluded. */
export function contains(rect: Rect, point: Point): boolean {
  return point.x >= rect.x && point.x < rect.x + rect.width && point.y >= rect.y && point.y < rect.y + rect.height;
}

/** The overlap of two rects; null when they don't overlap. */
export function intersect(a: Rect, b: Rect): Rect | null {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const width = Math.min(a.x + a.width, b.x + b.width) - x;
  const height = Math.min(a.y + a.height, b.y + b.height) - y;

  return width > 0 && height > 0 ? { height, width, x, y } : null;
}

/** The grid slot holding `center`; in a gap between slots the index stays at `current`. */
export function gridIndex(slots: readonly Rect[], center: Point, current: number): number {
  const index = slots.findIndex((slot) => contains(slot, center));

  return index === NONE ? current : index;
}

/**
 * The translate for the item laid out in slot `j` (its index without the dragged item) when the gap is at `gap`: it
 * draws in slot `j + 1` from the gap on. `slots` are the original rects, one more than the items left after the lift.
 */
export function gridShift(slots: readonly Rect[], j: number, gap: number): Point {
  const from = slots[j];
  const to = slots[j >= gap ? j + 1 : j];

  if (from === undefined || to === undefined) return { x: 0, y: 0 };

  return { x: to.x - from.x, y: to.y - from.y };
}

/**
 * The strip past a list's end on its main axis, `size` long, where the list's gap opens. A drop there lands at the
 * list's end, even before its placeholder has grown into it.
 */
export function endStrip(rect: Rect, flow: Flow, size: number): Rect {
  if (flow.axis === "y") return { height: size, width: rect.width, x: rect.x, y: rect.y + rect.height };

  if (flow.rtl) return { height: rect.height, width: size, x: rect.x - size, y: rect.y };

  return { height: rect.height, width: size, x: rect.x + rect.width, y: rect.y };
}
