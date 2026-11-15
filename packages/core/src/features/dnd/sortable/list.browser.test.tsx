import { pointer, type Pointer } from "@workerstack/testing/web/dom";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { ListPage } from "../__fixtures__/list-pages.fixture.tsx";
import { DIRECTIONS, mount, unmount } from "../__fixtures__/mount.fixture.ts";
import { byTestId, order, outcome } from "../__fixtures__/page.fixture.ts";

afterEach(unmount);

/** Presses handle `id` 10px into its box and moves `dy` pixels down in `steps`. */
async function pressHandle(id: string, dy: number, steps: number): Promise<Pointer> {
  const start = byTestId(`handle-${id}`).getBoundingClientRect();
  const mouse = pointer.create();
  mouse.down({ x: start.x + 10, y: start.y + 10 });
  await mouse.move({ x: start.x + 10, y: start.y + 10 + dy }, steps);

  return mouse;
}

it.each(DIRECTIONS)("a list drags an item down past another by its handle (%s)", async (dir) => {
  await mount(() => <ListPage />, dir);
  await pointer.drag(byTestId("handle-handles-a"), { to: pointer.beside(byTestId("item-handles-c"), "after") });

  await expect.poll(() => order("handles")).toBe("b,c,a,d,e");
  expect(outcome("handles")).toBe("a:0>2");
});

it.each(DIRECTIONS)("a list drags an item up past a tall one (%s)", async (dir) => {
  await mount(() => <ListPage />, dir);
  await pointer.drag(byTestId("handle-handles-d"), { to: pointer.beside(byTestId("item-handles-c"), "before") });

  await expect.poll(() => order("handles")).toBe("a,b,d,c,e");
});

it.each(DIRECTIONS)("a list lifts into the top layer and restores the item after (%s)", async (dir) => {
  await mount(() => <ListPage />, dir);
  const item = byTestId("item-handles-b");
  const mouse = await pressHandle("handles-b", 20, 4);

  expect(item.hasAttribute("data-dnd-dragging")).toBe(true);
  expect(item.matches(":popover-open")).toBe(true);
  mouse.up();
  await expect.poll(() => item.hasAttribute("data-dnd-dragging")).toBe(false);
  expect(item.getAttribute("style")).toBeNull();
  expect(item.hasAttribute("popover")).toBe(false);
  await expect.poll(() => document.querySelectorAll("[data-dnd-placeholder]").length).toBe(0);
});

it.each(DIRECTIONS)("a list keeps clicks on inner buttons and fires none after a drag (%s)", async (dir) => {
  await mount(() => <ListPage />, dir);
  await userEvent.click(byTestId("inner-handles-b"));

  expect(document.querySelector('[data-clicks="handles"]')?.textContent).toBe("1");
  const label = byTestId("item-whole-a").querySelector("span") ?? document.body;
  await pointer.drag(label, { to: pointer.beside(byTestId("item-whole-c"), "after") });
  await expect.poll(() => order("whole")).toBe("b,c,a,d");
  expect(document.querySelector('[data-clicks="whole"]')?.textContent).toBe("0");
});

it.each(DIRECTIONS)("a list cancels a pointer drag back home on Escape (%s)", async (dir) => {
  await mount(() => <ListPage />, dir);
  const mouse = await pressHandle("handles-a", 130, 10);
  await userEvent.keyboard("{Escape}");
  mouse.up();

  await expect.poll(() => outcome("handles")).toBe("cancel");
  expect(order("handles")).toBe("a,b,c,d,e");
});

it.each(DIRECTIONS)("a list never lifts a disabled item (%s)", async (dir) => {
  await mount(() => <ListPage />, dir);
  const mouse = await pressHandle("handles-e", -130, 8);

  expect(byTestId("item-handles-e").hasAttribute("data-dnd-dragging")).toBe(false);
  mouse.up();
  await pointer.frame();
  expect(order("handles")).toBe("a,b,c,d,e");
});

it.each(DIRECTIONS)("a list styles its activators for touch and selection (%s)", async (dir) => {
  await mount(() => <ListPage />, dir);
  const handle = getComputedStyle(byTestId("handle-handles-a"));

  expect(handle.touchAction).toBe("none");
  expect(handle.userSelect).toBe("none");
  expect(getComputedStyle(byTestId("item-whole-a")).touchAction).toBe("manipulation");
});
