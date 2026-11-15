import type { JSX } from "@solidjs/web";
import { createSortable, move } from "@workerstack/ui/features/dnd/sortable";
import { createSignal, For, untrack } from "solid-js";

import { useLog } from "../log.tsx";
import { GRIP_CLASS, ITEM_CLASS, LIST_CLASS } from "./dnd-styles.ts";

type Task = { id: string };

const TASKS: Task[] = [
  { id: "Write the brief" },
  { id: "Review the plan" },
  { id: "Ship the build" },
  { id: "Tell the team" },
];

/** A sortable list: drag a grip, or focus it and press Space, then the arrow keys. */
export function DndList(): JSX.Element {
  const log = useLog();
  const [tasks, setTasks] = createSignal(TASKS);

  const sortable = createSortable({
    onDragEnd: (result) => log("List drop", result === null ? "cancel" : `${result.id} to ${result.to.index}`),
    onMove: ({ from, to }) => setTasks((list) => move(list, from.index, to.index)),
  });

  return (
    <ul ref={sortable.list({ id: "tasks", label: () => "Tasks" })} class={`${LIST_CLASS} w-full max-w-sm`}>
      <For each={tasks()} keyed={(task) => task.id}>
        {(task) => {
          const id = untrack(() => task().id);
          const item = sortable.item({ id, label: () => id });

          return (
            <li ref={item.ref} class={ITEM_CLASS}>
              <button ref={item.handle} type="button" class={GRIP_CLASS} aria-label={`Move ${id}`}>
                ⠿
              </button>
              {id}
            </li>
          );
        }}
      </For>
    </ul>
  );
}
