import type { EngineOptions, Press, Registry } from "./drag.types.ts";
import { endDrag } from "./end-drag.ts";
import type { ExpanderReg, ItemReg, ListReg } from "./engine.types.ts";
import { canLift, isPlaced, touched } from "./registry.ts";
import { startDrag } from "./start-drag.ts";

/** One sortable's drag engine: what it has registered, and the drag it runs. */
export type Engine = {
  /** Registers collapsed content a drag opens by resting on it. */
  addExpander: (reg: ExpanderReg) => void;
  /** Registers an item. */
  addItem: (reg: ItemReg) => void;
  /** Registers a list. */
  addList: (reg: ListReg) => void;
  /** Cancels the running drag. */
  cancel: () => void;
  /** Whether the list an element sits in allows keyboard lifting. */
  keyboardFor: (el: HTMLElement) => boolean;
  /** Whether the item can lift now. */
  ready: (item: ItemReg) => boolean;
  /** Unregisters an expander. */
  removeExpander: (reg: ExpanderReg) => void;
  /** Unregisters an item. */
  removeItem: (reg: ItemReg) => void;
  /** Unregisters a list. */
  removeList: (reg: ListReg) => void;
  /** Finishes a running drop animation now (a new press, or a scroll). */
  settle: () => void;
  /** Lifts an item from a press. */
  start: (reg: ItemReg, press: Press) => void;
};

/** Registers an item, by element and by id. */
function addItem(registry: Registry, reg: ItemReg): void {
  if (isPlaced(reg)) registry.items.set(reg.el, reg);
  registry.byId.set(reg.id, reg);
  touched(registry);
}

/** Unregisters an item, unless another registration has replaced it. */
function removeItem(registry: Registry, reg: ItemReg): void {
  if (isPlaced(reg) && registry.items.get(reg.el) === reg) registry.items.delete(reg.el);

  if (registry.byId.get(reg.id) === reg) registry.byId.delete(reg.id);
  touched(registry);
}

/** Registers a list by element. */
function addList(registry: Registry, reg: ListReg): void {
  if (isPlaced(reg)) registry.lists.set(reg.el, reg);
  touched(registry);
}

/** Unregisters a list, unless another registration has replaced it. */
function removeList(registry: Registry, reg: ListReg): void {
  if (isPlaced(reg) && registry.lists.get(reg.el) === reg) registry.lists.delete(reg.el);
  touched(registry);
}

/** Whether the list an element sits in allows keyboard lifting. */
function keyboardFor(registry: Registry, el: HTMLElement): boolean {
  const parent = el.parentElement;

  return parent !== null && registry.lists.get(parent)?.keyboard === true;
}

/** Creates the drag engine one sortable runs on. */
export function createEngine(options: EngineOptions): Engine {
  const registry: Registry = { byId: new Map(), expanders: new Set(), items: new Map(), lists: new Map(), options };

  return {
    addExpander: (reg) => registry.expanders.add(reg),
    addItem: (reg) => addItem(registry, reg),
    addList: (reg) => addList(registry, reg),
    cancel: () => {
      if (registry.drag !== undefined) endDrag(registry.drag, "cancel");
    },
    keyboardFor: (el) => keyboardFor(registry, el),
    ready: (item) => canLift(registry, item),
    removeExpander: (reg) => registry.expanders.delete(reg),
    removeItem: (reg) => removeItem(registry, reg),
    removeList: (reg) => removeList(registry, reg),
    settle: () => registry.drag?.finishDrop?.(),
    start: (reg, press) => startDrag(registry, reg, press),
  };
}
