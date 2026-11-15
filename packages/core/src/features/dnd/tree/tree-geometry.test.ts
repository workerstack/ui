import { describe, expect, it } from "vitest";

import { siblingIndex, subtreeEnd } from "./tree-rows.ts";
import { treeStep } from "./tree-step.ts";
import { treeTarget } from "./tree-target.ts";
import type { TreeRow, TreeTarget } from "./tree.types.ts";
import { zoneOf } from "./zone-of.ts";

// A tree with ROWS 20px tall, indent 10:
//   0 a          (folder)
//   1   a1
//   2   a2       (folder, collapsed, 2 children)
//   3 b          (folder)
//   4   b1       (folder)
//   5     b1x
//   6 c
//   7 d          (folder, refuses: holds false, expanded with 1 child)
//   8   d1
const SPEC: [string, number, string | null, boolean, number][] = [
  ["a", 0, null, true, 2],
  ["a1", 1, "a", false, 0],
  ["a2", 1, "a", true, 2],
  ["b", 0, null, true, 1],
  ["b1", 1, "b", true, 1],
  ["b1x", 2, "b1", false, 0],
  ["c", 0, null, false, 0],
  ["d", 0, null, false, 1],
  ["d1", 1, "d", false, 0],
];

const ROWS: TreeRow[] = SPEC.map(([id, depth, parent, holds, size], i) => ({
  depth,
  height: 20,
  holds,
  id,
  parent,
  size,
  top: i * 20,
}));

/** The row's index. */
function at(id: string): number {
  return ROWS.findIndex((row) => row.id === id);
}

/** The pointer's y at a fraction of a row. */
function y(id: string, f: number): number {
  return at(id) * 20 + f * 20;
}

/** Where the row `id` lands for a pointer at `pointerY` that travelled `dx` across. */
function target(id: string, pointerY: number, dx = 0): TreeTarget {
  return treeTarget(ROWS, at(id), { dx, indent: 10, y: pointerY });
}

describe("zones", () => {
  it("splits a row that holds into quarters and one that doesn't at its midline", () => {
    expect(zoneOf(4, { height: 20, holds: true, top: 0 })).toBe("before");
    expect(zoneOf(5, { height: 20, holds: true, top: 0 })).toBe("inside");
    expect(zoneOf(14, { height: 20, holds: true, top: 0 })).toBe("inside");
    expect(zoneOf(15, { height: 20, holds: true, top: 0 })).toBe("after");
    expect(zoneOf(9, { height: 20, holds: false, top: 0 })).toBe("before");
    expect(zoneOf(10, { height: 20, holds: false, top: 0 })).toBe("after");
  });
});

describe("rows", () => {
  it("finds subtree ends and sibling indexes", () => {
    expect(subtreeEnd(ROWS, at("a"))).toBe(at("b"));
    expect(subtreeEnd(ROWS, at("b1"))).toBe(at("c"));
    expect(subtreeEnd(ROWS, at("d1"))).toBe(ROWS.length);
    expect(siblingIndex(ROWS, at("c"))).toBe(2);
    expect(siblingIndex(ROWS, at("a2"))).toBe(1);
  });
});

describe("treeTarget", () => {
  it("drops before and after siblings at the source depth", () => {
    expect(target("c", y("a1", 0.1))).toMatchObject({
      depth: 1,
      index: 0,
      inside: null,
      parent: "a",
    });
    expect(target("a1", y("c", 0.9))).toMatchObject({ depth: 0, index: 3, parent: null });
  });

  it("drops inside a row that holds, as its last child", () => {
    expect(target("c", y("a", 0.5))).toStrictEqual({
      depth: 1,
      index: 2,
      inside: "a",
      line: 0,
      parent: "a",
    });
    expect(target("c", y("a2", 0.5))).toMatchObject({ index: 2, inside: "a2" });
    expect(target("a1", y("a", 0.5))).toMatchObject({ index: 1, inside: "a" });
  });

  it("turns after an expanded branch into before its first child", () => {
    expect(target("c", y("b", 0.9))).toMatchObject({ depth: 1, index: 0, parent: "b" });
  });
});

describe("treeTarget (2)", () => {
  it("projects depth from horizontal travel, clamped by the ROWS around the gap", () => {
    // Between b1x (depth 2) and c (depth 0): depth 0, 1 or 2.
    expect(target("a1", y("b1x", 0.9), -10)).toMatchObject({ depth: 0, index: 2, parent: null });
    expect(target("a1", y("b1x", 0.9), 0)).toMatchObject({ depth: 1, index: 1, parent: "b" });
    expect(target("a1", y("b1x", 0.9), 14)).toMatchObject({ depth: 2, index: 1, parent: "b1" });
    expect(target("a1", y("b1x", 0.9), 60)).toMatchObject({ depth: 2 });
    expect(target("a1", y("b1x", 0.9), -60)).toMatchObject({ depth: 0 });
    // Under a row that can't hold, no deeper than it.
    expect(target("a1", y("c", 0.9), 60)).toMatchObject({ depth: 0, parent: null });
    // The first gap is always the top level.
    expect(target("b1x", y("a", 0.1), 60)).toMatchObject({ depth: 0, index: 0, parent: null });
  });

  it("never targets the dragged subtree, and over it the source's own gap stays, outdents included", () => {
    expect(target("b", y("b1x", 0.5))).toMatchObject({
      depth: 0,
      index: 1,
      inside: null,
      parent: null,
    });
    expect(target("b1", y("b1", 0.5), -10)).toMatchObject({ depth: 0, index: 2, parent: null });
    expect(target("b1", y("b1", 0.5), 0)).toMatchObject({ depth: 1, index: 0, parent: "b" });
  });
});

describe("treeTarget (3)", () => {
  it("forces a refusing branch's first-child gap; the caller blocks it", () => {
    expect(target("c", y("d", 0.9))).toMatchObject({ depth: 1, index: 0, parent: "d" });
    expect(target("c", y("d", 0.4))).toMatchObject({ depth: 0, index: 2, parent: null });
  });

  it("clamps pointers above and below every row", () => {
    expect(target("c", -50)).toMatchObject({ depth: 0, index: 0, line: 0, parent: null });
    expect(target("a1", 999, -10)).toMatchObject({ depth: 0, index: 4, line: 180, parent: null });
  });
});

describe("treeStep", () => {
  it("swaps with siblings", () => {
    expect(treeStep(ROWS, "a2", "up")).toStrictEqual({
      from: { index: 1, parent: "a" },
      id: "a2",
      to: { index: 0, parent: "a" },
    });
    expect(treeStep(ROWS, "a1", "up")).toBeNull();
    expect(treeStep(ROWS, "c", "down")).toMatchObject({ to: { index: 3, parent: null } });
    expect(treeStep(ROWS, "d", "down")).toBeNull();
  });

  it("indents under a previous sibling that holds, as its last child", () => {
    expect(treeStep(ROWS, "b", "indent")).toMatchObject({ to: { index: 2, parent: "a" } });
    expect(treeStep(ROWS, "d", "indent")).toBeNull();
    expect(treeStep(ROWS, "a", "indent")).toBeNull();
  });

  it("outdents to just after the parent", () => {
    expect(treeStep(ROWS, "a1", "outdent")).toStrictEqual({
      from: { index: 0, parent: "a" },
      id: "a1",
      to: { index: 1, parent: null },
    });
    expect(treeStep(ROWS, "b1x", "outdent")).toMatchObject({ to: { index: 1, parent: "b" } });
    expect(treeStep(ROWS, "c", "outdent")).toBeNull();
    expect(treeStep(ROWS, "missing", "up")).toBeNull();
  });
});
