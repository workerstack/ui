import type { DndMessages } from "../messages/dnd-messages.ts";
import type { Ledger } from "../motion/ledger.ts";
import { ROW } from "./tree-dom.ts";
import type { TreeDrag } from "./tree-drag.types.ts";
import type { SortableTreeOptions, TreeMove } from "./tree.types.ts";

/** One sortable tree: its options, its elements and the drag it runs. */
export type TreeContext = {
  options: SortableTreeOptions;
  messages: DndMessages;
  /** Reports the drag to `active()`. */
  setActive: (active: { id: string } | null) => void;
  /** The root's touch styles, kept across drags. */
  rootStyles: Ledger;
  /** The root's listeners. */
  offs: (() => void)[];
  root?: HTMLElement | undefined;
  indicator?: HTMLElement | undefined;
  chip?: HTMLElement | undefined;
  /** The running drag. */
  drag?: TreeDrag | undefined;
  /** The row the last press went down on, when it can drag. */
  pressed: HTMLElement | null;
};

/** The row element with `id`; null for null or a row not in the tree. */
export function rowEl(tree: TreeContext, id: string | null): HTMLElement | null {
  if (id === null || tree.root === undefined) return null;

  return tree.root.querySelector<HTMLElement>(`${ROW}[data-tree-id="${CSS.escape(id)}"]`);
}

/** Whether the row can take children. */
export function holds(tree: TreeContext, id: string): boolean {
  return tree.options.canHaveChildren?.(id) ?? rowEl(tree, id)?.hasAttribute("aria-expanded") === true;
}

/** The row's announced name: the label option, its `data-label`, its text, or its id. */
export function rowName(tree: TreeContext, id: string): string {
  const el = rowEl(tree, id);
  const text = el?.textContent.trim();

  return tree.options.label?.(id) ?? el?.dataset.label ?? (text === undefined || text === "" ? id : text);
}

/** Whether the move is refused: into a row that can't hold, or by `canMove`. */
export function isRefused(tree: TreeContext, move: TreeMove): boolean {
  return (move.to.parent !== null && !holds(tree, move.to.parent)) || tree.options.canMove?.(move) === false;
}
