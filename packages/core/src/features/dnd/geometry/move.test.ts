import { describe, expect, it } from "vitest";

import { move } from "./move.ts";

describe("move", () => {
  it("moves an entry forward and back", () => {
    expect(move(["a", "b", "c", "d"], 0, 2)).toStrictEqual(["b", "c", "a", "d"]);
    expect(move(["a", "b", "c", "d"], 3, 1)).toStrictEqual(["a", "d", "b", "c"]);
  });

  it("returns a copy, unchanged, for the same or an out-of-range index", () => {
    const list = ["a", "b"];

    expect(move(list, 1, 1)).toStrictEqual(["a", "b"]);
    expect(move(list, 0, 5)).toStrictEqual(["a", "b"]);
    expect(move(list, 0, 1)).not.toBe(list);
  });
});
