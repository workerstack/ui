import { modalOf, say } from "../announce/live-region.ts";
import type { Point } from "../geometry/geometry.types.ts";
import { px } from "../internal/css.ts";
import { NONE, RTL } from "../internal/dnd.constants.ts";
import { createLedger } from "../motion/ledger.ts";
import { follow } from "../pointer/follow.ts";
import { aim, createAutoScroll } from "../scroll/auto-scroll.ts";
import { scrollChain } from "../scroll/scroll-chain.ts";
import { finishTreeDrag } from "./finish-tree-drag.ts";
import { rowName, type TreeContext } from "./tree-context.ts";
import type { ElementRow } from "./tree-dom.ts";
import type { TreeDrag } from "./tree-drag.types.ts";
import { measureRows, tickTree } from "./tree-frame.ts";
import { siblingIndex } from "./tree-rows.ts";

// The chip sits this far below and after the pointer.
const CHIP_OFFSET = 12;

/** Shows the chip in the top layer at the pointer, with the dragged row's name. */
function showChip(tree: TreeContext, drag: TreeDrag): void {
  const { chip } = tree;

  if (chip === undefined) return;
  chip.textContent = rowName(tree, drag.id);
  // The popover UA style sets inset: 0, so the far edges go back to auto.
  drag.ledger.set(chip, {
    bottom: "auto",
    left: px(drag.point.x + CHIP_OFFSET),
    margin: "0",
    "pointer-events": "none",
    position: "fixed",
    right: "auto",
    top: px(drag.point.y + CHIP_OFFSET),
    translate: "0px 0px",
  });
  chip.setAttribute("popover", "manual");
  chip.showPopover();
}

/** The dragged row and its descendants. */
function subtreeOf(rows: ElementRow[], s: number, source: ElementRow): ElementRow[] {
  const end = rows.findIndex((row, k) => k > s && row.depth <= source.depth);

  return rows.slice(s, end === NONE ? undefined : end);
}

/** A tree drag's parts that don't depend on the row: the root's facts, and nothing moved yet. */
function idle(root: HTMLElement, point: Point): Omit<TreeDrag, "from" | "id" | "rows" | "s" | "source" | "subtree"> {
  return {
    blocked: false,
    chain: scrollChain(root, new Map()),
    dirty: false,
    frame: 0,
    hover: null,
    isRtl: getComputedStyle(root).direction === RTL,
    last: performance.now(),
    ledger: createLedger(),
    modal: modalOf(root),
    move: null,
    offs: [],
    point,
    pointer: point,
    scroll: createAutoScroll(),
    target: null,
    tree: root,
  };
}

/** A drag of the row `el` with the rows measured; undefined when the row isn't shown. */
function createTreeDrag(tree: TreeContext, el: HTMLElement, point: Point): TreeDrag | undefined {
  const { root } = tree;

  if (root === undefined) return undefined;
  const id = el.dataset.treeId ?? "";
  const rows = measureRows(tree, root);
  const s = rows.findIndex((row) => row.id === id);
  const source = rows[s];

  if (source === undefined) return undefined;

  const from = { index: siblingIndex(rows, s), parent: source.parent };

  return { ...idle(root, point), from, id, rows, s, source, subtree: subtreeOf(rows, s, source) };
}

/** Lifts the row `el` from a press: marks its subtree, shows the chip, follows the pointer and announces it. */
export function startTreeDrag(tree: TreeContext, el: HTMLElement, press: { point: Point; pointerId: number }): void {
  const created = createTreeDrag(tree, el, press.point);

  if (created === undefined) return;
  const drag: TreeDrag = created;

  for (const row of drag.subtree) row.el.dataset.dndSource = "";
  showChip(tree, drag);

  function move(next: Point): void {
    aim(drag.scroll.intent, drag.pointer, next);
    drag.pointer = next;
  }

  const end = { end: (drop: boolean) => finishTreeDrag(tree, drag, drop ? "drop" : "cancel"), move };
  drag.offs.push(follow(press.pointerId, end));
  tree.drag = drag;
  tree.setActive({ id: drag.id });
  const total = drag.rows.filter((row) => row.parent === drag.from.parent).length;
  const spot = { item: rowName(tree, drag.id), position: drag.from.index + 1, total };
  say(tree.messages.lifted(spot), drag.modal);
  drag.frame = requestAnimationFrame((time) => tickTree(tree, drag, time));
}
