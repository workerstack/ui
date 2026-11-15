import { describe, expect, it } from "vitest";

import { NONE } from "../internal/dnd.constants.ts";
import type { Rect } from "./geometry.types.ts";
import { neighbor, pickList } from "./pick-list.ts";

/** A board column: two lanes of three columns, 200 wide and 300 tall, 16px apart. */
function cell(column: number, lane: number): Rect {
  return { height: 300, width: 200, x: column * 216, y: lane * 316 };
}

const BOARD = [cell(0, 0), cell(1, 0), cell(2, 0), cell(0, 1), cell(1, 1), cell(2, 1)];

describe("pickList", () => {
  it("picks the list under the pointer", () => {
    expect(pickList(BOARD, { x: 300, y: 100 }, 0)).toBe(1);
    expect(pickList(BOARD, { x: 500, y: 400 }, 0)).toBe(5);
  });

  it("keeps the current list in a gap between lists", () => {
    expect(pickList(BOARD, { x: 208, y: 100 }, 0)).toBe(0);
    expect(pickList(BOARD, { x: 300, y: 308 }, 4)).toBe(4);
  });

  it("drops the target outside the lists' bounding box", () => {
    expect(pickList(BOARD, { x: 1000, y: 100 }, 2)).toBe(NONE);
    expect(pickList(BOARD, { x: 100, y: -20 }, 0)).toBe(NONE);
  });

  it("skips lists that aren't visible", () => {
    expect(pickList([null, cell(1, 0)], { x: 100, y: 100 }, 1)).toBe(NONE);
    expect(pickList([null, cell(1, 0)], { x: 300, y: 100 }, 1)).toBe(1);
  });
});

describe("neighbor", () => {
  it("finds the next list in a direction among those overlapping across", () => {
    expect(neighbor(BOARD, 0, "right")).toBe(1);
    expect(neighbor(BOARD, 1, "left")).toBe(0);
    expect(neighbor(BOARD, 1, "down")).toBe(4);
    expect(neighbor(BOARD, 4, "up")).toBe(1);
  });

  it("reports none past the edge", () => {
    expect(neighbor(BOARD, 2, "right")).toBe(NONE);
    expect(neighbor(BOARD, 0, "up")).toBe(NONE);
  });

  it("skips lists that aren't visible", () => {
    expect(neighbor([cell(0, 0), null, cell(2, 0)], 0, "right")).toBe(2);
  });
});
