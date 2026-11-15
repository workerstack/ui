// Auto-scroll math. Pure: the engine feeds it the scroll chain of the list under the pointer each frame and applies
// the result with `scrollBy`.
import type { Axis, Point, Rect } from "../geometry/geometry.types.ts";
import { BACKWARD } from "../internal/dnd.constants.ts";
import type { Directions, ScrollCandidate, ScrollClaim } from "./scroll.types.ts";

const BAND_SHARE = 0.25;
const BAND_MAX = 180;
const MAX_SPEED = 20;
const FRAMES_PER_SECOND = 60;
const FRAME_MS = 1000 / FRAMES_PER_SECOND;
const ENGAGE_MS = 400;
const AXES: readonly Axis[] = ["x", "y"];

/**
 * Speed for a pointer `distance` px inside an edge of a container `size` px long. The band is `min(25% of size,
 * 180px)`; speed grows with the square of depth and is full at half the band.
 */
export function edgeSpeed(distance: number, size: number): number {
  const band = Math.min(size * BAND_SHARE, BAND_MAX);

  if (distance >= band) return 0;
  const progress = Math.min(1, Math.max(0, (band - distance) / (band / 2)));

  return Math.max(1, MAX_SPEED * progress * progress);
}

/** Pixels to scroll this frame: speed normalized by frame time, ramped in over 400ms, at least 1. */
export function rampedStep(speed: number, elapsedMs: number, engagedMs: number): number {
  const ramp = Math.min(1, Math.max(0, engagedMs) / ENGAGE_MS);

  return Math.max(1, speed * (elapsedMs / FRAME_MS) * ramp);
}

/** Whether `point` lies in `rect`, its edges included. */
function inside(rect: Rect, point: Point): boolean {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

/** What one candidate would scroll on `axis` for the pointer, before its limits and the intent are checked. */
function edgeClaim(axis: Axis, pointer: Point, rect: Rect): Omit<ScrollClaim, "index"> & { key: keyof Directions } {
  const size = axis === "x" ? rect.width : rect.height;
  const toStart = axis === "x" ? pointer.x - rect.x : pointer.y - rect.y;
  const toEnd = size - toStart;
  const isAhead = toEnd <= toStart;
  const forward = axis === "x" ? "right" : "down";
  const backward = axis === "x" ? "left" : "up";

  return {
    axis,
    direction: isAhead ? 1 : BACKWARD,
    key: isAhead ? forward : backward,
    speed: edgeSpeed(isAhead ? toEnd : toStart, size),
  };
}

/** The pointer and what it has aimed at since the lift. */
type Aim = { pointer: Point; intent: Directions };

/** The innermost candidate that scrolls on `axis` this frame, if any. */
function claimAxis(axis: Axis, candidates: readonly ScrollCandidate[], aim: Aim): ScrollClaim | undefined {
  for (const [index, { rect, canScroll }] of candidates.entries()) {
    if (!inside(rect, aim.pointer)) continue;
    const { key, ...claim } = edgeClaim(axis, aim.pointer, rect);

    if (claim.speed > 0 && canScroll[key] && aim.intent[key]) return { ...claim, index };
  }

  return undefined;
}

/**
 * Which containers scroll which way this frame. For each axis the innermost container under the pointer whose edge
 * band holds it, that can still scroll that way, and whose direction the pointer has moved toward since the lift
 * claims the axis; outer containers get only unclaimed axes.
 */
export function scrollIntent(
  pointer: Point,
  candidates: readonly ScrollCandidate[],
  intent: Directions,
): ScrollClaim[] {
  return AXES.flatMap((axis) => claimAxis(axis, candidates, { intent, pointer }) ?? []);
}
