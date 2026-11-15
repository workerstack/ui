import "./list.fixture.css";
import "./tree.fixture.css";

import { createSignal, For, Show } from "solid-js";

import { createSortableTree, type TreeMove } from "../tree/index.ts";
import { centerOf, createPointer, type Pointer } from "../../test/pointer.ts";

/* A file tree: nested folders, a collapsed one (docs) and one that refuses drops (archive). From the monorepo harness. */
const INDENT = 20;
const FOLDERS = new Set(["src", "lib", "docs", "archive"]);
const START: Record<string, string[]> = {
  "": ["src", "docs", "archive", "README.md", "package.json"],
  archive: ["old.txt"],
  docs: ["guide.md", "api.md"],
  lib: ["util.ts"],
  src: ["app.ts", "lib", "main.ts"],
};

function applyMove(current: Record<string, string[]>, { from, id, to }: TreeMove): Record<string, string[]> {
  const next = { ...current };
  const source = from.parent ?? "";
  next[source] = (next[source] ?? []).filter((child) => child !== id);
  const target = [...(next[to.parent ?? ""] ?? [])];
  target.splice(to.index, 0, id);
  next[to.parent ?? ""] = target;
  return next;
}

/** The tree's order as the page prints it before any move. */
export const TREE_START =
  "src(app.ts,lib(util.ts),main.ts),docs(guide.md,api.md),archive(old.txt),README.md,package.json";

/** The row of `id` on the page; throws if there is none. */
export function treeRow(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-testid="row-${CSS.escape(id)}"]`);
  if (el === null) throw new Error(`no row ${id}`);
  return el;
}

/** Lifts row `id` from its center with a move down past the threshold, then moves to `x` and `y` in 10 steps. */
export async function holdRow(id: string, to: { x?: number; y: number }): Promise<Pointer> {
  const from = centerOf(treeRow(id));
  const pointer = createPointer();
  pointer.down(from);
  await pointer.move({ x: from.x, y: from.y + 6 }, 2);
  await pointer.move({ x: to.x ?? from.x, y: to.y }, 10);
  return pointer;
}

/** The file tree page; its order prints as `folder(child,…)` in `[data-order="tree"]`. */
export function TreePage() {
  const [kids, setKids] = createSignal(START);
  const [open, setOpen] = createSignal(new Set(["src", "lib", "archive"]));
  const tree = createSortableTree({
    canMove: (move) => move.to.parent !== "archive",
    expand: (id) => setOpen((current) => new Set(current).add(id)),
    indent: INDENT,
    onMove: (move) => setKids((current) => applyMove(current, move)),
  });
  const serialize = (parent: string): string =>
    (kids()[parent] ?? []).map((id) => (FOLDERS.has(id) ? `${id}(${serialize(id)})` : id)).join(",");
  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  function Rows(props: { parent: string; level: number }) {
    return (
      <For each={kids()[props.parent] ?? []}>
        {(id) => {
          const folder = FOLDERS.has(id);
          const expanded = () => open().has(id);
          return (
            <li role="none">
              <div
                role="treeitem"
                class="tree-row"
                data-testid={`row-${id}`}
                data-tree-id={id}
                data-level={props.level}
                data-label={id}
                aria-expanded={folder ? (expanded() ? "true" : "false") : undefined}
                aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight"
                aria-selected="false"
                tabindex={id === "src" ? 0 : -1}
                style={{ "padding-inline-start": `${props.level * INDENT + 8}px` }}
                onDblClick={() => toggle(id)}
              >
                {folder ? "▸ " : ""}
                {id}
              </div>
              <Show when={folder}>
                <ul role="group" hidden={expanded() ? undefined : true}>
                  <Rows parent={id} level={props.level + 1} />
                </ul>
              </Show>
            </li>
          );
        }}
      </For>
    );
  }

  return (
    <div>
      <ul ref={tree.root} role="tree" aria-label="Files" class="harness-tree" data-testid="tree">
        <Rows parent="" level={0} />
        <li ref={tree.indicator} aria-hidden="true" class="tree-indicator" data-testid="indicator" />
      </ul>
      <div ref={tree.preview} class="tree-chip" data-testid="chip" />
      <p>
        order: <output data-order="tree">{serialize("")}</output>
      </p>
    </div>
  );
}
