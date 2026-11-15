import type { Direction } from "../geometry/geometry.types.ts";

const ARROWS = {
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
} as const satisfies Record<string, Direction>;

/** The physical direction an arrow key points; undefined for any other key. */
export function arrowDirection(key: string): Direction | undefined {
  return Object.hasOwn(ARROWS, key)
    ? ARROWS[key /* hasOwn has just found it among ARROWS' keys */ as keyof typeof ARROWS]
    : undefined;
}
