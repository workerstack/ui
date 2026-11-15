import { describe, expect, it } from "vitest";

import { edgeSpeed, rampedStep, scrollIntent } from "./scroll-intent.ts";
import type { ScrollCandidate } from "./scroll.types.ts";

const OPEN = { down: true, left: true, right: true, up: true };
const UNLOCKED = { down: true, left: true, right: true, up: true };

describe("edgeSpeed", () => {
  it("is zero outside the band", () => {
    // 400px container: band is min(100, 180) = 100.
    expect(edgeSpeed(100, 400)).toBe(0);
    expect(edgeSpeed(250, 400)).toBe(0);
  });

  it("rises with the square of depth and reaches full speed at half the band", () => {
    expect(edgeSpeed(99, 400)).toBe(1);
    expect(edgeSpeed(75, 400)).toBeCloseTo(5, 5);
    expect(edgeSpeed(50, 400)).toBe(20);
    expect(edgeSpeed(0, 400)).toBe(20);
  });

  it("caps the band at 180px for large containers", () => {
    expect(edgeSpeed(179, 2000)).toBe(1);
    expect(edgeSpeed(180, 2000)).toBe(0);
    expect(edgeSpeed(90, 2000)).toBe(20);
  });
});

describe("rampedStep", () => {
  it("normalizes by frame time", () => {
    expect(rampedStep(20, 1000 / 60, 400)).toBeCloseTo(20, 5);
    expect(rampedStep(20, 1000 / 120, 400)).toBeCloseTo(10, 5);
  });

  it("ramps in over 400ms of engagement, never below 1px", () => {
    expect(rampedStep(20, 1000 / 60, 0)).toBe(1);
    expect(rampedStep(20, 1000 / 60, 200)).toBeCloseTo(10, 5);
  });
});

describe("scrollIntent", () => {
  const inner: ScrollCandidate = { canScroll: OPEN, rect: { height: 400, width: 300, x: 100, y: 100 } };
  const page: ScrollCandidate = { canScroll: OPEN, rect: { height: 1000, width: 1200, x: 0, y: 0 } };

  it("lets the innermost container claim an axis", () => {
    // Near the inner box's bottom edge, well inside the page.
    const result = scrollIntent({ x: 250, y: 490 }, [inner, page], UNLOCKED);

    expect(result.map((entry) => [entry.index, entry.axis, entry.direction])).toStrictEqual([[0, "y", 1]]);
    expect(result[0]?.speed).toBeGreaterThan(0);
  });

  it("gives an outer container the axes the inner one didn't claim", () => {
    // Inner box can't scroll down any further: the page takes the y axis.
    const full: ScrollCandidate = { ...inner, canScroll: { ...OPEN, down: false } };
    const result = scrollIntent({ x: 250, y: 990 }, [full, page], UNLOCKED);

    expect(result.map((entry) => [entry.index, entry.axis, entry.direction])).toStrictEqual([[1, "y", 1]]);
  });
});

describe("scrollIntent (2)", () => {
  const inner: ScrollCandidate = { canScroll: OPEN, rect: { height: 400, width: 300, x: 100, y: 100 } };
  const page: ScrollCandidate = { canScroll: OPEN, rect: { height: 1000, width: 1200, x: 0, y: 0 } };

  it("claims both axes in a corner", () => {
    const result = scrollIntent({ x: 395, y: 495 }, [inner, page], UNLOCKED);

    expect(result.map((entry) => [entry.index, entry.axis, entry.direction])).toStrictEqual([
      [0, "x", 1],
      [0, "y", 1],
    ]);
  });

  it("skips a container the pointer isn't over", () => {
    const result = scrollIntent({ x: 600, y: 990 }, [inner, page], UNLOCKED);

    expect(result.map((entry) => entry.index)).toStrictEqual([1]);
  });

  it("doesn't scroll toward an edge the pointer hasn't moved toward since the lift", () => {
    const locked = { down: false, left: true, right: true, up: true };

    expect(scrollIntent({ x: 250, y: 490 }, [inner, page], locked)).toStrictEqual([]);
  });
});

describe("scrollIntent (3)", () => {
  const inner: ScrollCandidate = { canScroll: OPEN, rect: { height: 400, width: 300, x: 100, y: 100 } };

  it("scrolls up and left with negative directions", () => {
    const result = scrollIntent({ x: 105, y: 105 }, [inner], UNLOCKED);

    expect(result.map((entry) => [entry.axis, entry.direction])).toStrictEqual([
      ["x", -1],
      ["y", -1],
    ]);
  });
});
