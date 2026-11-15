import type { TreeMove } from "@workerstack/ui/dnd/tree";

import { LOCKED } from "./dnd-tree.constants.ts";

/** The children of each folder by id; "" is the root. */
export type Children = Map<string, string[]>;

/** The tree before any move. */
export function treeStart(): Children {
  return new Map([
    ["", ["src", "docs", LOCKED, "README.md", "package.json"]],
    [LOCKED, ["old.txt"]],
    ["docs", ["guide.md", "api.md"]],
    ["lib", ["util.ts"]],
    ["src", ["app.ts", "lib", "main.ts"]],
  ]);
}

/** The children after a move: out of the old parent, into the new one at its index. */
export function applyMove(current: Children, { from, id, to }: TreeMove): Children {
  const source = from.parent ?? "";
  const target = to.parent ?? "";

  const without = new Map(current).set(
    source,
    (current.get(source) ?? []).filter((child) => child !== id),
  );

  const children = [...(without.get(target) ?? [])];

  children.splice(to.index, 0, id);

  return without.set(target, children);
}

/** The ids open after `id` is toggled. */
export function toggled(current: Set<string>, id: string): Set<string> {
  const next = new Set(current);

  if (!next.delete(id)) next.add(id);

  return next;
}
