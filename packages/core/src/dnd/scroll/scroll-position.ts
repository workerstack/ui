import type { Point, Rect } from "../geometry/geometry.types.ts";
import type { ScrollCandidate, Scroller } from "./scroll.types.ts";

// Offsets are fractional at times: half a pixel short of an end counts as the end.
const END_SLACK = 0.5;

/** How far content under `chain` has scrolled since the lift. */
export function scrolled(chain: readonly Scroller[]): Point {
  let x = 0;
  let y = 0;

  for (const scroller of chain) {
    x += scroller.x - scroller.x0;
    y += scroller.y - scroller.y0;
  }

  return { x, y };
}

/** A rect measured at lift under `chain`, moved by the scrolling since. */
export function current(rect: Rect, chain: readonly Scroller[]): Rect {
  const delta = scrolled(chain);

  return { height: rect.height, width: rect.width, x: rect.x - delta.x, y: rect.y - delta.y };
}

/** A scroller's padding box now: its own scroll doesn't move it, its outer ones do. */
export function scrollerRect(scroller: Scroller): Rect {
  return current(scroller.rect, scroller.outer);
}

/** The scroller as the auto-scroll math sees it: where it is and which ways it can still go. */
export function candidate(scroller: Scroller): ScrollCandidate {
  const { x, y, maxX, maxY, rtl } = scroller;
  const minX = rtl ? -maxX : 0;

  return {
    canScroll: {
      down: y < maxY - END_SLACK,
      left: x > minX + END_SLACK,
      right: x < minX + maxX - END_SLACK,
      up: y > END_SLACK,
    },
    rect: scrollerRect(scroller),
  };
}
