import { prepareRegion } from "../announce/live-region.ts";
import { holdTouchScroll } from "../pointer/touch-scroll.ts";
import { watchPress } from "../pointer/watch-press.ts";
import { onTreeKey } from "./on-tree-key.ts";
import { startTreeDrag } from "./start-tree-drag.ts";
import type { TreeContext } from "./tree-context.ts";
import { ROW } from "./tree-dom.ts";
import { ARIA_TRUE } from "./tree.constants.ts";

/** Records the row a press goes down on, when it can drag. */
function onPress(tree: TreeContext, event: PointerEvent): void {
  const row = event.target instanceof Element ? event.target.closest<HTMLElement>(ROW) : null;

  const isDraggable =
    row !== null && tree.root?.contains(row) === true && row.getAttribute("aria-disabled") !== ARIA_TRUE;

  tree.pressed = isDraggable ? row : null;
}

/** Wires the root once it sits in the document: presses on rows drag them, Alt+arrows move them. */
export function bindTreeRoot(tree: TreeContext, element: HTMLElement): void {
  if (tree.offs.length > 0 || !element.isConnected) return;
  prepareRegion();

  function down(event: PointerEvent): void {
    onPress(tree, event);
  }

  function key(event: KeyboardEvent): void {
    onTreeKey(tree, event);
  }

  element.addEventListener("pointerdown", down);
  element.addEventListener("keydown", key);

  tree.offs.push(
    () => element.removeEventListener("pointerdown", down),
    () => element.removeEventListener("keydown", key),
    holdTouchScroll(),
    watchPress(element, {
      ready: () => tree.drag === undefined && tree.pressed !== null,
      start: (point, pointerId) => {
        if (tree.pressed !== null) startTreeDrag(tree, tree.pressed, { point, pointerId });
      },
      whole: true,
    }),
  );
  tree.rootStyles.set(element, {
    "-webkit-touch-callout": "none",
    "-webkit-user-select": "none",
    "touch-action": "manipulation",
    "user-select": "none",
  });
}
