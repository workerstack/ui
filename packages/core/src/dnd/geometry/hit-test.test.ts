import { describe, expect, it } from "vitest";

import { contains, endStrip, gridIndex, gridShift } from "./hit-test.ts";

describe("gridIndex", () => {
  // Four 96px tiles in rows of two with an 8px gap.
  const slots = [
    { height: 96, width: 96, x: 0, y: 0 },
    { height: 96, width: 96, x: 104, y: 0 },
    { height: 96, width: 96, x: 0, y: 104 },
    { height: 96, width: 96, x: 104, y: 104 },
  ];

  it("picks the slot that holds the dragged center", () => {
    expect(gridIndex(slots, { x: 150, y: 40 }, 0)).toBe(1);
    expect(gridIndex(slots, { x: 40, y: 150 }, 0)).toBe(2);
  });

  it("keeps the current slot while the center is in a gap", () => {
    expect(gridIndex(slots, { x: 100, y: 40 }, 3)).toBe(3);
  });

  it("shifts an item at or after the gap into the next slot", () => {
    // Item at slot 1 with the gap at 1 draws in slot 2: one row down, one column back.
    expect(gridShift(slots, 1, 1)).toStrictEqual({ x: -104, y: 104 });
    expect(gridShift(slots, 0, 1)).toStrictEqual({ x: 0, y: 0 });
  });
});

describe("endStrip", () => {
  const rect = { height: 100, width: 50, x: 10, y: 20 };
  const down = { axis: "y", rtl: false } as const;

  it("opens past the end of a vertical list", () => {
    expect(endStrip(rect, down, 30)).toStrictEqual({ height: 30, width: 50, x: 10, y: 120 });
    expect(contains(endStrip(rect, down, 30), { x: 20, y: 125 })).toBe(true);
    expect(contains(endStrip(rect, down, 30), { x: 20, y: 151 })).toBe(false);
  });

  it("opens to the right of a horizontal list, and to the left in right to left", () => {
    expect(endStrip(rect, { axis: "x", rtl: false }, 30)).toStrictEqual({ height: 100, width: 30, x: 60, y: 20 });
    expect(endStrip(rect, { axis: "x", rtl: true }, 30)).toStrictEqual({ height: 100, width: 30, x: -20, y: 20 });
  });
});
