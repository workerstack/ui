import type { Axis, Rect } from "../geometry/geometry.types.ts";

/** One flag per physical direction. */
export type Directions = {
  /** Toward the left. */
  left: boolean;
  /** Toward the right. */
  right: boolean;
  /** Toward the top. */
  up: boolean;
  /** Toward the bottom. */
  down: boolean;
};

/** A container auto-scroll may move, as the pure math sees it. */
export type ScrollCandidate = {
  /** The container's visible rect in viewport coordinates (the viewport for the document). */
  rect: Rect;
  /** Which ways it can still scroll. */
  canScroll: Directions;
};

/** One container scrolling one way on one axis this frame. */
export type ScrollClaim = {
  /** Index into the candidates, innermost first. */
  index: number;
  /** The axis it scrolls on. */
  axis: Axis;
  /** Back toward the start (−1) or on toward the end (1). */
  direction: -1 | 1;
  /** Pixels per 60Hz frame at full engagement. */
  speed: number;
};

/** A scroll container in a chain, measured at lift and kept current from scroll offsets. */
export type Scroller = {
  /** The scrolling element. */
  el: Element;
  /** The document: scrolled through the window, its rect is the viewport. */
  doc: boolean;
  /** User-scrollable (`overflow` auto or scroll); `hidden` and `clip` only clip. */
  auto: boolean;
  /** Right to left: horizontal offsets run from −maxX to 0. */
  rtl: boolean;
  /** Padding box in viewport coordinates at lift. */
  rect: Rect;
  /** Horizontal offset at lift. */
  x0: number;
  /** Vertical offset at lift. */
  y0: number;
  /** Horizontal offset now. */
  x: number;
  /** Vertical offset now. */
  y: number;
  /** The largest horizontal offset. */
  maxX: number;
  /** The largest vertical offset. */
  maxY: number;
  /** The scrollers around this one, innermost first. */
  outer: Scroller[];
};
