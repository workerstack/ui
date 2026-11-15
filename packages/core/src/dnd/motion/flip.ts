import { SHIFT_EASING } from "./motion.constants.ts";

// Less than half a pixel either way is no move.
const STILL = 0.5;

/** Whether the user asked for reduced motion. */
export function reducedMotion(): boolean {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** An offset to animate from, and for how long; 0 skips the animation. */
export type FlipFrom = {
  /** Horizontal offset from where layout puts the element. */
  dx: number;
  /** Vertical offset from where layout puts the element. */
  dy: number;
  /** Milliseconds. */
  duration: number;
};

/** Animates `el` from an offset back to where layout puts it (the last step of FLIP). */
export function flip(el: HTMLElement, from: FlipFrom): void {
  if (from.duration === 0 || (Math.abs(from.dx) < STILL && Math.abs(from.dy) < STILL)) return;

  el.animate([{ translate: `${from.dx}px ${from.dy}px` }, { translate: "0px 0px" }], {
    duration: from.duration,
    easing: SHIFT_EASING,
  });
}
