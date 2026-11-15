import type { Point } from "../geometry/geometry.types.ts";
import { rampedStep, scrollIntent } from "./scroll-intent.ts";
import { candidate } from "./scroll-position.ts";
import type { Directions, Scroller } from "./scroll.types.ts";

/** What auto-scroll keeps across the frames of one drag. */
export type AutoScrollState = {
  /** The directions the pointer has moved toward since the lift. */
  intent: Directions;
  /** When each container started scrolling, for the ramp. */
  engaged: Map<Scroller, number>;
};

/** One animation frame: the pointer, the time since the last frame, and the frame's time. */
export type ScrollFrame = {
  /** The pointer in viewport coordinates. */
  pointer: Point;
  /** Milliseconds since the last frame. */
  elapsed: number;
  /** The frame's timestamp. */
  time: number;
};

/** A fresh state: no direction aimed at yet, nothing scrolling. */
export function createAutoScroll(): AutoScrollState {
  return { engaged: new Map(), intent: { down: false, left: false, right: false, up: false } };
}

/** Marks the directions the pointer has moved toward since the lift. */
export function aim(intent: Directions, from: Point, to: Point): void {
  if (to.x > from.x) intent.right = true;

  if (to.x < from.x) intent.left = true;

  if (to.y > from.y) intent.down = true;

  if (to.y < from.y) intent.up = true;
}

/** Scrolls `scroller` by a delta. */
function scrollByDelta(scroller: Scroller, dx: number, dy: number): void {
  (scroller.doc ? window : scroller.el).scrollBy({ behavior: "instant", left: dx, top: dy });
}

/** One frame of auto-scroll through the user-scrollable containers of `chain`. True when anything scrolled. */
export function autoScroll(chain: readonly Scroller[], state: AutoScrollState, frame: ScrollFrame): boolean {
  const autos = chain.filter((scroller) => scroller.auto);
  const used = new Set<Scroller>();

  for (const claim of scrollIntent(frame.pointer, autos.map(candidate), state.intent)) {
    const scroller = autos[claim.index];

    if (scroller === undefined) continue;
    used.add(scroller);
    const since = state.engaged.get(scroller) ?? frame.time;
    state.engaged.set(scroller, since);
    const step = rampedStep(claim.speed, frame.elapsed, frame.time - since) * claim.direction;
    scrollByDelta(scroller, claim.axis === "x" ? step : 0, claim.axis === "y" ? step : 0);
  }

  for (const scroller of state.engaged.keys()) if (!used.has(scroller)) state.engaged.delete(scroller);

  return used.size > 0;
}
