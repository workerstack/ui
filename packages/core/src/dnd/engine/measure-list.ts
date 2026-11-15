import type { Axis, Rect } from "../geometry/geometry.types.ts";
import { cssNumber, translateOf } from "../internal/css.ts";
import { BACKWARD, RTL } from "../internal/dnd.constants.ts";
import { scrollChain } from "../scroll/scroll-chain.ts";
import type { LiftBase } from "./drag.types.ts";
import type { Box, ListState, PlacedItem, PlacedList } from "./engine.types.ts";

/**
 * A list to measure. At lift (`again` false) layout still holds the dragged item, so items after it are moved back
 * by its size; later measurements read layout as it is, minus translates. `keep` is the list's previous state.
 */
export type MeasureRequest = {
  reg: PlacedList;
  members: PlacedItem[];
  again: boolean;
  keep?: ListState | undefined;
};

/** A list's flow and the distance displaced items move. */
type Layout = Pick<ListState, "amount" | "axis" | "gap" | "grid" | "rtl" | "sign">;

/** Reads a list's flow from its computed style. */
function layoutOf(base: LiftBase, reg: PlacedList, style: CSSStyleDeclaration): Layout {
  const axis: Axis = reg.axis === "x" ? "x" : "y";
  const isRtl = style.direction === RTL;
  const gap = cssNumber(style, axis === "x" ? "column-gap" : "row-gap");
  const { lift, margin } = base;
  const size = axis === "y" ? lift.height + margin.top + margin.bottom : lift.width + margin.left + margin.right;

  const sign = axis === "x" && isRtl ? BACKWARD : 1;

  return { amount: size + gap, axis, gap, grid: reg.axis === "grid", rtl: isRtl, sign };
}

/** A list's content box from its border box and computed style. */
function contentBox(rect: Rect, style: CSSStyleDeclaration): Rect {
  function edge(side: string): number {
    return cssNumber(style, `border-${side}-width`) + cssNumber(style, `padding-${side}`);
  }

  return {
    height: rect.height - edge("top") - edge("bottom"),
    width: rect.width - edge("left") - edge("right"),
    x: rect.x + edge("left"),
    y: rect.y + edge("top"),
  };
}

/** Each member's rect: as laid out at lift, or as laid out minus its translate when measured again. */
function memberRects(request: MeasureRequest): Rect[] {
  return request.members.map((other) => {
    const box = other.el.getBoundingClientRect();

    if (!request.again) return box;
    const t = translateOf(other.el);

    return { height: box.height, width: box.width, x: box.x - t.x, y: box.y - t.y };
  });
}

/** A rect moved by `d` along `axis`. */
function moved(rect: Rect, axis: Axis, d: number): Rect {
  return {
    height: rect.height,
    width: rect.width,
    x: rect.x + (axis === "x" ? d : 0),
    y: rect.y + (axis === "y" ? d : 0),
  };
}

/** The member rects of a list and how it flows. */
type Measured = { layout: Layout; rects: Rect[] };

/** Where a member after the dragged one sits without it: a grid's previous slot, or back by its size. */
function without(measured: Measured, k: number, rect: Rect): Rect {
  const { layout, rects } = measured;

  return layout.grid ? (rects[k - 1] ?? rect) : moved(rect, layout.axis, -layout.sign * layout.amount);
}

/** The elements that move with a member. */
function followersOf(request: MeasureRequest, id: string): HTMLElement[] {
  const { followers } = request.reg;

  return followers === undefined ? [] : [...followers(id)];
}

/** Whether member `k` sits after the dragged one at `at` and layout still holds the dragged item before it. */
function isPushedBack(base: LiftBase, request: MeasureRequest, order: { at: number; k: number }): boolean {
  return order.at >= 0 && order.k > order.at && (base.inPlace || !request.again);
}

/** The translate a member had written before this measurement. */
function keyOf(request: MeasureRequest, member: PlacedItem): string {
  return request.keep?.boxes.find((box) => box.reg === member)?.key ?? "";
}

/** One member's box: laid out without the dragged item when it comes after it (or is pushed back at lift). */
function boxOf(base: LiftBase, request: MeasureRequest, member: Measured & { k: number }): Box | null {
  const { rects, k } = member;
  const other = request.members[k];
  const rect = rects[k];
  const at = request.members.indexOf(base.item);

  if (other === undefined || k === at || rect === undefined) return null;
  const isAfter = isPushedBack(base, request, { at, k });
  const shift = isAfter && base.inPlace ? -member.layout.sign * member.layout.amount : 0;

  return {
    el: other.el,
    followers: followersOf(request, other.id),
    key: keyOf(request, other),
    rect: isAfter ? without(member, k, rect) : rect,
    reg: other,
    shift,
  };
}

/** The boxes of every member but the dragged one, laid out without it. */
function boxesOf(base: LiftBase, request: MeasureRequest, measured: Measured): Box[] {
  return request.members.flatMap((_, k) => boxOf(base, request, { ...measured, k }) ?? []);
}

/** Measures a list in play. */
export function measureList(base: LiftBase, request: MeasureRequest): ListState {
  const { reg, keep } = request;
  const style = getComputedStyle(reg.el);
  const rect = reg.el.getBoundingClientRect();
  const layout = layoutOf(base, reg, style);
  const rects = memberRects(request);
  const boxes = boxesOf(base, request, { layout, rects });
  const chain = scrollChain(reg.el, base.cache);

  return {
    ...layout,
    boxes,
    chain,
    content: contentBox(rect, style),
    el: reg.el,
    index: keep === undefined ? boxes.length : Math.min(keep.index, boxes.length),
    outer: chain.filter((scroller) => scroller.el !== reg.el),
    placeholder: keep?.placeholder,
    rect,
    reg,
    slots: layout.grid ? (keep?.slots ?? rects) : [],
  };
}
