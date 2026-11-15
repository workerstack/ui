import { NONE } from "../internal/dnd.constants.ts";
import type { Axis, Direction, Point, Rect } from "./geometry.types.ts";
import { contains } from "./hit-test.ts";

/** The box around every rect given; null when there are none. */
function bounds(rects: readonly Rect[]): Rect | null {
  if (rects.length === 0) return null;
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));

  return { height: bottom - top, width: right - left, x: left, y: top };
}

/**
 * The list under the pointer. In a gap between lists the `current` one stays while the pointer is inside the box that
 * bounds every visible list (stickiness); outside that box there is none (−1). `null` marks a list that isn't visible.
 */
export function pickList(rects: readonly (Rect | null)[], pointer: Point, current: number): number {
  const hit = rects.findIndex((rect) => rect !== null && contains(rect, pointer));

  if (hit !== NONE) return hit;
  const box = bounds(rects.filter((rect) => rect !== null));

  return box !== null && contains(box, pointer) ? current : NONE;
}

// Lists that touch or overlap by less than this count as neighbors.
const TOUCHING_PX = 1;

/** A rect's extent on `axis`, as start and end. */
function extent(rect: Rect, axis: Axis): [number, number] {
  return axis === "x" ? [rect.x, rect.x + rect.width] : [rect.y, rect.y + rect.height];
}

/** How far `b` lies past `a` in `direction`, or null when they don't overlap across it. */
function distance(a: Rect, b: Rect, direction: Direction): number | null {
  const along: Axis = direction === "left" || direction === "right" ? "x" : "y";
  const across: Axis = along === "x" ? "y" : "x";
  const [aStart, aEnd] = extent(a, along);
  const [bStart, bEnd] = extent(b, along);
  const [aFrom, aTo] = extent(a, across);
  const [bFrom, bTo] = extent(b, across);

  if (bFrom >= aTo || aFrom >= bTo) return null;

  return direction === "right" || direction === "down" ? bStart - aEnd : aStart - bEnd;
}

/**
 * The nearest list from `from` in a physical direction, among the lists overlapping it across that direction (so a
 * board's Left and Right stay in one lane); −1 when there is none.
 */
export function neighbor(rects: readonly (Rect | null)[], from: number, direction: Direction): number {
  const a = rects[from];
  let best = NONE;
  let nearest = Number.POSITIVE_INFINITY;

  if (a === null || a === undefined) return best;

  for (const [i, b] of rects.entries()) {
    const gap = b === null || i === from ? null : distance(a, b, direction);

    if (gap !== null && gap > -TOUCHING_PX && gap < nearest) {
      best = i;
      nearest = gap;
    }
  }

  return best;
}
