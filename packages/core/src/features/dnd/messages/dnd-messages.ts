// Announcement and instruction strings. English defaults; an app passes translated ones through the `messages`
// option.

/** Where an item is: its name, its position (from 1) of a total, and the list's name when it has one. */
export type DndSpot = {
  /** The item's announced name. */
  item: string;
  /** Its position in the list, from 1. */
  position: number;
  /** How many items the list holds. */
  total: number;
  /** The list's announced name, when it has one. */
  list?: string | undefined;
};

/** A move between two lists: the item, the lists' names, and where it landed. */
export type DndAcross = {
  /** The item's announced name. */
  item: string;
  /** The name of the list it left. */
  from: string;
  /** The name of the list it landed in. */
  to: string;
  /** Its position in the new list, from 1. */
  position: number;
  /** How many items the new list holds. */
  total: number;
};

/** A tree move: the item, its new parent (undefined at the top level), and where it landed. */
export type DndTreeSpot = {
  /** The row's announced name. */
  item: string;
  /** The new parent's name; undefined at the top level. */
  parent: string | undefined;
  /** Its position among the parent's children, from 1. */
  position: number;
  /** How many children the parent holds. */
  total: number;
};

/** Every string drag and drop speaks or shows. */
export type DndMessages = {
  /** Read with keyboard-capable handles (aria-describedby). */
  instructions: string;
  /** An item was picked up at a position of a list. */
  lifted: (spot: DndSpot) => string;
  /** A keyboard step moved the lifted item. */
  moved: (spot: DndSpot) => string;
  /** The item was dropped within its list. */
  dropped: (spot: DndSpot) => string;
  /** The item was dropped in another list. */
  movedAcross: (move: DndAcross) => string;
  /** The drag was canceled and the item went back. */
  canceled: (item: string, position: number) => string;
  /** The item can't go into a list. */
  blocked: (item: string, list: string) => string;
  /** No allowed position lies that way. */
  noMove: (item: string) => string;
  /** A tree item moved under a parent, or to the top level when `parent` is undefined. */
  treeMoved: (spot: DndTreeSpot) => string;
};

/** ` in {list}`, or nothing without a list name. */
function where(list?: string): string {
  return list === undefined || list === "" ? "" : ` in ${list}`;
}

/** The English strings. */
export const defaultMessages: DndMessages = {
  blocked: (item, list) => `${item} can't move to ${list}.`,
  canceled: (item, position) => `Move canceled. ${item} is back at position ${position}.`,
  dropped: (spot) => `Dropped ${spot.item} at position ${spot.position} of ${spot.total}${where(spot.list)}.`,
  instructions: "Press Space to pick up. Use the arrow keys to move, Space to drop, Escape to cancel.",
  lifted: (spot) => `Picked up ${spot.item}. Position ${spot.position} of ${spot.total}${where(spot.list)}.`,
  moved: (spot) => `${spot.item}, position ${spot.position} of ${spot.total}${where(spot.list)}.`,
  movedAcross: (move) =>
    `Moved ${move.item} from ${move.from} to ${move.to}, position ${move.position} of ${move.total}.`,
  noMove: (item) => `${item} can't move further.`,
  treeMoved: (spot) =>
    spot.parent === undefined
      ? `Moved ${spot.item} to the top level, position ${spot.position} of ${spot.total}.`
      : `Moved ${spot.item} into ${spot.parent}, position ${spot.position} of ${spot.total}.`,
};

/** The defaults with `messages` laid over them. */
export function resolveMessages(messages?: Partial<DndMessages>): DndMessages {
  return messages === undefined ? defaultMessages : { ...defaultMessages, ...messages };
}
