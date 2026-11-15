import { createSignal, For, untrack } from "solid-js"

import { keyboard } from "../keyboard/index.ts"
import { defaultMessages } from "../messages/dnd-messages.ts"
import { createSortable as createCore, move, type SortableMove } from "../sortable/core/index.ts"
import { createSortable } from "../sortable/index.ts"

/** Which entry a list runs on: the default, core alone (pointer only), or core with the keyboard plug-in. */
export type Entry = "default" | "core" | "core+keyboard"

/** The sortable for an entry. */
function sortableFor(entry: Entry, onMove: (move: SortableMove) => void) {
  if (entry === "default") return createSortable({ onMove })
  return createCore({ keyboard: entry === "core+keyboard" ? keyboard : undefined, messages: defaultMessages, onMove })
}

/** A two- or three-item list, with or without handles, that applies its moves. */
export function SortableList(props: {
  keyboard?: boolean
  handles: boolean
  entry?: Entry
  ids?: string[]
  onMove?: (move: SortableMove) => void
}) {
  const [ids, setIds] = createSignal(untrack(() => props.ids ?? ["a", "b"]))
  const sortable = sortableFor(
    untrack(() => props.entry ?? "default"),
    (next) => {
      setIds((list) => move(list, next.from.index, next.to.index))
      props.onMove?.(next)
    },
  )
  return (
    <ul ref={sortable.list({ id: "tasks", keyboard: untrack(() => props.keyboard) })} class="list">
      <For each={ids()}>
        {(id) => {
          const item = sortable.item({ id: id, label: () => `Task ${id}` })
          return (
            <li ref={item.ref} class="item" data-testid={`item-${id}`} style={{ height: "40px" }}>
              {props.handles ? (
                <button ref={item.handle} type="button" class="grip" aria-describedby="hint" data-testid={`handle-${id}`}>
                  Move {id}
                </button>
              ) : (
                id
              )}
            </li>
          )
        }}
      </For>
    </ul>
  )
}
