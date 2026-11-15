import type { JSX } from "@solidjs/web";
import { createFileDrop } from "@workerstack/ui/dnd/file-drop";
import { cn } from "cn";
import { createSignal, For } from "solid-js";

import { useLog } from "../log.tsx";

/** A zone that takes files dragged from the desktop and lists their names. */
export function DndFileDrop(): JSX.Element {
  const log = useLog();
  const [names, setNames] = createSignal<string[]>([]);

  const zone = createFileDrop({
    onDrop: (files) => {
      setNames(files.map((file) => file.name));
      log("Files dropped", ...files.map((file) => file.name));
    },
  });

  return (
    <div class="flex w-full max-w-sm flex-col gap-3">
      <div
        ref={zone.ref}
        data-testid="file-zone"
        class={cn(
          "rounded-lg border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground",
          zone.dragging() && "border-ring",
          zone.over() && "bg-muted text-foreground",
        )}
      >
        Drop files here
      </div>
      <ul class="m-0 list-none p-0 text-sm" aria-label="Dropped files">
        <For each={names()} keyed={(name) => name}>
          {(name) => <li>{name()}</li>}
        </For>
      </ul>
    </div>
  );
}
