/** A form array's item as a drag speaks of it: its name, and its position (from 1) of a total. */
type ArraySpot = {
  /** The item's name, e.g. “Item 2”. */
  item: string;
  /** Its position, from 1. */
  position: number;
  /** How many items the array holds. */
  total: number;
};

/** The strings of a form array's parts. */
export type ArrayMessages = {
  /** What a drag says when it is canceled and the form array's item went back to `position`. */
  arrayCanceled: (item: string, position: number) => string;
  /** What a drag says when a form array's item is dropped. */
  arrayDropped: (spot: ArraySpot) => string;
  /** The name of a form array's item group, by its position (from 1). */
  arrayItem: (position: number) => string;
  /** What a drag says when a form array's item is picked up. */
  arrayLifted: (spot: ArraySpot) => string;
  /** The accessible name of the button that moves a form array's item down, by its position (from 1). */
  arrayMoveDown: (position: number) => string;
  /** The accessible name of the button that moves a form array's item up, by its position (from 1). */
  arrayMoveUp: (position: number) => string;
  /** The accessible name of the button that removes a form array's item, by its position (from 1). */
  arrayRemove: (position: number) => string;
};

/** English for `ArrayMessages`. */
export const ARRAY_MESSAGES_EN: ArrayMessages = {
  arrayCanceled: (item, position) => `Move canceled. ${item} is back at position ${position}.`,
  arrayDropped: (spot) => `Dropped ${spot.item} at position ${spot.position} of ${spot.total}.`,
  arrayItem: (position) => `Item ${position}`,
  arrayLifted: (spot) => `Picked up ${spot.item}. Position ${spot.position} of ${spot.total}.`,
  arrayMoveDown: (position) => `Move item ${position} down`,
  arrayMoveUp: (position) => `Move item ${position} up`,
  arrayRemove: (position) => `Remove item ${position}`,
};
