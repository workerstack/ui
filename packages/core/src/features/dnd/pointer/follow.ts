import type { Point } from "../geometry/geometry.types.ts";
import { ESCAPE } from "../internal/dnd.constants.ts";
import { listen } from "./listen.ts";
import { lockTouch } from "./touch-scroll.ts";

/** Stops an event before anything handles it. */
function block(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
}

/** Swallows the click a finished pointer drag would fire. */
function swallowClick(): void {
  addEventListener("click", block, { capture: true, once: true });
  setTimeout(() => removeEventListener("click", block, { capture: true }));
}

/** What a followed pointer reports: each move, and the end (a drop, or a cancel). */
export type FollowHandlers = {
  /** The pointer moved. */
  move: (point: Point) => void;
  /** The drag ends: dropped on release, canceled otherwise. */
  end: (drop: boolean) => void;
};

/**
 * Follows one pointer through a drag: its moves, its release (a drop: the click it would fire is swallowed), a
 * cancel, and Escape. Touch scrolling stays locked until the cleanup runs.
 */
export function follow(pointerId: number, on: FollowHandlers): () => void {
  lockTouch("lock");

  const offs = [
    listen("pointermove", (event) => {
      if (event.pointerId === pointerId) on.move({ x: event.clientX, y: event.clientY });
    }),
    listen("pointerup", (event) => {
      if (event.pointerId !== pointerId) return;
      swallowClick();
      on.end(true);
    }),
    listen("pointercancel", () => on.end(false)),
    listen("keydown", (event) => {
      if (event.key !== ESCAPE) return;
      event.preventDefault();
      on.end(false);
    }),
  ];

  return () => {
    for (const off of offs) off();
    lockTouch("unlock");
  };
}
