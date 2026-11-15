import type { ActiveDrag, SortableMove } from "../../engine/engine.types.ts";
import type { KeyboardMode } from "../../engine/keyboard.types.ts";
import type { DndMessages } from "../../messages/dnd-messages.ts";

/** What a sortable is told by the app. */
export type SortableOptions = {
  /** Apply the move to your data synchronously. Runs after the drop animation. */
  onMove: (move: SortableMove) => void;
  /** Return false to block a destination: shown as blocked, a drop there cancels. */
  canMove?: (move: SortableMove) => boolean;
  /**
   * Item ids are positions (rows rendered by index, like a form array). After a commit the DOM already shows the new
   * order, so nothing slides into place.
   */
  positional?: boolean;
  /** A drag started on the item with this id. */
  onDragStart?: (id: string) => void;
  /** The move when dropped, null when canceled. */
  onDragEnd?: (move: SortableMove | null) => void;
  /** Every announcement and instruction string (the UI kit passes its translated ones). */
  messages: DndMessages;
  /** Keyboard lift mode (the `keyboard` entry). Without it, items drag by pointer only. */
  keyboard?: KeyboardMode;
};

/** One list of a sortable. */
export type ListOptions = {
  /** The list's id, reported in moves. */
  id: string;
  /** The list's main axis. "grid" is a wrapping row of equal items (single list only). @default "y" */
  axis?: "y" | "x" | "grid";
  /** Announced name, e.g. a column and lane. */
  label?: () => string;
  /** True while the list takes no drags. */
  disabled?: () => boolean;
  /** Keyboard lift mode on this list's activators, when the sortable has it. @default true */
  keyboard?: boolean;
  /** Elements that move with each item, e.g. a column's cells. Switches the list to in-place mode. */
  followers?: (id: string) => Iterable<HTMLElement>;
};

/** One item of a sortable list. */
export type ItemOptions = {
  /** The item's id, reported in moves. */
  id: string;
  /** Announced name. */
  label?: () => string;
  /** True while the item can't be dragged. */
  disabled?: () => boolean;
};

/** An item's bindings. */
export type SortableItem = {
  /** On the item element: a direct child of the list element. */
  ref: (element: HTMLElement) => void;
  /** On a drag handle. Without one the whole item starts drags (a long press on touch). */
  handle: (element: HTMLElement) => void;
  /** True while the item is lifted or settling. */
  dragging: () => boolean;
};

/** Collapsed content a drag opens by resting on it. */
export type ExpanderOptions = {
  /** Opens the content. */
  onExpand: () => void;
};

/** A sortable: its binding factories, the running drag, and a cancel. */
export type Sortable = {
  /** Binds a list element. */
  list: (options: ListOptions) => (element: HTMLElement) => void;
  /** Binds an item element and its handle. */
  item: (options: ItemOptions) => SortableItem;
  /** Opens collapsed content (a lane, a section) when a drag rests on it for 500ms. */
  expander: (options: ExpanderOptions) => (element: HTMLElement) => void;
  /** The dragged item and its destination while a drag runs. */
  active: () => ActiveDrag | null;
  /** Cancels the running drag. */
  cancel: () => void;
};
