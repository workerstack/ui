import { For } from "solid-js"

import { createSortable } from "../sortable/index.ts"

/** A sortable list with handles, rendered on the server and hydrated in the browser. */
export function SortableFixture() {
  const sortable = createSortable({ onMove: () => {} })
  return (
    <ul ref={sortable.list({ id: "tasks" })}>
      <For each={["a", "b", "c"]}>
        {(id) => {
          const item = sortable.item({ id: id })
          return (
            <li ref={item.ref} data-id={id}>
              <button ref={item.handle} type="button">
                Move {id}
              </button>
              <span>{item.dragging() ? "dragging" : "resting"}</span>
            </li>
          )
        }}
      </For>
    </ul>
  )
}
