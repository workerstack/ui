// Sortable lists for Solid 2, batteries included: the core sortable with keyboard lift mode and English strings built
// in. Components that bring their own keyboard path and strings use the core entry instead.
import { keyboard } from "../keyboard/keyboard.ts";
import { type DndMessages, resolveMessages } from "../messages/dnd-messages.ts";
import { createSortable as createCore } from "./core/create-sortable.ts";
import type { Sortable, SortableOptions as CoreOptions } from "./core/sortable.types.ts";

/** The core options, with the keyboard built in and the strings optional. */
export type SortableOptions = Omit<CoreOptions, "keyboard" | "messages"> & {
  /** Announcement and instruction strings; English defaults otherwise. */
  messages?: Partial<DndMessages>;
};

/** Creates a sortable with keyboard lifting and English strings. */
export function createSortable(options: SortableOptions): Sortable {
  return createCore({ ...options, keyboard, messages: resolveMessages(options.messages) });
}
