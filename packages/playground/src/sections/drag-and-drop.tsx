import type { JSX } from "@solidjs/web";

import { Example, Section } from "../section.tsx";
import { DndBoard } from "./dnd-board.tsx";
import { DndFileDrop } from "./dnd-file-drop.tsx";
import { DndList } from "./dnd-list.tsx";
import { DndTree } from "./dnd-tree.tsx";

/** `@workerstack/ui/dnd/*`: a sortable list, a board, a tree and a file drop zone. */
export function DragAndDrop(): JSX.Element {
  return (
    <Section
      id="drag-and-drop"
      title="Drag and drop"
      description="Drag with the pointer, or focus an item, press Space, move with the arrows, press Space again."
    >
      <Example align="start" label="Sortable list">
        <DndList />
      </Example>
      <Example align="start" label="Board (cards move between columns)">
        <DndBoard />
      </Example>
      <Example align="start" label="Tree (nest rows into folders)">
        <DndTree />
      </Example>
      <Example align="start" label="File drop (logs the names)">
        <DndFileDrop />
      </Example>
    </Section>
  );
}
