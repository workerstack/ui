import type { JSX } from "@solidjs/web";
import { createSortable, type Sortable } from "@workerstack/ui/features/dnd/sortable";
import { createSignal, For, untrack } from "solid-js";

import { useLog } from "../log.tsx";
import { boardStart, COLUMNS, moveCard, type Column } from "./dnd-board-data.ts";
import { ITEM_CLASS, LIST_CLASS } from "./dnd-styles.ts";

/** One column: a titled list of cards. */
function BoardColumn(props: { board: Sortable; column: Column; cards: string[] }): JSX.Element {
  const column = untrack(() => props.column);
  const board = untrack(() => props.board);

  return (
    <section class="flex flex-col gap-2">
      <h3 class="text-sm font-medium">{column.name}</h3>
      <ul ref={board.list({ id: column.id, label: () => column.name })} class={LIST_CLASS}>
        <For each={props.cards} keyed={(card) => card}>
          {(card) => {
            const id = untrack(card);
            const item = board.item({ id, label: () => id });

            return (
              <li ref={item.ref} tabindex={0} class={`${ITEM_CLASS} cursor-grab`}>
                {id}
              </li>
            );
          }}
        </For>
      </ul>
    </section>
  );
}

/** A board of columns: cards move within a column and across them, by pointer or keyboard. */
export function DndBoard(): JSX.Element {
  const log = useLog();
  const [cards, setCards] = createSignal(boardStart());

  const board = createSortable({
    onDragEnd: (result) =>
      log("Board drop", result === null ? "cancel" : `${result.id}: ${result.from.list} to ${result.to.list}`),
    onMove: (result) => setCards((all) => moveCard(all, result)),
  });

  return (
    <div class="grid w-full grid-cols-3 gap-3">
      <For each={COLUMNS} keyed={(column) => column.id}>
        {(column) => <BoardColumn board={board} column={column()} cards={cards().get(column().id) ?? []} />}
      </For>
    </div>
  );
}
