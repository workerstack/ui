// Sortable lists for Solid 2, the core: single lists, wrap grids, linked lists (a kanban), and in-place lists (table
// columns). It takes every string from the app and drags by pointer only; `keyboard` from the keyboard entry adds
// keyboard lifting. The sortable entry is this with both built in. Bindings are two-phase ref factories: the factory
// call runs in the component's owned scope and registers cleanup; the returned refs only record elements. They create
// no computeds, so they render the same on the server and while hydrating.
import { isServer } from "@solidjs/web";
import { createSignal, onCleanup } from "solid-js";

import { createEngine, type Engine } from "../../engine/create-engine.ts";
import type { ActiveDrag, ExpanderReg, ListReg } from "../../engine/engine.types.ts";
import { bindItem } from "./bind-item.ts";
import type { ExpanderOptions, ListOptions, Sortable, SortableOptions } from "./sortable.types.ts";

/** Does nothing: the server's bindings. */
function noop(): void {
  // Nothing to bind on the server.
}

/** The server's sortable: it renders the same markup and binds nothing. */
function inert(): Sortable {
  return {
    active: () => null,
    cancel: noop,
    expander: () => noop,
    item: () => ({ dragging: () => false, handle: noop, ref: noop }),
    list: () => noop,
  };
}

/** Binds an expander: call it in the owning component's scope. */
function bindExpander(engine: Engine, options: ExpanderOptions): (element: HTMLElement) => void {
  const reg: ExpanderReg = { onExpand: options.onExpand };
  onCleanup(() => engine.removeExpander(reg));

  return (element) => {
    reg.el = element;
    engine.addExpander(reg);
  };
}

/** Binds a list: call it in the owning component's scope. */
function bindList(engine: Engine, options: ListOptions): (element: HTMLElement) => void {
  const reg: ListReg = { axis: options.axis ?? "y", id: options.id, keyboard: options.keyboard ?? true };

  if (options.label !== undefined) reg.label = options.label;

  if (options.disabled !== undefined) reg.disabled = options.disabled;

  if (options.followers !== undefined) reg.followers = options.followers;
  onCleanup(() => engine.removeList(reg));

  return (element) => {
    reg.el = element;
    engine.addList(reg);
  };
}

/** Creates a sortable: lists, items and expanders bound by ref, dragged by pointer and, with `keyboard`, by key. */
export function createSortable(options: SortableOptions): Sortable {
  if (isServer) return inert();
  const [active, setActive] = createSignal<ActiveDrag | null>(null, { ownedWrite: true });
  const engine = createEngine({ ...options, setActive });

  return {
    active,
    cancel: () => engine.cancel(),
    expander: (expanderOptions) => bindExpander(engine, expanderOptions),
    item: (itemOptions) => bindItem(engine, options, itemOptions),
    list: (listOptions) => bindList(engine, listOptions),
  };
}
