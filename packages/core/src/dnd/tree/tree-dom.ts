import type { TreeRow } from "./tree.types.ts";

/** What marks a tree row. */
export const ROW = '[role="treeitem"][data-tree-id]';

/** A row with its element, and whether it shows (no collapsed branch hides it). */
export type ElementRow = TreeRow & { el: HTMLElement; visible: boolean };

/** The row's depth from its `data-level`; 0 without one. */
function levelOf(el: HTMLElement): number {
  const level = Number(el.dataset.level);

  return Number.isInteger(level) && level > 0 ? level : 0;
}

/** Every row in document order, collapsed ones included, with depth, parent and child count. */
export function flatten(root: HTMLElement, holds?: (id: string) => boolean): ElementRow[] {
  const rows: ElementRow[] = [];
  const stack: ElementRow[] = [];

  for (const el of root.querySelectorAll<HTMLElement>(ROW)) {
    const id = el.dataset.treeId ?? "";
    const depth = levelOf(el);
    const parent = stack[depth - 1];

    if (parent !== undefined) parent.size++;

    const row: ElementRow = {
      depth,
      el,
      height: 0,
      holds: holds === undefined ? el.hasAttribute("aria-expanded") : holds(id),
      id,
      parent: parent?.id ?? null,
      size: 0,
      top: 0,
      visible: el.closest("[hidden]") === null,
    };

    stack[depth] = row;
    stack.length = depth + 1;
    rows.push(row);
  }

  return rows;
}
