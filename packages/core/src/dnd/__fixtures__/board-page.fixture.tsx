import "./list.fixture.css";
import "./board.fixture.css";

import { createSignal, For, Show } from "solid-js";

import { type Direction, mount, viewport } from "./mount.fixture.ts";

import { createSortable, type SortableMove } from "../sortable/index.ts";

/*
 * A Jira-style board: lanes by columns, each cell a list. Done can't go back to To do; Bob's In review cell starts
 * empty; Carol's lane starts collapsed and opens when a drag rests on its header. Ported from the monorepo's harness.
 */
const COLUMNS = [
  { id: "todo", name: "To do" },
  { id: "doing", name: "In progress" },
  { id: "review", name: "In review" },
  { id: "done", name: "Done" },
];
const LANES = [
  { id: "alice", name: "Alice" },
  { id: "bob", name: "Bob" },
  { id: "carol", name: "Carol" },
];

type Cells = Record<string, string[]>;

function seed(total: number): Cells {
  const cells: Cells = {};
  const perCell = Math.max(1, Math.round(total / (COLUMNS.length * LANES.length)));
  for (const lane of LANES)
    for (const column of COLUMNS) {
      const key = `${lane.id}:${column.id}`;
      cells[key] =
        lane.id === "bob" && column.id === "review"
          ? []
          : Array.from({ length: perCell }, (_, i) => `${lane.id[0]}${COLUMNS.indexOf(column)}-${i + 1}`);
    }
  return cells;
}

const columnOf = (list: string) => list.split(":")[1];

function moveCard(all: Cells, { from, to }: SortableMove): Cells {
  const source = [...(all[from.list] ?? [])];
  const [card] = source.splice(from.index, 1);
  const target = from.list === to.list ? source : [...(all[to.list] ?? [])];
  target.splice(to.index, 0, card as string);
  return { ...all, [from.list]: source, [to.list]: target };
}

/** The board page: `cards` fills it (24 by default), `narrow` makes it scroll sideways. */
export function BoardPage(props: { cards?: number; narrow?: boolean }) {
  // oxlint-disable-next-line solid/reactivity -- the card count seeds the board once
  const [cells, setCells] = createSignal(seed(props.cards ?? 24));
  const [open, setOpen] = createSignal<Record<string, boolean>>({ alice: true, bob: true, carol: false });
  const [outcome, setOutcome] = createSignal("");
  const board = createSortable({
    canMove: (move) => !(columnOf(move.from.list) === "done" && columnOf(move.to.list) === "todo"),
    onDragEnd: (move) => setOutcome(move ? `${move.id}:${move.from.list}>${move.to.list}@${move.to.index}` : "cancel"),
    onMove: (move) => setCells((all) => moveCard(all, move)),
  });
  return (
    <div>
      <p>
        outcome: <output data-outcome="board">{outcome()}</output>
      </p>
      <div class={props.narrow ? "board board-narrow" : "board"} data-testid="board">
        <div class="board-row board-head">
          <span />
          <For each={COLUMNS}>{(column) => <span class="board-column-name">{column.name}</span>}</For>
        </div>
        <For each={LANES}>
          {(lane) => (
            <section class="board-lane" data-lane={lane.id}>
              <button
                type="button"
                class="board-lane-name"
                data-testid={`lane-${lane.id}`}
                aria-expanded={open()[lane.id] ? "true" : "false"}
                ref={board.expander({ onExpand: () => setOpen((all) => ({ ...all, [lane.id]: true })) })}
                onClick={() => setOpen((all) => ({ ...all, [lane.id]: !all[lane.id] }))}
              >
                {lane.name}
              </button>
              <Show when={open()[lane.id]}>
                <div class="board-row">
                  <span />
                  <For each={COLUMNS}>
                    {(column) => {
                      const key = `${lane.id}:${column.id}`;
                      return (
                        <div class="board-cell">
                          <ul
                            ref={board.list({ id: key, label: () => `${column.name}, ${lane.name}` })}
                            class="board-list"
                            data-testid={`cell-${key}`}
                          >
                            <For each={cells()[key] ?? []}>
                              {(id) => {
                                const card = board.item({ id, label: () => `Card ${id}` });
                                return (
                                  <li
                                    ref={card.ref}
                                    class={id.endsWith("-2") ? "board-card board-card-tall" : "board-card"}
                                    tabindex={0}
                                    data-id={id}
                                    data-testid={`card-${id}`}
                                  >
                                    {id}
                                  </li>
                                );
                              }}
                            </For>
                          </ul>
                          <output data-order={key}>{(cells()[key] ?? []).join(",")}</output>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </Show>
            </section>
          )}
        </For>
      </div>
    </div>
  );
}

/** Mounts the board in `dir`, in a viewport tall enough that it never sits in the page's auto-scroll band. */
export async function mountBoard(dir: Direction, props: { cards?: number; narrow?: boolean } = {}): Promise<void> {
  await viewport(1280, 1100);
  await mount(() => <BoardPage {...props} />, dir);
}
