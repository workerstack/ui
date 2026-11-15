// A sortable tree in indicator mode: the dragged row stays put and dims, a chip follows the pointer, and a line (or an
// outline for "inside") shows the destination. Rows come from the DOM (`[role=treeitem][data-tree-id][data-level]`),
// so rows need no bindings of their own.
import { isServer } from "@solidjs/web";
import { createSignal, onCleanup } from "solid-js";

import { resolveMessages } from "../messages/dnd-messages.ts";
import { createLedger } from "../motion/ledger.ts";
import { bindTreeRoot } from "./bind-tree-root.ts";
import { finishTreeDrag } from "./finish-tree-drag.ts";
import type { TreeContext } from "./tree-context.ts";
import type { SortableTree, SortableTreeOptions } from "./tree.types.ts";

/** Does nothing: the server's bindings. */
function noop(): void {
  // Nothing to bind on the server.
}

/** Creates a sortable tree: call it in the tree component's owned scope; its refs only record elements. */
export function createSortableTree(options: SortableTreeOptions): SortableTree {
  if (isServer) return { active: () => null, indicator: noop, preview: noop, root: noop };
  const [active, setActive] = createSignal<{ id: string } | null>(null, { ownedWrite: true });
  // The root keeps its touch styles across drags; each drag restores only its own writes.

  const tree: TreeContext = {
    messages: resolveMessages(options.messages),
    offs: [],
    options,
    pressed: null,
    rootStyles: createLedger(),
    setActive,
  };

  onCleanup(() => {
    if (tree.drag !== undefined) finishTreeDrag(tree, tree.drag, "cancel");

    for (const off of tree.offs.splice(0)) off();
    tree.rootStyles.restore();
  });

  return {
    active,
    indicator: (element) => {
      tree.indicator = element;
    },
    preview: (element) => {
      tree.chip = element;
    },
    root: (element) => {
      tree.root = element;
      queueMicrotask(() => bindTreeRoot(tree, element));
    },
  };
}
