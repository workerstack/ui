import { pointer } from "@workerstack/testing/web/dom";
import { afterEach, expect, it } from "vitest";

import { mountBoard } from "../__fixtures__/board-page.fixture.tsx";
import { DIRECTIONS, unmount } from "../__fixtures__/mount.fixture.ts";
import { byTestId, order, outcome } from "../__fixtures__/page.fixture.ts";

afterEach(unmount);

/** Drags card `id` until its center sits on `target`'s center. */
async function cardOnto(id: string, target: string): Promise<void> {
  const card = byTestId(`card-${id}`);
  await pointer.dragCenterTo({ handle: card, item: card, to: pointer.centerOf(byTestId(target)) });
}

it.each(DIRECTIONS)("Board reorders within a cell (%s)", async (dir) => {
  await mountBoard(dir);
  await cardOnto("a0-1", "card-a0-2");

  await expect.poll(() => order("alice:todo")).toBe("a0-2,a0-1");
});

it.each(DIRECTIONS)("Board moves a card to another column (%s)", async (dir) => {
  await mountBoard(dir);
  await cardOnto("a0-1", "card-a1-1");

  await expect.poll(() => order("alice:doing")).toBe("a0-1,a1-1,a1-2");
  expect(order("alice:todo")).toBe("a0-2");
  await expect.poll(() => document.querySelectorAll("[data-dnd-placeholder]").length).toBe(0);
});

it.each(DIRECTIONS)("Board moves a card to another lane (%s)", async (dir) => {
  await mountBoard(dir);
  await cardOnto("a0-1", "card-b0-1");

  await expect.poll(() => order("bob:todo")).toBe("a0-1,b0-1,b0-2");
});

it.each(DIRECTIONS)("Board drops into an empty cell (%s)", async (dir) => {
  await mountBoard(dir);
  await cardOnto("a0-1", "cell-bob:review");

  await expect.poll(() => order("bob:review")).toBe("a0-1");
});

it.each(DIRECTIONS)("Board opens a collapsed lane when a drag rests on it (%s)", async (dir) => {
  await mountBoard(dir);
  const mouse = pointer.create();
  await mouse.lift(pointer.centerOf(byTestId("card-a0-1")));
  await mouse.move(pointer.centerOf(byTestId("lane-carol")), 10);

  await expect.poll(() => document.querySelector('[data-testid="cell-carol:todo"]')).not.toBeNull();
  await mouse.move(pointer.centerOf(byTestId("card-c0-1")), 10);
  mouse.up();
  await expect.poll(() => order("carol:todo")).toBe("a0-1,c0-1,c0-2");
});

it.each(DIRECTIONS)("Board blocks a move the rules forbid, and cancels the drop (%s)", async (dir) => {
  await mountBoard(dir);
  const mouse = pointer.create();
  await mouse.lift(pointer.centerOf(byTestId("card-a3-1")));
  await mouse.move(pointer.centerOf(byTestId("card-a0-1")), 16);

  await expect.poll(() => byTestId("cell-alice:todo").hasAttribute("data-dnd-blocked")).toBe(true);
  mouse.up();
  await expect.poll(() => outcome("board")).toBe("cancel");
  expect(order("alice:done")).toBe("a3-1,a3-2");
});
