// Pointer activation: a press on an activator waits for 5px of travel (mouse, pen, a touch on a handle) or a 250ms
// hold (a touch on a whole item, so a swipe still scrolls the page). Nothing here calls preventDefault on
// pointerdown: clicks, focus and text fields behave natively.
import type { Point } from "../geometry/geometry.types.ts";
import { TOUCH } from "../internal/dnd.constants.ts";
import { dragState } from "../internal/drag-state.ts";
import { listen } from "./listen.ts";
import { INTERACTIVE, LONG_PRESS_MS, THRESHOLD } from "./pointer.constants.ts";

/** Whether a press on `target` started inside an interactive element within the activator. */
function fromInteractive(target: EventTarget | null, activator: Element): boolean {
  if (!(target instanceof Element)) return false;
  const hit = target.closest(INTERACTIVE);

  return hit !== null && hit !== activator && activator.contains(hit);
}

/** How a press on an activator turns into a drag. */
export type PressOptions = {
  /** False while this activator can't start a drag (disabled, or a drag already running). */
  ready: () => boolean;
  /** True when the activator is the whole item (no handle): touch needs a long press. */
  whole: boolean;
  /** Called once the press becomes a drag, with the pointer's position at that moment. */
  start: (point: Point, pointerId: number) => void;
};

/** Whether `to` is far enough from `from` to start a drag. */
function far(from: Point, to: Point): boolean {
  return Math.abs(to.x - from.x) >= THRESHOLD || Math.abs(to.y - from.y) >= THRESHOLD;
}

/** A press waiting to become a drag. */
type Pending = { id: number; origin: Point; last: Point; isTouch: boolean; isLong: boolean; stops: (() => void)[] };

/** The listeners that end a pending press, or let it travel. */
function pressListeners(press: Pending, stop: () => void, go: () => void): (() => void)[] {
  return [
    listen("pointermove", (move) => {
      if (move.pointerId !== press.id) return;
      press.last = { x: move.clientX, y: move.clientY };

      if (!far(press.origin, press.last)) return;

      if (press.isLong) stop();
      else go();
    }),
    listen("pointerup", stop),
    listen("pointercancel", stop),
    listen("scroll", () => {
      if (!press.isTouch) stop();
    }),
    listen("contextmenu", (menu) => {
      if (press.isTouch) menu.preventDefault();
    }),
    listen("dragstart", (drag) => drag.preventDefault()),
  ];
}

/** Waits for a pressed pointer to travel or hold, then starts the drag; any other outcome drops the press. */
function pending(event: PointerEvent, options: PressOptions): void {
  const origin = { x: event.clientX, y: event.clientY };
  const isTouch = event.pointerType === TOUCH;

  const press: Pending = {
    id: event.pointerId,
    isLong: isTouch && options.whole,
    isTouch,
    last: origin,
    origin,
    stops: [],
  };

  function stop(): void {
    clearTimeout(timer);

    for (const off of press.stops.splice(0)) off();
  }

  function go(): void {
    stop();
    options.start(press.last, press.id);
  }

  const timer = press.isLong ? setTimeout(go, LONG_PRESS_MS) : undefined;
  press.stops.push(...pressListeners(press, stop, go));
}

/** Wires press-to-drag on `activator`; returns the cleanup. */
export function watchPress(activator: HTMLElement, options: PressOptions): () => void {
  function down(event: PointerEvent): void {
    const { claimed } = dragState();

    if (claimed.has(event) || event.button !== 0 || !event.isPrimary) return;

    if (fromInteractive(event.target, activator) || !options.ready()) return;
    claimed.add(event);
    pending(event, options);
  }

  activator.addEventListener("pointerdown", down);

  return () => activator.removeEventListener("pointerdown", down);
}
