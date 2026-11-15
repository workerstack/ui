import { px } from "../internal/css.ts";
import { LAST } from "../internal/dnd.constants.ts";
import type { Drag } from "./drag.types.ts";
import type { ListState } from "./engine.types.ts";

/**
 * A hidden element with the dragged element's tag (an li in a ul keeps the list valid), `size` long on the list's
 * main axis, after the list's last item. Home's also takes the dragged element's cross size.
 */
export function createPlaceholder(drag: Drag, list: ListState, size: number): HTMLElement {
  const ph = document.createElement(drag.el.tagName);
  ph.dataset.dndPlaceholder = "";
  ph.setAttribute("aria-hidden", "true");
  const isHorizontal = list.axis === "x";
  const { top, right, bottom, left } = drag.margin;
  const margin = `${px(top)} ${px(right)} ${px(bottom)} ${px(left)}`;
  ph.style.cssText =
    `${isHorizontal ? "width" : "height"}:${px(size)};margin:${margin};` +
    "flex:none;pointer-events:none;visibility:hidden";
  const isHome = list === drag.homeState;

  const cross = isHorizontal ? drag.lift.height : drag.lift.width;

  if (isHome) ph.style.setProperty(isHorizontal ? "height" : "width", px(cross));

  const members = isHome ? drag.regs : list.boxes.map((box) => box.reg);
  const last = members.at(LAST)?.el;

  // appendChild and insertBefore: worker types give Element an append and after of their own.
  if (last === undefined) list.el.appendChild(ph);
  else last.parentNode?.insertBefore(ph, last.nextSibling);

  return ph;
}
