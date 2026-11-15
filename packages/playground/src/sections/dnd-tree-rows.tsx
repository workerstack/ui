import type { JSX } from "@solidjs/web";
import { For, Show, untrack } from "solid-js";

import type { Children } from "./dnd-tree-data.ts";
import { FIRST_ROW, FOLDERS, INDENT, INSET, NOT_TABBABLE } from "./dnd-tree.constants.ts";

/** What the rows read: the data, which folders are open, and how to toggle one. */
export type TreeRowsProps = {
  children: () => Children;
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
  parent: string;
  level: number;
};

const ROW_CLASS =
  "cursor-grab py-1 text-sm select-none data-dnd-source:opacity-40 data-dnd-target:outline-2 " +
  "data-dnd-target:-outline-offset-2 data-dnd-target:outline-ring data-dnd-blocked:outline-destructive " +
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

function expandedOf({ isFolder, isOpen }: { isFolder: boolean; isOpen: boolean }): "true" | "false" | undefined {
  if (!isFolder) return undefined;

  return isOpen ? "true" : "false";
}

/** One row; a double click opens or closes a folder. */
function TreeRow(props: { id: string; level: number; isOpen: boolean; toggle: () => void }): JSX.Element {
  const isFolder = untrack(() => FOLDERS.includes(props.id));

  return (
    <div
      role="treeitem"
      class={ROW_CLASS}
      data-tree-id={props.id}
      data-label={props.id}
      aria-expanded={expandedOf({ isFolder, isOpen: props.isOpen })}
      aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight"
      aria-selected="false"
      tabindex={props.id === FIRST_ROW ? 0 : NOT_TABBABLE}
      style={{ "padding-inline-start": `${props.level * INDENT + INSET}px` }}
      onDblClick={props.toggle}
    >
      {isFolder ? "▸ " : ""}
      {props.id}
    </div>
  );
}

/** The rows of one folder, each folder's own rows nested in a group. */
export function TreeRows(props: TreeRowsProps): JSX.Element {
  return (
    <For each={props.children().get(props.parent) ?? []} keyed={(id) => id}>
      {(id) => (
        <li role="none">
          <TreeRow id={id()} level={props.level} isOpen={props.isOpen(id())} toggle={() => props.toggle(id())} />
          <Show when={FOLDERS.includes(id())}>
            <ul role="group" class="m-0 list-none p-0" hidden={props.isOpen(id()) ? undefined : true}>
              <TreeRows {...props} parent={id()} level={props.level + 1} />
            </ul>
          </Show>
        </li>
      )}
    </For>
  );
}
