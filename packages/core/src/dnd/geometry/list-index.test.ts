import { describe, expect, it } from "vitest";

import { clampAlong, insertionAt, listIndex, slotStart, span } from "./list-index.ts";

/** Items laid out after the lift (the dragged one removed), as main-axis boxes. */
function boxes(sizes: number[], gap = 8, start = 0): { start: number; end: number }[] {
  let at = start;

  return sizes.map((size) => {
    const box = { end: at + size, start: at };
    at += size + gap;

    return box;
  });
}

/** The centers of main-axis boxes. */
function centers(items: { end: number; start: number }[]): number[] {
  return items.map((item) => (item.start + item.end) / 2);
}

describe("listIndex", () => {
  // Three 40px items with an 8px gap; a 40px dragged item, so the gap amount is 48.
  const items = centers(boxes([40, 40, 40]));
  const gap = 48;

  it("keeps the gap where it is while the dragged box sits still", () => {
    // Lifted from index 1: the box spans the second slot, 48..88.
    expect(listIndex(items, 1, { end: 88, gap, start: 48 })).toBe(1);
  });

  it("moves the gap down once the box's end passes the next item's visual center", () => {
    // Item 1 (center 68) is displaced and drawn at 116; the end must pass 116.
    expect(listIndex(items, 1, { end: 115, gap, start: 75 })).toBe(1);
    expect(listIndex(items, 1, { end: 117, gap, start: 77 })).toBe(2);
  });

  it("moves the gap up once the box's start passes the previous item's center", () => {
    expect(listIndex(items, 1, { end: 61, gap, start: 21 })).toBe(1);
    expect(listIndex(items, 1, { end: 59, gap, start: 19 })).toBe(0);
  });

  it("has hysteresis: the way back needs the start to pass the center", () => {
    // After moving down (gap at 2), item 1 sits at its layout place again (center 68).
    expect(listIndex(items, 2, { end: 109, gap, start: 69 })).toBe(2);
    expect(listIndex(items, 2, { end: 107, gap, start: 67 })).toBe(1);
  });
});

describe("listIndex (2)", () => {
  it("never flickers between two indexes at one position, with variable sizes", () => {
    const tall = centers(boxes([20, 200, 20]));
    const amount = 28;
    const flickers: string[] = [];

    for (let start = -40; start < 320; start += 1) {
      for (let current = 0; current <= 3; current++) {
        const box = { end: start + 20, gap: amount, start };
        const next = listIndex(tall, current, box);

        if (listIndex(tall, next, box) !== next) flickers.push(`${start} ${current}`);
      }
    }

    expect(flickers).toStrictEqual([]);
  });
});

describe("listIndex (3)", () => {
  // Three 40px items with an 8px gap; a 40px dragged item, so the gap amount is 48.
  const items = centers(boxes([40, 40, 40]));
  const gap = 48;

  it("starts a newly entered list with nothing displaced", () => {
    // current = the item count: the box above every center inserts at 0.
    expect(listIndex(items, 3, { end: 0, gap, start: -40 })).toBe(0);
    expect(listIndex(items, 3, { end: 240, gap, start: 200 })).toBe(3);
    expect(listIndex(items, 3, { end: 90, gap, start: 50 })).toBe(1);
  });

  it("handles an empty list", () => {
    expect(listIndex([], 0, { end: 50, gap: 48, start: 10 })).toBe(0);
  });
});

describe("span", () => {
  const rect = { height: 20, width: 100, x: 10, y: 30 };

  it("reads the main axis", () => {
    expect(span(rect, { axis: "y", rtl: false })).toStrictEqual({ end: 50, start: 30 });
    expect(span(rect, { axis: "x", rtl: false })).toStrictEqual({ end: 110, start: 10 });
  });

  it("negates x in right-to-left lists so start and end stay logical", () => {
    expect(span(rect, { axis: "x", rtl: true })).toStrictEqual({ end: -10, start: -110 });
    expect(span(rect, { axis: "y", rtl: true })).toStrictEqual({ end: 50, start: 30 });
  });
});

describe("slotStart", () => {
  const items = boxes([40, 60, 40], 8, 16);

  it("is the start of the item now at the index", () => {
    expect(slotStart({ contentStart: 16, gap: 8, items }, 1)).toBe(64);
  });

  it("is after the last item and the gap at the end", () => {
    expect(slotStart({ contentStart: 16, gap: 8, items }, 3)).toBe(180);
  });

  it("is the content start in an empty list", () => {
    expect(slotStart({ contentStart: 16, gap: 8, items: [] }, 0)).toBe(16);
  });
});

describe("insertionAt", () => {
  const spans = [
    { end: 40, start: 0 },
    { end: 100, start: 48 },
    { end: 148, start: 108 },
  ];

  it("counts the items whose center comes before the position", () => {
    expect(insertionAt(spans, -10)).toBe(0);
    expect(insertionAt(spans, 30)).toBe(1);
    expect(insertionAt(spans, 90)).toBe(2);
    expect(insertionAt(spans, 500)).toBe(3);
    expect(insertionAt([], 10)).toBe(0);
  });
});

describe("clampAlong", () => {
  // A 100px header in a 600px row starting at 50, now at 200.
  const track = { length: 600, size: 100, start: 50 };

  it("follows the pointer inside the list", () => {
    expect(clampAlong(200, 30, track)).toBe(30);
    expect(clampAlong(200, -120, track)).toBe(-120);
  });

  it("stops at the list's start and end", () => {
    expect(clampAlong(200, -400, track)).toBe(-150);
    expect(clampAlong(200, 900, track)).toBe(350);
  });
});
