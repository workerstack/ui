import { describe, expect, it } from "vitest";

import { defaultMessages, resolveMessages } from "./dnd-messages.ts";

describe("defaultMessages", () => {
  it("names the item and its position, and the list when there is one", () => {
    expect(defaultMessages.lifted({ item: "Task A", position: 2, total: 5 })).toBe(
      "Picked up Task A. Position 2 of 5.",
    );
    expect(defaultMessages.lifted({ item: "Task A", list: "To do", position: 2, total: 5 })).toBe(
      "Picked up Task A. Position 2 of 5 in To do.",
    );
    expect(defaultMessages.moved({ item: "Task A", list: "Doing", position: 3, total: 5 })).toBe(
      "Task A, position 3 of 5 in Doing.",
    );
    expect(defaultMessages.dropped({ item: "Task A", position: 4, total: 5 })).toBe(
      "Dropped Task A at position 4 of 5.",
    );
    expect(defaultMessages.movedAcross({ from: "To do", item: "Task A", position: 1, to: "Doing", total: 3 })).toBe(
      "Moved Task A from To do to Doing, position 1 of 3.",
    );
    expect(defaultMessages.canceled("Task A", 2)).toBe("Move canceled. Task A is back at position 2.");
    expect(defaultMessages.blocked("Task A", "Done")).toBe("Task A can't move to Done.");
    expect(defaultMessages.noMove("Task A")).toBe("Task A can't move further.");
  });
});

describe("defaultMessages (2)", () => {
  it("says where a tree item went", () => {
    expect(defaultMessages.treeMoved({ item: "button.tsx", parent: "components", position: 1, total: 3 })).toBe(
      "Moved button.tsx into components, position 1 of 3.",
    );
    expect(defaultMessages.treeMoved({ item: "page.tsx", parent: undefined, position: 2, total: 4 })).toBe(
      "Moved page.tsx to the top level, position 2 of 4.",
    );
  });

  it("explains the keys", () => {
    expect(defaultMessages.instructions).toBe(
      "Press Space to pick up. Use the arrow keys to move, Space to drop, Escape to cancel.",
    );
  });
});

describe("resolveMessages", () => {
  it("lays given strings over the defaults", () => {
    const messages = resolveMessages({ noMove: (item) => `${item} ne može dalje.` });

    expect(messages.noMove("A")).toBe("A ne može dalje.");
    expect(messages.instructions).toBe(defaultMessages.instructions);
  });
});
