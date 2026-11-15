import { cleanup, render, screen } from "@solidjs/testing-library";
import { createRoot } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { mounted } from "../../test/dom.ts";
import { SortableList } from "../__fixtures__/sortable-list.fixture.tsx";
import type { SortableMove } from "./core/index.ts";
import { createSortable } from "./index.ts";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const INSTRUCTIONS = "Press Space to pick up. Use the arrow keys to move, Space to drop, Escape to cancel.";

describe("createSortable bindings", () => {
  it("describes keyboard-capable handles with the instructions, keeping their own ids", async () => {
    render(() => <SortableList handles />);
    await mounted();

    expect(screen.getByTestId("handle-a").getAttribute("aria-describedby")).toBe("hint dnd-instructions");
    const instructions = document.getElementById("dnd-instructions");

    expect(instructions?.textContent).toBe(INSTRUCTIONS);
    expect(instructions?.hidden).toBe(true);
    expect(document.querySelector('[role="status"][aria-live="polite"]')?.getAttribute("aria-atomic")).toBe("true");
  });

  it("leaves handles undescribed when the list turns keyboard lifting off", async () => {
    render(() => <SortableList handles keyboard={false} />);
    await mounted();

    expect(screen.getByTestId("handle-a").getAttribute("aria-describedby")).toBe("hint");
  });
});

describe("createSortable bindings (2)", () => {
  it("stops touch scrolling and text selection on a handle, and only delays it on a whole item", async () => {
    render(() => <SortableList handles />);
    await mounted();
    const handle = screen.getByTestId("handle-a");

    expect(getComputedStyle(handle).touchAction).toBe("none");
    expect(getComputedStyle(handle).userSelect).toBe("none");
    cleanup();
    render(() => <SortableList handles={false} />);
    await mounted();

    expect(getComputedStyle(screen.getByTestId("item-a")).touchAction).toBe("manipulation");
  });
});

describe("createSortable bindings (3)", () => {
  it("never touches classes and restores everything on cleanup", async () => {
    render(() => <SortableList handles />);
    await mounted();
    const handle = screen.getByTestId("handle-a");
    const list = screen.getByRole("list");

    expect(handle.className).toBe("grip");
    expect(list.className).toBe("list");
    cleanup();

    expect(handle.getAttribute("aria-describedby")).toBe("hint");
    expect(handle.getAttribute("style") ?? "").toBe("");
  });

  it("reports no drag at rest", () => {
    const active = createRoot((dispose) => {
      const sortable = createSortable({ onMove: vi.fn<(move: SortableMove) => void>() });
      const now = sortable.active();
      dispose();

      return now;
    });

    expect(active).toBeNull();
  });
});

describe("the core entry", () => {
  it("leaves handles to the pointer without the keyboard plug-in", async () => {
    render(() => <SortableList handles entry="core" />);
    await mounted();

    expect(screen.getByTestId("handle-a").getAttribute("aria-describedby")).toBe("hint");
    expect(document.getElementById("dnd-instructions")).toBeNull();
  });

  it("describes handles like the default entry with the keyboard plug-in", async () => {
    render(() => <SortableList handles entry="core+keyboard" />);
    await mounted();

    expect(screen.getByTestId("handle-a").getAttribute("aria-describedby")).toBe("hint dnd-instructions");
    expect(document.getElementById("dnd-instructions")?.textContent).toBe(INSTRUCTIONS);
  });
});

describe("a keyboard drag", () => {
  it("lifts with Space, moves with an arrow, drops with Space and commits the move", async () => {
    const moves: SortableMove[] = [];
    render(() => <SortableList handles ids={["a", "b", "c"]} onMove={(next) => moves.push(next)} />);
    await mounted();
    screen.getByTestId("handle-a").focus();
    await userEvent.keyboard(" ");

    expect(screen.getByTestId("item-a").dataset.dndDragging).toBe("");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard(" ");
    await vi.waitFor(() => expect(moves).toHaveLength(1));

    expect(moves[0]).toStrictEqual({ from: { index: 0, list: "tasks" }, id: "a", to: { index: 1, list: "tasks" } });
    expect(screen.getAllByRole("listitem").map((item) => item.dataset.testid)).toStrictEqual([
      "item-b",
      "item-a",
      "item-c",
    ]);
  });
});

describe("a keyboard drag (2)", () => {
  it("cancels with Escape and leaves the order alone", async () => {
    const moves: SortableMove[] = [];
    render(() => <SortableList handles ids={["a", "b", "c"]} onMove={(next) => moves.push(next)} />);
    await mounted();
    screen.getByTestId("handle-b").focus();
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(screen.getByTestId("item-b").dataset.dndDragging).toBeUndefined());

    expect(moves).toStrictEqual([]);
    expect(screen.getAllByRole("listitem").map((item) => item.dataset.testid)).toStrictEqual([
      "item-a",
      "item-b",
      "item-c",
    ]);
  });
});
