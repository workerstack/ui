import type { Point, Rect } from "../geometry/geometry.types.ts";
import { slotStart, span } from "../geometry/list-index.ts";
import { LAST } from "../internal/dnd.constants.ts";
import { current } from "../scroll/scroll-position.ts";
import type { Drag } from "./drag.types.ts";
import type { ListState } from "./engine.types.ts";
import { along } from "./paint.ts";

/** Where the dragged element's layout box is now: at the lift, or scrolled with its list when in place. */
export function origin(drag: Drag): Rect {
  return drag.inPlace ? current(drag.lift, drag.homeState.chain) : drag.lift;
}

/** The dragged element's box now. */
export function draggedRect(drag: Drag): Rect {
  const o = origin(drag);

  return { height: drag.lift.height, width: drag.lift.width, x: o.x + drag.translate.x, y: o.y + drag.translate.y };
}

/** Margins at the logical start and end of a main axis. */
type MainMargins = { start: number; end: number };

/** The dragged element's margins at the logical start and end of the list's main axis. */
function mainMargins(drag: Drag, list: ListState): MainMargins {
  const { margin } = drag;

  if (list.axis === "y") return { end: margin.bottom, start: margin.top };

  return list.rtl ? { end: margin.left, start: margin.right } : { end: margin.right, start: margin.left };
}

/** Where the dragged element's border box lands for gap index `t` in a one-dimensional list. */
function listSlot(drag: Drag, list: ListState, t: number): Point {
  const rects = list.boxes.map((box) => current(box.rect, list.chain));
  const near = rects[t] ?? rects.at(LAST);
  const content = current(list.content, list.chain);
  const margins = mainMargins(drag, list);

  const main = slotStart(
    {
      contentStart: span(content, list).start + margins.start,
      gap: margins.end + list.gap + margins.start,
      items: rects.map((rect) => span(rect, list)),
    },
    t,
  );

  if (list.axis === "y") return { x: near?.x ?? content.x + drag.margin.left, y: main };

  return { x: list.rtl ? -main - drag.lift.width : main, y: near?.y ?? content.y + drag.margin.top };
}

/** Where the dragged element's border box lands for gap index `t` in list `list`. */
export function slotAt(drag: Drag, list: ListState, t: number): Point {
  if (!list.grid) return listSlot(drag, list, t);
  const slot = list.slots[Math.min(t, list.slots.length - 1)] ?? drag.lift;
  const at = current(slot, list.chain);

  return { x: at.x, y: at.y };
}

/** The translate that puts the dragged element on slot `t` of list `list`. */
export function translateTo(drag: Drag, list: ListState, t: number): Point {
  const slot = slotAt(drag, list, t);
  const o = origin(drag);

  if (!drag.inPlace) return { x: slot.x - o.x, y: slot.y - o.y };

  return along(list, list.axis === "x" ? slot.x - o.x : slot.y - o.y);
}
