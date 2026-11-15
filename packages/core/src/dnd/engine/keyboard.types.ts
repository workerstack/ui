import type { Point, Rect } from "../geometry/geometry.types.ts";
import type { DndMessages } from "../messages/dnd-messages.ts";
import type { ListState } from "./engine.types.ts";

/** One keyboard drag, as the engine hands it over. */
export type KeySession = {
  /** What the drag started from: focus leaving it cancels. */
  activator: HTMLElement;
  /** The list with the gap: home until the gap moves. */
  target: () => ListState;
  /** Every list the item can move to, home included. */
  lists: () => ListState[];
  /** Whether the item may go to `index` in `list`. */
  allowed: (list: ListState, index: number) => boolean;
  /** A list's box clipped by its scrollers, or null when hidden. */
  visible: (list: ListState) => Rect | null;
  /** The dragged element's box now. */
  box: () => Rect;
  /** Measures again when lists or items changed since the last step. */
  remeasure: () => void;
  /** Moves the gap to `index` in `list`, the item with it, and keeps the slot in view. */
  place: (list: ListState, index: number) => void;
  /** Ends the drag: a drop, or a cancel. */
  end: (drop: boolean) => void;
  /** Speaks through the drag's live region. */
  say: (text: string) => void;
  /** The dragged item's announced name. */
  name: () => string;
  /** The strings to speak. */
  messages: DndMessages;
};

/** An item the plug-in makes liftable from the keyboard. */
export type KeyItem = {
  /** The item element. */
  el: HTMLElement;
  /** The handle, or the item itself. */
  activator: HTMLElement;
  /** No handle: the whole item is the activator, and Enter keeps its own meaning. */
  whole: boolean;
  /** The instructions handles are described by. */
  instructions: string;
  /** Settles a running drop, then says whether the item can lift now. */
  ready: () => boolean;
  /** Lifts the item, at the activator's center. */
  start: (point: Point) => void;
};

/** Keyboard lift mode: a plug-in for the core sortable. */
export type KeyboardMode = {
  /** Wires keyboard lifting on an item; the cleanup restores `aria-describedby`. */
  bind: (item: KeyItem) => () => void;
  /** Runs one keyboard drag; returns its listeners' cleanups. */
  drag: (session: KeySession) => (() => void)[];
};
