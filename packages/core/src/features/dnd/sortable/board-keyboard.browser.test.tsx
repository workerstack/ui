import { pointer } from "@workerstack/testing/web/dom";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { mountBoard } from "../__fixtures__/board-page.fixture.tsx";
import { DIRECTIONS, NEXT_KEY, unmount } from "../__fixtures__/mount.fixture.ts";
import { byTestId, live, order } from "../__fixtures__/page.fixture.ts";

afterEach(unmount);

it.each(DIRECTIONS)("Board moves across columns by keyboard and keeps focus on the card (%s)", async (dir) => {
  await mountBoard(dir);
  byTestId("card-a0-1").focus();
  await userEvent.keyboard(" ");
  await userEvent.keyboard(NEXT_KEY[dir]);

  await expect.poll(() => live()).toMatch(/^Card a0-1, position 1 of 3 in In progress, Alice\.\s?$/);
  await userEvent.keyboard(" ");
  await expect.poll(() => order("alice:doing")).toBe("a0-1,a1-1,a1-2");
  await expect
    .poll(() => live())
    .toMatch(/^Moved Card a0-1 from To do, Alice to In progress, Alice, position 1 of 3\.\s?$/);
  await expect.poll(() => document.activeElement).toBe(byTestId("card-a0-1"));
});

it.each(DIRECTIONS)("Board moves to the lane below past a cell's end by keyboard (%s)", async (dir) => {
  await mountBoard(dir);
  byTestId("card-a0-2").focus();
  await userEvent.keyboard(" ");
  await userEvent.keyboard("{ArrowDown}");
  await userEvent.keyboard(" ");

  await expect.poll(() => order("bob:todo")).toBe("a0-2,b0-1,b0-2");
});

it.each(DIRECTIONS)("Board scrolls sideways near its inline end (%s)", async (dir) => {
  await mountBoard(dir, { narrow: true });
  const scroller = byTestId("board");
  const box = scroller.getBoundingClientRect();
  const from = pointer.centerOf(byTestId("card-a0-1"));
  const mouse = pointer.create();
  await mouse.lift(from);
  // Overflow runs toward the inline end: right in LTR, left (negative scrollLeft) in RTL.
  await mouse.move({ x: dir === "rtl" ? box.x + 6 : box.right - 6, y: from.y }, 12);

  await expect.poll(() => Math.abs(scroller.scrollLeft)).toBeGreaterThan(0);
  await userEvent.keyboard("{Escape}");
  mouse.up();
});
