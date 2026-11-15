// Safari honors preventDefault on touchmove only from a non-passive listener that existed before the touch began,
// so one stays on the window while any whole-item activator is registered.
import { dragState } from "../internal/drag-state.ts";

/** Blocks a touch scroll while a touch drag runs. */
function blockTouch(event: TouchEvent): void {
  if (dragState().touchLocked && event.cancelable) event.preventDefault();
}

/** Keeps the window's touchmove blocker while the caller needs it; returns the release. */
export function holdTouchScroll(): () => void {
  const state = dragState();

  if (state.touchHolders === 0) addEventListener("touchmove", blockTouch, { passive: false });
  state.touchHolders += 1;

  return () => {
    state.touchHolders -= 1;

    if (state.touchHolders === 0) removeEventListener("touchmove", blockTouch);
  };
}

/** Stops touch scrolling while a touch drag runs, or lets it go again. */
export function lockTouch(locked: "lock" | "unlock"): void {
  dragState().touchLocked = locked === "lock";
}
