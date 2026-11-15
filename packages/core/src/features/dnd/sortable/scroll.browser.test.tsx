import { pointer, type Spot } from "@workerstack/testing/web/dom";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { ScrollPage } from "../__fixtures__/list-pages.fixture.tsx";
import { DIRECTIONS, mount, unmount } from "../__fixtures__/mount.fixture.ts";
import { byTestId, order, outcome } from "../__fixtures__/page.fixture.ts";

afterEach(unmount);

/** The center of item `id`'s label in the long list. */
function label(id: string): Spot {
  return pointer.centerOf(byTestId(`item-long-${id}`).querySelector("span") ?? document.body);
}

it.each(DIRECTIONS)("auto-scroll scrolls the panel near its edge and drops after scrolling (%s)", async (dir) => {
  await mount(() => <ScrollPage />, dir);
  const panel = byTestId("panel");
  const box = panel.getBoundingClientRect();
  const start = label("a");
  const mouse = pointer.create();
  await mouse.lift(start);
  await mouse.move({ x: start.x + 6, y: box.bottom - 8 }, 12);

  await expect.poll(() => panel.scrollTop).toBeGreaterThan(200);
  await mouse.move({ x: start.x + 6, y: box.y + box.height / 2 }, 6);
  mouse.up();
  await expect.poll(() => outcome("long")).toMatch(/^a:0>/);
  expect(order("long").split(",").indexOf("a")).toBeGreaterThan(4);
});

it.each(DIRECTIONS)("auto-scroll waits until the pointer moves toward the edge it sits by (%s)", async (dir) => {
  await mount(() => <ScrollPage />, dir);
  const panel = byTestId("panel");
  // Item e sits in the panel's bottom band. Lift it sideways, then hold.
  const start = label("e");
  const mouse = pointer.create();
  mouse.down(start);
  await mouse.move({ x: start.x + 12, y: start.y }, 3);
  await pointer.frames(12);

  expect(panel.scrollTop).toBe(0);
  await mouse.move({ x: start.x + 12, y: start.y + 4 }, 2);
  await expect.poll(() => panel.scrollTop).toBeGreaterThan(0);
  mouse.up();
});

it.each(DIRECTIONS)("auto-scroll scrolls the page when the pointer reaches the viewport edge (%s)", async (dir) => {
  await mount(() => <ScrollPage />, dir);
  const mouse = pointer.create();
  await mouse.lift(label("b"));
  await mouse.move({ x: innerWidth / 2, y: innerHeight - 4 }, 12);

  await expect.poll(() => scrollY).toBeGreaterThan(0);
  await userEvent.keyboard("{Escape}");
  mouse.up();
});
