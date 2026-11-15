import { px } from "../internal/css.ts";
// Tree drag frames: each follows the latest pointer with the target, the chip, the indicator and hover expansion.
import { BACKWARD } from "../internal/dnd.constants.ts";
import { autoScroll } from "../scroll/auto-scroll.ts";
import { refreshOffsets } from "../scroll/scroll-chain.ts";
import { isRefused, rowEl, type TreeContext } from "./tree-context.ts";
import { type ElementRow, flatten } from "./tree-dom.ts";
import type { TreeDrag } from "./tree-drag.types.ts";
import { treeTarget } from "./tree-target.ts";
import { ARIA_FALSE } from "./tree.constants.ts";
import type { TreeTarget } from "./tree.types.ts";

const EXPAND_MS = 500;
// An expanded branch: it doesn't open again.

const OPENED = -1;
// A frame after a long pause (a hidden tab) counts as this long, so auto-scroll doesn't jump.

const MAX_FRAME_MS = 100;

/** Measures the rows in play: the visible ones, in the root's content coordinates. */
export function measureRows(tree: TreeContext, root: HTMLElement): ElementRow[] {
  const box = root.getBoundingClientRect();
  const rows = flatten(root, tree.options.canHaveChildren).filter((row) => row.visible);

  for (const row of rows) {
    const rect = row.el.getBoundingClientRect();
    row.top = rect.top - box.top - root.clientTop + root.scrollTop;
    row.height = rect.height;
  }

  return rows;
}

/** Shows the target (null clears it): an outlined row for "inside", else the line. */
export function mark(tree: TreeContext, drag: TreeDrag, target: TreeTarget | null): void {
  const isShown = target !== null;
  const isBlocked = isShown && drag.blocked;
  drag.target?.toggleAttribute("data-dnd-target", isShown);
  drag.target?.toggleAttribute("data-dnd-blocked", isBlocked);
  tree.indicator?.toggleAttribute("data-active", isShown && target.inside === null);
  tree.indicator?.toggleAttribute("data-dnd-blocked", isBlocked);
}

/** Moves the chip after the pointer and the indicator to the target's line and depth. */
function paint(tree: TreeContext, drag: TreeDrag, target: TreeTarget): void {
  const { pointer, point, ledger } = drag;

  if (tree.chip !== undefined)
    ledger.set(tree.chip, { translate: `${px(pointer.x - point.x)} ${px(pointer.y - point.y)}` });

  if (tree.indicator === undefined) return;
  const inset = (tree.options.inset ?? 0) + target.depth * tree.options.indent;
  const width = drag.tree.clientWidth - inset;
  ledger.set(tree.indicator, { "inset-inline-start": px(inset), top: px(target.line), width: px(width) });
}

/** A collapsed branch opens after the pointer rests inside it. */
function hoverExpand(tree: TreeContext, drag: TreeDrag, time: number): void {
  const inside = drag.target?.dataset.treeId;

  if (inside === undefined || drag.target?.getAttribute("aria-expanded") !== ARIA_FALSE) {
    drag.hover = null;
  } else if (drag.hover?.id !== inside) {
    drag.hover = { id: inside, since: time };
  } else if (drag.hover.since >= 0 && time - drag.hover.since >= EXPAND_MS) {
    drag.hover.since = OPENED;
    tree.options.expand(inside);
    drag.dirty = true;
  }
}

/** Where the pointer points the drag now. */
function targetNow(tree: TreeContext, drag: TreeDrag): TreeTarget {
  const { tree: root, pointer, point } = drag;
  const box = root.getBoundingClientRect();
  refreshOffsets(drag.chain);
  const y = pointer.y - box.top - root.clientTop + root.scrollTop;
  const dx = (pointer.x - point.x) * (drag.isRtl ? BACKWARD : 1);

  return treeTarget(drag.rows, drag.s, { dx, indent: tree.options.indent, y });
}

/** Follows the latest pointer: the target, the chip, the indicator and hover expansion. */
export function updateTree(tree: TreeContext, drag: TreeDrag, time: number): void {
  if (drag.dirty) {
    drag.dirty = false;
    drag.rows = measureRows(tree, drag.tree);
    drag.s = drag.rows.findIndex((row) => row.id === drag.id);
  }

  // Reads first, then writes.
  const target = targetNow(tree, drag);
  const { from, id } = drag;
  const to = { index: target.index, parent: target.parent };
  const isSame = to.parent === from.parent && to.index === from.index;
  drag.move = isSame ? null : { from, id, to };
  drag.blocked = drag.move === null ? false : isRefused(tree, drag.move);
  const next = rowEl(tree, target.inside);

  if (drag.target !== next) mark(tree, drag, null);
  drag.target = next;
  mark(tree, drag, target);
  paint(tree, drag, target);
  hoverExpand(tree, drag, time);
}

/** One animation frame of a tree drag; schedules the next. */
export function tickTree(tree: TreeContext, drag: TreeDrag, time: number): void {
  const elapsed = Math.min(time - drag.last, MAX_FRAME_MS);
  drag.last = time;
  updateTree(tree, drag, time);
  autoScroll(drag.chain, drag.scroll, { elapsed, pointer: drag.pointer, time });
  drag.frame = requestAnimationFrame((next) => tickTree(tree, drag, next));
}
