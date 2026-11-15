const MIN_DROP_MS = 250;
const MAX_DROP_MS = 400;
const DROP_DISTANCE = 1500;
const CANCEL_FACTOR = 0.6;

/** How a drag ends: dropped on a slot, or canceled back home. */
export type Ending = "drop" | "cancel";

/** Drop animation length: 250ms at rest, rising linearly to 400ms at 1500px; cancels take 0.6×. */
export function dropDuration(distance: number, ending: Ending): number {
  const ratio = Math.min(Math.max(distance, 0), DROP_DISTANCE) / DROP_DISTANCE;
  const ms = MIN_DROP_MS + (MAX_DROP_MS - MIN_DROP_MS) * ratio;

  return Math.round(ending === "cancel" ? ms * CANCEL_FACTOR : ms);
}
