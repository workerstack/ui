// Keyboard lift mode, a plug-in for the core sortable (the batteries sortable includes it). Space lifts a focused
// activator (Enter too, on a handle); arrows, Home and End move the gap through the list and on into the nearest list
// that way; Space or Enter drops, Escape cancels. Without it, core lists drag by pointer only and this code stays out
// of the bundle.
import { instructions } from "../announce/instructions.ts";
import { prepareRegion } from "../announce/live-region.ts";
import type { KeyboardMode, KeyItem, KeySession } from "../engine/keyboard.types.ts";
import { ESCAPE } from "../internal/dnd.constants.ts";
import { listen } from "../pointer/listen.ts";
import { FOCUSABLE } from "../pointer/pointer.constants.ts";
import { arrowDirection } from "./arrow-direction.ts";
import { keyboardStep } from "./keyboard-step.ts";
import { END, ENTER, HOME, SPACE, TAB } from "./keyboard.constants.ts";

const DESCRIBED_BY = "aria-describedby";

/** What takes the lift keys: the activator, or a whole item's first focusable (a link); null when nothing can. */
function keyTarget(item: KeyItem): HTMLElement | null {
  if (item.activator.matches(FOCUSABLE)) return item.activator;

  return item.whole ? item.el.querySelector<HTMLElement>(FOCUSABLE) : null;
}

/** Puts the attribute back as it was before the bind. */
function restore(el: HTMLElement, describedBy: string | null): void {
  if (describedBy === null) el.removeAttribute(DESCRIBED_BY);
  else el.setAttribute(DESCRIBED_BY, describedBy);
}

/** The cleanup of an item nothing was bound on. */
function unbound(): void {
  // Nothing was bound.
}

/** Wires keyboard lifting on an item; the cleanup restores `aria-describedby`. */
function bind(item: KeyItem): () => void {
  const found = keyTarget(item);

  if (found === null) return unbound;
  const keys: HTMLElement = found;
  const describedBy = keys.getAttribute(DESCRIBED_BY);
  const id = instructions(item.instructions);
  keys.setAttribute(DESCRIBED_BY, describedBy === null || describedBy === "" ? id : `${describedBy} ${id}`);
  prepareRegion();

  function onKey(event: KeyboardEvent): void {
    const isLift = event.key === SPACE || (event.key === ENTER && !item.whole);

    // A running drag's window listener sees the key first: a drop key it took must not lift the item again.
    if (!isLift || event.defaultPrevented || event.target !== keys || event.repeat || !item.ready()) return;
    event.preventDefault();
    const rect = keys.getBoundingClientRect();
    item.start({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
  }

  keys.addEventListener("keydown", onKey);

  return () => {
    keys.removeEventListener("keydown", onKey);
    restore(keys, describedBy);
  };
}

/** The keyup that follows a drop must not press the button either. */
function swallowKeyup(key: string): void {
  const offUp = listen("keyup", (up) => {
    if (up.key === key) up.preventDefault();
    offUp();
  });
}

/** Handles one key of a running keyboard drag. */
function onDragKey(session: KeySession, event: KeyboardEvent): void {
  const { key } = event;

  if (key === TAB) return event.preventDefault();

  if (key === ESCAPE || key === SPACE || key === ENTER) {
    event.preventDefault();

    if (key !== ESCAPE) swallowKeyup(key);

    return session.end(key !== ESCAPE);
  }

  if (key === HOME || key === END || arrowDirection(key) !== undefined) {
    event.preventDefault();
    keyboardStep(session, key);
  }
}

/** Runs one keyboard drag; returns its listeners' cleanups. */
function drag(session: KeySession): (() => void)[] {
  function cancel(): void {
    session.end(false);
  }

  session.activator.addEventListener("focusout", cancel);

  return [
    () => session.activator.removeEventListener("focusout", cancel),
    listen("keydown", (event) => onDragKey(session, event)),
    listen("keyup", (event) => {
      if (event.key === SPACE || event.key === ENTER) event.preventDefault();
    }),
    listen("pointerdown", cancel),
  ];
}

/** Keyboard lift mode: pass it as the core sortable's `keyboard` option. */
export const keyboard: KeyboardMode = { bind, drag };
