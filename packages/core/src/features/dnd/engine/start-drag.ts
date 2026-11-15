import { say } from "../announce/live-region.ts";
import { dragState } from "../internal/drag-state.ts";
import type { Press, Registry } from "./drag.types.ts";
import type { ItemReg } from "./engine.types.ts";
import { watchHidden } from "./layout.ts";
import { itemName } from "./names.ts";
import { readLift } from "./read-lift.ts";
import { canLift, isPlaced, listOf } from "./registry.ts";
import { wire } from "./wire.ts";
import { writeLift } from "./write-lift.ts";

/** Lifts `item` from a press: reads layout, writes the lift, wires the listeners and announces it. */
export function startDrag(registry: Registry, item: ItemReg, press: Press): void {
  registry.drag?.finishDrop?.();
  const home = listOf(registry, item);

  if (home === undefined || !isPlaced(item) || !canLift(registry, item)) return;
  dragState().running = true;
  const drag = readLift(registry, { home, item, press });
  writeLift(drag);
  watchHidden(drag);
  wire(drag);
  registry.drag = drag;
  item.setDragging(true);
  const { options, from, homeState } = drag;
  options.setActive({ blocked: false, id: item.id, index: from, list: home.id });
  options.onDragStart?.(item.id);
  const spot = { item: itemName(drag), list: home.label?.(), position: from + 1, total: homeState.boxes.length + 1 };
  say(options.messages.lifted(spot), drag.modal);
}
