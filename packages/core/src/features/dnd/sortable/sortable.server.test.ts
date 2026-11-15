import { createRoot } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { defaultMessages } from "../messages/dnd-messages.ts";
import { createSortable as createCore, type Sortable, type SortableMove } from "./core/index.ts";
import { createSortable } from "./index.ts";

/** What an inert sortable's bindings do with a stand-in element. */
function idle(make: () => Sortable): { isActive: boolean; isDragging: boolean } {
  return createRoot((dispose) => {
    const sortable = make();
    const element = {} /* the inert refs never read it */ as HTMLElement;
    sortable.list({ id: "tasks" })(element);
    const item = sortable.item({ id: "a" });
    item.ref(element);
    item.handle(element);
    const state = { isActive: sortable.active() !== null, isDragging: item.dragging() };
    dispose();

    return state;
  });
}

// The server project compiles Solid for the server: the API is inert there.
describe("createSortable on the server", () => {
  it("returns no-op refs and an idle state", () => {
    expect(idle(() => createSortable({ onMove: vi.fn<(move: SortableMove) => void>() }))).toStrictEqual({
      isActive: false,
      isDragging: false,
    });
  });
});

describe("the core entry on the server", () => {
  it("returns no-op refs and an idle state", () => {
    expect(
      idle(() => createCore({ messages: defaultMessages, onMove: vi.fn<(move: SortableMove) => void>() })),
    ).toStrictEqual({
      isActive: false,
      isDragging: false,
    });
  });
});
