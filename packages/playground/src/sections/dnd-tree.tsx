import type { JSX } from "@solidjs/web";
import { createSortableTree, type SortableTree } from "@workerstack/ui/features/dnd/tree";
import { createSignal } from "solid-js";

import { useLog, type Log } from "../log.tsx";
import { applyMove, toggled, treeStart, type Children } from "./dnd-tree-data.ts";
import { TreeRows } from "./dnd-tree-rows.tsx";
import { INDENT, INSET, LOCKED } from "./dnd-tree.constants.ts";

const TREE_CLASS = "relative m-0 list-none rounded-lg border border-border bg-background p-0";

const INDICATOR_CLASS =
  "pointer-events-none absolute hidden h-0.5 -mt-px bg-ring data-active:block data-dnd-blocked:bg-destructive";

const CHIP_CLASS =
  "rounded border border-border bg-popover px-2 py-0.5 text-sm text-popover-foreground [&:not(:popover-open)]:hidden";

/** The tree's data, which folders are open, and the sortable that moves rows. */
type TreeState = {
  children: () => Children;
  open: () => Set<string>;
  setOpen: (update: (current: Set<string>) => Set<string>) => void;
  tree: SortableTree;
};

function createTreeState(log: Log): TreeState {
  const [children, setChildren] = createSignal(treeStart());
  const [open, setOpen] = createSignal(new Set(["src", "lib", LOCKED]));

  const tree = createSortableTree({
    canMove: (move) => move.to.parent !== LOCKED,
    expand: (id) => setOpen((current) => new Set(current).add(id)),
    indent: INDENT,
    inset: INSET,
    onMove: (move) => {
      setChildren((current) => applyMove(current, move));
      log("Tree move", `${move.id} into ${move.to.parent ?? "root"} at ${move.to.index}`);
    },
  });

  return { children, open, setOpen, tree };
}

/** A file tree: drop a row between rows or onto a folder to nest it; Alt and the arrow keys move a focused row. */
export function DndTree(): JSX.Element {
  const { children, open, setOpen, tree } = createTreeState(useLog());

  return (
    <div class="w-full max-w-sm">
      <ul ref={tree.root} role="tree" aria-label="Files" class={TREE_CLASS}>
        <TreeRows
          children={children}
          isOpen={(id) => open().has(id)}
          toggle={(id) => setOpen((current) => toggled(current, id))}
          parent=""
          level={0}
        />
        <li ref={tree.indicator} aria-hidden="true" class={INDICATOR_CLASS} />
      </ul>
      <div ref={tree.preview} class={CHIP_CLASS} />
      <p class="mt-2 text-xs text-muted-foreground">
        The {LOCKED} folder refuses drops. Double click a folder to open or close it.
      </p>
    </div>
  );
}
