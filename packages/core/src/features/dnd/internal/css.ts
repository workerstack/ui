import type { Point } from "../geometry/geometry.types.ts";

/** A length in CSS pixels: `12` → `"12px"`. */
export function px(value: number): string {
  return `${value}px`;
}

/** The number, or 0 when it is NaN or infinite. */
function finite(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

/** A computed length property as a number; 0 when it is not one. */
export function cssNumber(style: CSSStyleDeclaration, prop: string): number {
  return finite(Number.parseFloat(style.getPropertyValue(prop)));
}

/** The element's translate right now, mid-transition included. */
export function translateOf(el: Element): Point {
  const [x = 0, y = 0] = getComputedStyle(el)
    .translate.split(" ")
    .map((value) => finite(Number.parseFloat(value)));

  return { x, y };
}
