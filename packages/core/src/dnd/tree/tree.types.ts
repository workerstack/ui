// Pure tree math runs on rows flattened in document order. Rows are measured once at lift; `top` and `height` are in
// the tree's content coordinates, so scrolling never invalidates them.
import type { DndMessages } from "../messages/dnd-messages.ts";

/** One row of a tree, flattened in document order. */
export type TreeRow = {
  /** The row's id. */
  id: string;
  /** Its level, from 0. */
  depth: number;
  /** Its parent's id; null at the top level. */
  parent: string | null;
  /** Can take children. */
  holds: boolean;
  /** Direct children, collapsed ones included. */
  size: number;
  /** Its top in the tree's content coordinates. */
  top: number;
  /** Its height. */
  height: number;
};

/** A place in a tree: a parent (null at the top level) and an index among its children. */
export type TreePlace = {
  /** The parent row's id; null at the top level. */
  parent: string | null;
  /** The index among the parent's children. */
  index: number;
};

/** A committed tree move. */
export type TreeMove = {
  /** The moved row's id. */
  id: string;
  /** Where it was. */
  from: TreePlace;
  /** `index` among the new parent's children, without the moved item. */
  to: TreePlace;
};

/** Where a dragged row lands. */
export type TreeTarget = TreePlace & {
  /** The level it lands at. */
  depth: number;
  /** The row taking an "inside" drop. */
  inside: string | null;
  /** The indicator line's y; unused for an "inside" drop. */
  line: number;
};

/** Which part of a row the pointer is over. */
export type Zone = "before" | "after" | "inside";

/** A menu or shortcut move. */
export type TreeDirection = "up" | "down" | "indent" | "outdent";

/** What a sortable tree is told by the app. */
export type SortableTreeOptions = {
  /** Applies a committed move to the app's data, synchronously. */
  onMove: (move: TreeMove) => void;
  /** False blocks a destination. */
  canMove?: (move: TreeMove) => boolean;
  /** Rows that can take children. @default rows with aria-expanded (branches) */
  canHaveChildren?: (id: string) => boolean;
  /** Opens a collapsed branch when a drag hovers it. */
  expand: (id: string) => void;
  /** Pixels per level, matching the tree's indentation. */
  indent: number;
  /** Pixels from the tree's edge to a top-level row's content, where the indicator line starts. @default 0 */
  inset?: number;
  /** A row's announced name. */
  label?: (id: string) => string;
  /** Announcement strings; English defaults otherwise. */
  messages?: Partial<DndMessages>;
};

/** A sortable tree's bindings and its running drag. */
export type SortableTree = {
  /** On the tree root (role="tree"). */
  root: (element: HTMLElement) => void;
  /** On an absolutely positioned indicator element inside the root, styled by the app. */
  indicator: (element: HTMLElement) => void;
  /** On the drag chip element, styled by the app; the engine sets its text and shows it in the top layer. */
  preview: (element: HTMLElement) => void;
  /** The dragged row while a drag runs. */
  active: () => {
    /** The dragged row's id. */
    id: string;
  } | null;
};
