import type { Drag } from "./drag.types.ts";
import type { ListState } from "./engine.types.ts";

/** The dragged item's announced name: its label, or its id. */
export function itemName(drag: Drag): string {
  return drag.item.label?.() ?? drag.item.id;
}

/** A list's announced name: its label, or its id. */
export function listName(list: ListState): string {
  return list.reg.label?.() ?? list.reg.id;
}
