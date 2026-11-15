import type { ListState } from "../engine/engine.types.ts";
import type { Direction, Rect } from "../geometry/geometry.types.ts";
import { current } from "../scroll/scroll-position.ts";
import { END, HOME } from "./keyboard.constants.ts";

// In a grid, a row away weighs more than any distance along it: the nearest row first, then the nearest column.
const ROW_WEIGHT = 10_000;
// Slots less than this far apart vertically count as one row.

const ROW_SLACK_PX = 1;

/** The numbers `map(0)` … `map(count - 1)`; none for a count below 1. */
export function range(count: number, map: (i: number) => number): number[] {
  return Array.from({ length: Math.max(0, count) }, (_, i) => map(i));
}

/** The directions forward and back along a list. */
type Flows = { forward: Direction; backward: Direction };

/** The direction that moves forward along a list, and the one that moves back. */
function flowDirections(list: ListState): Flows {
  if (!list.grid && list.axis === "y") return { backward: "up", forward: "down" };

  return list.rtl ? { backward: "right", forward: "left" } : { backward: "left", forward: "right" };
}

/** A grid's slots up or down from the gap, nearest first. */
function gridOrder(list: ListState, direction: Direction): number[] {
  const slots = list.slots.slice(0, list.boxes.length + 1).map((slot) => current(slot, list.chain));
  const here: Rect | undefined = slots[list.index];

  if (here === undefined) return [];
  const isUp = direction === "up";

  return slots
    .map((slot, i) => ({ i, score: Math.abs(slot.y - here.y) * ROW_WEIGHT + Math.abs(slot.x - here.x), slot }))
    .filter(({ slot }) => (isUp ? slot.y < here.y - ROW_SLACK_PX : slot.y > here.y + ROW_SLACK_PX))
    .toSorted((a, b) => a.score - b.score)
    .map(({ i }) => i);
}

/** The indexes a key tries in the list with the gap, in order; empty when the key leaves the list. */
export function keyOrder(list: ListState, key: string, direction: Direction | undefined): number[] {
  const n = list.boxes.length;
  const { index } = list;
  const flow = flowDirections(list);

  if (key === HOME) return range(n + 1, (i) => i);

  if (key === END) return range(n + 1, (i) => n - i);

  if (direction === flow.forward) return range(n - index, (i) => index + 1 + i);

  if (direction === flow.backward) return range(index, (i) => index - 1 - i);

  if (list.grid && (direction === "up" || direction === "down")) return gridOrder(list, direction);

  return [];
}
