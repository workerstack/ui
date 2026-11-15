import { createSignal, onCleanup } from "solid-js";

import type { Engine } from "../../engine/create-engine.ts";
import type { ItemReg } from "../../engine/engine.types.ts";
import type { Point } from "../../geometry/geometry.types.ts";
import { createLedger, type Ledger } from "../../motion/ledger.ts";
import { holdTouchScroll } from "../../pointer/touch-scroll.ts";
import { watchPress } from "../../pointer/watch-press.ts";
import type { ItemOptions, SortableItem, SortableOptions } from "./sortable.types.ts";

/** One item's binding while it lives: its registration, the styles it wrote and its listeners. */
type Bound = { engine: Engine; options: SortableOptions; reg: ItemReg; ledger: Ledger; offs: (() => void)[] };

/** Settles a running drop, then says whether the item can lift now. */
function isReady(bound: Bound): boolean {
  bound.engine.settle();

  return bound.engine.ready(bound.reg);
}

/** Makes the activator start drags: by pointer always, by keyboard when the sortable and the list have it. */
function wireActivator(bound: Bound, el: HTMLElement, activator: HTMLElement): void {
  const { engine, reg, offs, options } = bound;
  const isWhole = reg.handle === undefined;

  function ready(): boolean {
    return isReady(bound);
  }

  bound.ledger.set(activator, {
    "-webkit-touch-callout": "none",
    "-webkit-user-select": "none",
    "touch-action": isWhole ? "manipulation" : "none",
    "user-select": "none",
  });

  if (isWhole) offs.push(holdTouchScroll());

  function start(point: Point, pointerId: number | null): void {
    engine.start(reg, { activator, point, pointerId });
  }

  offs.push(watchPress(activator, { ready, start, whole: isWhole }));

  if (options.keyboard === undefined || !engine.keyboardFor(el)) return;
  const { instructions } = options.messages;
  offs.push(
    options.keyboard.bind({ activator, el, instructions, ready, start: (point) => start(point, null), whole: isWhole }),
  );
}

/** Binds one item: call it in the item component's owned scope; its refs only record elements. */
export function bindItem(engine: Engine, options: SortableOptions, itemOptions: ItemOptions): SortableItem {
  const [dragging, setDragging] = createSignal(false, { ownedWrite: true });
  const reg: ItemReg = { id: itemOptions.id, setDragging };

  if (itemOptions.label !== undefined) reg.label = itemOptions.label;

  if (itemOptions.disabled !== undefined) reg.disabled = itemOptions.disabled;
  const bound: Bound = { engine, ledger: createLedger(), offs: [], options, reg };
  let wired: HTMLElement | undefined;

  // Rows are created before they are inserted: wiring waits until the item sits in its list.
  function wire(): void {
    const { el } = reg;

    if (el === undefined || wired !== undefined) return;
    wired = reg.handle ?? el;
    wireActivator(bound, el, wired);
  }

  onCleanup(() => {
    for (const off of bound.offs.splice(0)) off();
    bound.ledger.restore();
    engine.removeItem(reg);
  });

  return {
    dragging,
    handle: (element) => {
      reg.handle = element;
    },
    ref: (element) => {
      reg.el = element;
      engine.addItem(reg);
      queueMicrotask(wire);
    },
  };
}
