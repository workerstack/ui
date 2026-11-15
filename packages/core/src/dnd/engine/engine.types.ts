import type { Axis, Rect } from "../geometry/geometry.types.ts";
import type { Scroller } from "../scroll/scroll.types.ts";

/** A committed move: where the item was and where it goes. */
export type SortableMove = {
  /** The moved item's id. */
  id: string;
  /** The list it left and its index there. */
  from: {
    /** The id of the list it left. */
    list: string;
    /** Its index in that list before the move. */
    index: number;
  };
  /** Where it goes. */
  to: {
    /** The id of the destination list. */
    list: string;
    /** Index in the destination after the move; for a move within one list, counted without the item. */
    index: number;
  };
};

/** The dragged item and its destination while a drag runs. */
export type ActiveDrag = {
  /** The dragged item's id. */
  id: string;
  /** The list the gap is in. */
  list: string;
  /** The gap's index in that list. */
  index: number;
  /** The destination is refused: a drop there cancels. */
  blocked: boolean;
};

/** A list as the engine knows it. */
export type ListReg = {
  /** The list's id, reported in moves. */
  id: string;
  /** The list element, once its ref ran. */
  el?: HTMLElement;
  /** The main axis, or a wrapping grid. */
  axis: Axis | "grid";
  /** Announced name. */
  label?: () => string;
  /** True while the list takes no drags. */
  disabled?: () => boolean;
  /** Keyboard lift mode on this list's activators. */
  keyboard: boolean;
  /** Elements that move with each item, e.g. a column's cells. */
  followers?: (id: string) => Iterable<HTMLElement>;
};

/** An item as the engine knows it. */
export type ItemReg = {
  /** The item's id, reported in moves. */
  id: string;
  /** The item element, once its ref ran. */
  el?: HTMLElement;
  /** The drag handle, when the item has one. */
  handle?: HTMLElement;
  /** Announced name. */
  label?: () => string;
  /** True while the item can't be dragged. */
  disabled?: () => boolean;
  /** Tells the item it is lifted or settled. */
  setDragging: (dragging: boolean) => void;
};

/** A list whose element is known. */
export type PlacedList = ListReg & {
  /** The list element, once its ref ran. */
  el: HTMLElement;
};

/** An item whose element is known. */
export type PlacedItem = ItemReg & {
  /** The item element, once its ref ran. */
  el: HTMLElement;
};

/** Collapsed content that opens when a drag rests on it. */
export type ExpanderReg = {
  /** The element a drag rests on, once its ref ran. */
  el?: HTMLElement;
  /** Opens the content. */
  onExpand: () => void;
};

/** One item of a list in play. */
export type Box = {
  /** The item. */
  reg: PlacedItem;
  /** The item element. */
  el: HTMLElement;
  /** Layout without the dragged item, in viewport coordinates when last measured. */
  rect: Rect;
  /** In place: that layout minus where layout really puts the element, along the axis. */
  shift: number;
  /** The translate last written. */
  key: string;
  /** Elements that move with the item. */
  followers: HTMLElement[];
};

/** A list in play during a drag, measured. */
export type ListState = {
  /** The list. */
  reg: PlacedList;
  /** The list element. */
  el: HTMLElement;
  /** A wrapping grid. */
  grid: boolean;
  /** The main axis. */
  axis: Axis;
  /** Right to left. */
  rtl: boolean;
  /** Which way along the axis the list flows: −1 for right-to-left rows. */
  sign: number;
  /** CSS gap on the main axis. */
  gap: number;
  /** The list's border box, in viewport coordinates when last measured. */
  rect: Rect;
  /** The list's content box, in viewport coordinates when last measured. */
  content: Rect;
  /** Scrollers that move this list's items, innermost first. */
  chain: Scroller[];
  /** Scrollers that move the list itself. */
  outer: Scroller[];
  /** The items, the dragged one left out. */
  boxes: Box[];
  /** The gap's index; the item count when the gap is closed. */
  index: number;
  /** Grid slots: the original item rects, one more than the boxes. */
  slots: Rect[];
  /** How far displaced items move: the dragged margin box plus the gap. */
  amount: number;
  /** Holds the dragged item's space at the list's end (home), or grows a list it entered. */
  placeholder?: HTMLElement | undefined;
};
