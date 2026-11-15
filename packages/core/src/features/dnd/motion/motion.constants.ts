/** How long siblings take to move out of the way, keyboard steps, placeholders and FLIP (hello-pangea). */
export const SHIFT_MS = 200;

/** The curve of those moves. */
export const SHIFT_EASING = "cubic-bezier(0.2, 0, 0, 1)";

/** A `transition` value for a translate that moves like a shift. */
export const SHIFT: string = `${SHIFT_MS}ms ${SHIFT_EASING}`;
