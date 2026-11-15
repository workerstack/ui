import "./list.fixture.css";
import "./board.fixture.css";

import { createSignal, For } from "solid-js";

import { createSortable, move } from "../sortable/index.ts";

/* Columns reorder in place: the header cell moves and its body cells follow. Ported from the monorepo's harness. */
const ROWS = Array.from({ length: 14 }, (_, i) => ({
  city: ["London", "Zagreb", "Lisbon", "Oslo"][i % 4] as string,
  name: `Person ${i + 1}`,
  role: ["Engineer", "Designer", "Writer"][i % 3] as string,
  team: ["Core", "Growth"][i % 2] as string,
}));

type Column = keyof (typeof ROWS)[number];

/** A table whose columns sort by their header handles, the body cells following. */
export function TablePage() {
  const [columns, setColumns] = createSignal<Column[]>(["name", "role", "team", "city"]);
  let table: HTMLTableElement | undefined;
  const sortable = createSortable({
    onMove: ({ from, to }) => setColumns((list) => move(list, from.index, to.index)),
  });
  const followers = (id: string) =>
    table ? [...table.querySelectorAll<HTMLElement>(`td[data-dnd-follow="${CSS.escape(id)}"]`)] : [];
  return (
    <div>
      <div class="table-scroll" data-testid="table-scroll">
        <table
          ref={(element: HTMLTableElement) => {
            table = element;
          }}
          class="harness-table"
        >
          <thead class="table-head">
            <tr ref={sortable.list({ axis: "x", followers, id: "columns", label: () => "Columns" })}>
              <For each={columns()}>
                {(column) => {
                  const item = sortable.item({ id: column, label: () => `Column ${column}` });
                  return (
                    <th ref={item.ref} data-testid={`head-${column}`}>
                      <button ref={item.handle} type="button" aria-label={`Move ${column}`} data-testid={`handle-${column}`}>
                        ⠿
                      </button>{" "}
                      {column}
                    </th>
                  );
                }}
              </For>
            </tr>
          </thead>
          <tbody>
            <For each={ROWS}>
              {(row) => (
                <tr>
                  <For each={columns()}>{(column) => <td data-dnd-follow={column}>{row[column]}</td>}</For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
      <p>
        order: <output data-order="columns">{columns().join(",")}</output>
      </p>
    </div>
  );
}
