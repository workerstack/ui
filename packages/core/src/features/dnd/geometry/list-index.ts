import { LAST, NONE } from "../internal/dnd.constants.ts";
// Pure list math for the engine. Everything here works on numbers measured once at lift, so a pointer move never
// reads layout.
import type { Flow, Rect, Span } from "./geometry.types.ts";

/**
 * A rect's extent on the flow's axis. Horizontal right-to-left lists flow from the right, so x is negated: `start`
 * stays the logical start and larger still means later in the list.
 */
export function span(rect: Rect, flow: Flow): Span {
  if (flow.axis === "y") return { end: rect.y + rect.height, start: rect.y };

  if (flow.rtl) return { end: -rect.x, start: -(rect.x + rect.width) };

  return { end: rect.x + rect.width, start: rect.x };
}

/** The dragged box on a list's main axis, and how far displaced items move. */
export type DraggedSpan = Span & {
  /** The dragged size plus the list's gap. */
  gap: number;
};

/**
 * The gap's new index in a one-dimensional list.
 *
 * `centers` are the items' layout centers on the main axis after the lift (the dragged item left the flow), in list
 * order. The gap sits at `current`: items at or after it are displaced, drawn `box.gap` further along.
 *
 * - A displaced item stays displaced while the box's end hasn't passed its visual center (`end ≤ center + gap`).
 * - A non-displaced item becomes displaced once the box's start passes its center (`start < center`).
 *
 * The thresholds move with the displacement, which is the hysteresis: an item that just moved aside needs the box to
 * travel back past its new center before it returns, so variable sizes never flicker. The index is the first
 * displaced item. A newly entered list passes `current = centers.length`.
 */
export function listIndex(centers: readonly number[], current: number, box: DraggedSpan): number {
  const index = centers.findIndex((center, i) => (i >= current ? box.end <= center + box.gap : box.start < center));

  return index === NONE ? centers.length : index;
}

/** Where a box at `value` on the main axis enters a list: the count of item centers before it. */
export function insertionAt(spans: readonly Span[], value: number): number {
  return spans.filter((item) => (item.start + item.end) / 2 < value).length;
}

/** The main-axis layout a slot is found in: the items, the space after the last one, and the content start. */
export type SlotLayout = {
  /** The items on the main axis, in list order. */
  items: readonly Span[];
  /** Space from the last item's end to a slot after it. */
  gap: number;
  /** Where the first slot of an empty list starts. */
  contentStart: number;
};

/**
 * Where a dropped item's margin box starts on the main axis: the start of the item now at `index`, after the last
 * item and the gap at the end, or the content start when empty.
 */
export function slotStart(layout: SlotLayout, index: number): number {
  const at = layout.items[index];

  if (at !== undefined) return at.start;
  const last = layout.items.at(LAST);

  return last === undefined ? layout.contentStart : last.end + layout.gap;
}

/** A list's extent on the main axis, and the size of a box that has to stay inside it. */
export type Track = {
  /** The list content's start. */
  start: number;
  /** The list content's length. */
  length: number;
  /** The box's size. */
  size: number;
};

/**
 * An in-place item follows the pointer along the axis but stays inside its list: the delta that keeps a box at `at`
 * within the track.
 */
export function clampAlong(at: number, delta: number, track: Track): number {
  return Math.min(Math.max(at + delta, track.start), track.start + track.length - track.size) - at;
}
