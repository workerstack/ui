import { dragState } from "../internal/drag-state.ts";
import type { Registry } from "./drag.types.ts";
import type { ItemReg, ListReg, PlacedItem, PlacedList } from "./engine.types.ts";

/** The list the item sits in: its element's parent, when that is a registered list. */
export function listOf(registry: Registry, item: ItemReg): PlacedList | undefined {
  const parent = item.el?.parentElement;

  return parent === null || parent === undefined ? undefined : registry.lists.get(parent);
}

/** The list's registered items, in DOM order. */
export function childrenOf(registry: Registry, list: PlacedList): PlacedItem[] {
  return [...list.el.children].flatMap((child) => {
    const reg = child instanceof HTMLElement ? registry.items.get(child) : undefined;

    return reg === undefined ? [] : [reg];
  });
}

/** Whether the item can lift now: no drag runs, and neither it nor its list is disabled. */
export function canLift(registry: Registry, item: ItemReg): boolean {
  const list = listOf(registry, item);

  return !dragState().running && item.disabled?.() !== true && list !== undefined && list.disabled?.() !== true;
}

/** Registrations during a drag mark layout for measuring again on the next frame or key. */
export function touched(registry: Registry): void {
  if (registry.drag !== undefined) registry.drag.changed = true;
}

/** Whether the registration's element is known; one guard serves items and lists. */
export function isPlaced<T extends ItemReg | ListReg>(reg: T): reg is T & { el: HTMLElement } {
  return reg.el !== undefined;
}
