// Pointer input for browser tests. Vitest's user events have no press-move-release, so these dispatch the
// pointer events a real mouse or touchscreen sends, at real coordinates, on the element under the point, one
// animation frame per step. Ported from the monorepo's Playwright fixtures (repo.dnd.fixtures.ts).

/** A point in the viewport. */
export type Spot = { x: number; y: number };

/** Which pointer drives a gesture. */
export type PointerKind = "mouse" | "touch";

/** The main axis of a list. */
export type Axis = "x" | "y";

/** The pointer events a gesture sends. */
type PointerEventType = "pointerdown" | "pointermove" | "pointerup";

/** A pointer that presses, moves and releases like a real one. */
export type Pointer = {
  /** Which pointer it is. */
  kind: PointerKind;
  /** Where it is now; set it to place the next `fire`. */
  at: Spot;
  /** The element the press went down on, until the release. */
  pressed: Element | null;
  /** Sends one pointer event at `at`, to the element under it; returns that element. */
  fire: (type: PointerEventType) => Element;
  /** Presses at `spot`. */
  down: (spot: Spot) => void;
  /** Moves to `to` in `steps`, a frame apart. */
  move: (to: Spot, steps?: number) => Promise<void>;
  /** Releases; a mouse also clicks the nearest element both the press and the release hit. */
  up: () => void;
  /** Presses at `from` and passes the 5px threshold across `axis`, so the main-axis offset stays exact. */
  lift: (from: Spot, axis?: Axis) => Promise<void>;
};

/** A drag by a handle until its item's center sits on a spot (handles aren't always centered). */
export type CenterDrag = {
  /** Where the press goes down. */
  handle: Element;
  /** The item whose center lands on `to`. */
  item: Element;
  /** Where the item's center lands. */
  to: Spot;
  /** The list's main axis. @default "y" */
  axis?: Axis;
};

/** Pixels the lift moves across the list's axis, past the engine's 5px threshold. */
const LIFT = 6;

/** Steps the lift takes. */
const LIFT_STEPS = 2;

/** Steps a drag takes from the lift to the target. */
const STEPS = 16;

/** Frames that pass with nothing to show, for asserting that nothing happens. */
const QUIET_FRAMES = 6;

/** The `button` of a move: no button changed. */
const NO_BUTTON_CHANGE = -1;

/** Pointer ids: a mouse and a touch never share one. */
const POINTER_ID: Record<PointerKind, number> = { mouse: 1, touch: 2 };

/** The `buttons` held during each event: none once released. */
const BUTTONS: Record<PointerEventType, number> = { pointerdown: 1, pointermove: 1, pointerup: 0 };

/** The `button` each event reports. */
const BUTTON: Record<PointerEventType, number> = { pointerdown: 0, pointermove: NO_BUTTON_CHANGE, pointerup: 0 };

/** Resolves after the next animation frame. */
export function frame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/** Resolves after `count` animation frames, for asserting that nothing happens. */
export async function frames(count = QUIET_FRAMES): Promise<void> {
  if (count <= 0) return;
  await frame();
  await frames(count - 1);
}

/** The center of an element. */
export function centerOf(el: Element): Spot {
  const box = el.getBoundingClientRect();

  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** A spot just past an element's end or before its start, on `axis`, at its center on the other axis. */
export function beside(el: Element, side: "after" | "before", axis: Axis = "y"): Spot {
  const box = el.getBoundingClientRect();
  const isAfter = side === "after";

  if (axis === "y") return { x: box.x + box.width / 2, y: isAfter ? box.bottom + LIFT : box.y - LIFT };

  return { x: isAfter ? box.right + LIFT : box.x - LIFT, y: box.y + box.height / 2 };
}

/** `spot` moved `by` pixels across `axis`. */
function across(spot: Spot, axis: Axis, by: number): Spot {
  return axis === "y" ? { x: spot.x + by, y: spot.y } : { x: spot.x, y: spot.y + by };
}

/** Sends one pointer event at the pointer's spot, to the element under it. */
function fire(pointer: Pointer, type: PointerEventType): Element {
  const target = document.elementFromPoint(pointer.at.x, pointer.at.y) ?? document.body;

  const event = new PointerEvent(type, {
    bubbles: true,
    button: BUTTON[type],
    buttons: BUTTONS[type],
    cancelable: true,
    clientX: pointer.at.x,
    clientY: pointer.at.y,
    composed: true,
    isPrimary: true,
    pointerId: POINTER_ID[pointer.kind],
    pointerType: pointer.kind,
  });

  target.dispatchEvent(event);

  return target;
}

/** Moves through `path`, one spot a frame. */
async function walk(pointer: Pointer, path: Spot[]): Promise<void> {
  const [next, ...rest] = path;

  if (next === undefined) return;
  pointer.at = next;
  pointer.fire("pointermove");
  await frame();
  await walk(pointer, rest);
}

/** The `steps` evenly spaced spots from `from` to `to`, `to` last. */
function line(from: Spot, to: Spot, steps: number): Spot[] {
  return Array.from({ length: steps }, (_, i) => ({
    x: from.x + ((to.x - from.x) * (i + 1)) / steps,
    y: from.y + ((to.y - from.y) * (i + 1)) / steps,
  }));
}

/** The nearest element that holds both `a` and `b`. */
function commonAncestor(a: Element, b: Element): Element | null {
  let common: Element | null = a;

  while (common !== null && !common.contains(b)) common = common.parentElement;

  return common;
}

/** Releases, and fires the click a mouse sends on the nearest element both the press and the release hit. */
function release(pointer: Pointer): void {
  const released = pointer.fire("pointerup");
  const { pressed } = pointer;
  pointer.pressed = null;

  if (pointer.kind !== "mouse" || pressed === null) return;
  const { x, y } = pointer.at;
  const click = new MouseEvent("click", { bubbles: true, cancelable: true, clientX: x, clientY: y });
  commonAncestor(released, pressed)?.dispatchEvent(click);
}

/** A pointer of `kind`, resting at the viewport's corner. */
export function createPointer(kind: PointerKind = "mouse"): Pointer {
  const pointer: Pointer = {
    at: { x: 0, y: 0 },
    down: (spot) => {
      pointer.at = spot;
      pointer.pressed = pointer.fire("pointerdown");
    },
    fire: (type) => fire(pointer, type),
    kind,
    lift: async (from, axis = "y") => {
      pointer.down(from);
      await pointer.move(across(from, axis, LIFT), LIFT_STEPS);
    },
    move: (to, steps = 1) => walk(pointer, line(pointer.at, to, steps)),
    pressed: null,
    up: () => release(pointer),
  };

  return pointer;
}

/** Presses `from`'s center, lifts across the axis, moves to `to` (kept off-axis by the lift) and releases. */
export async function drag(from: Element, to: Spot, axis: Axis = "y"): Promise<void> {
  const pointer = createPointer();
  await pointer.lift(centerOf(from), axis);
  await pointer.move(across(to, axis, LIFT), STEPS);
  pointer.up();
}

/** Drags by the handle until the item's center sits on the spot. */
export async function dragCenterTo({ handle, item, to, axis = "y" }: CenterDrag): Promise<void> {
  const grip = centerOf(handle);
  const middle = centerOf(item);
  await drag(handle, { x: to.x - (middle.x - grip.x), y: to.y - (middle.y - grip.y) }, axis);
}
