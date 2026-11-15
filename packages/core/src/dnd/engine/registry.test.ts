import { describe, expect, it, vi } from "vitest";

import { isPlaced } from "./registry.ts";

describe("isPlaced on an item", () => {
  it("is true once the item's element is known", () => {
    const el = document.createElement("li");

    expect(isPlaced({ el, id: "a", setDragging: vi.fn<(dragging: boolean) => void>() })).toBe(true);
    expect(isPlaced({ id: "a", setDragging: vi.fn<(dragging: boolean) => void>() })).toBe(false);
  });
});

describe("isPlaced on a list", () => {
  it("is true once the list's element is known", () => {
    const el = document.createElement("ul");

    expect(isPlaced({ axis: "y", el, id: "l", keyboard: true })).toBe(true);
    expect(isPlaced({ axis: "y", id: "l", keyboard: true })).toBe(false);
  });
});
