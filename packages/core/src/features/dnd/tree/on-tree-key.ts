import { modalOf, say } from "../announce/live-region.ts";
import { RTL } from "../internal/dnd.constants.ts";
import { arrowDirection } from "../keyboard/arrow-direction.ts";
import { commitTree } from "./commit-tree.ts";
import { getTreeMove } from "./get-tree-move.ts";
import { holds, isRefused, rowName, type TreeContext } from "./tree-context.ts";
import { ROW } from "./tree-dom.ts";
import type { TreeDirection, TreeMove } from "./tree.types.ts";

/** The move an Alt+arrow makes on a row of `writing` direction; RTL mirrors Right and Left. */
function directionOf(key: string, writing: string): TreeDirection | undefined {
  const arrow = arrowDirection(key);

  if (arrow === "left" || arrow === "right") return (arrow === "right") === (writing === RTL) ? "outdent" : "indent";

  return arrow;
}

/** The row and move an Alt+arrow asks for; undefined when the event isn't one, or a drag runs. */
function keyMove(tree: TreeContext, event: KeyboardEvent): { el: HTMLElement; direction: TreeDirection } | undefined {
  const el = event.target;

  if (!event.altKey || !(el instanceof HTMLElement) || !el.matches(ROW) || tree.drag !== undefined) return undefined;
  const direction = directionOf(event.key, getComputedStyle(el).direction);

  return direction === undefined ? undefined : { direction, el };
}

/** Says why the row can't move into the parent the move asks for. */
function sayBlocked(tree: TreeContext, root: HTMLElement, move: TreeMove): void {
  const parent = move.to.parent === null ? (root.getAttribute("aria-label") ?? "") : rowName(tree, move.to.parent);
  say(tree.messages.blocked(rowName(tree, move.id), parent), modalOf(root));
}

/** Alt+arrow moves a focused row: up, down, indent or outdent. */
export function onTreeKey(tree: TreeContext, event: KeyboardEvent): void {
  const asked = keyMove(tree, event);
  const { root } = tree;

  if (asked === undefined || root === undefined) return;
  event.preventDefault();
  const id = asked.el.dataset.treeId ?? "";
  const move = getTreeMove(root, id, { canHaveChildren: (row) => holds(tree, row), direction: asked.direction });

  if (move === null) return say(tree.messages.noMove(rowName(tree, id)), modalOf(root));

  if (isRefused(tree, move)) return sayBlocked(tree, root, move);
  commitTree(tree, root, { isFocused: true, move });
}
