import { pointer } from "@workerstack/testing/web/dom";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { DialogPage } from "../__fixtures__/list-pages.fixture.tsx";
import { DIRECTIONS, mount, unmount } from "../__fixtures__/mount.fixture.ts";
import { byTestId, live, order } from "../__fixtures__/page.fixture.ts";

afterEach(unmount);

it.each(DIRECTIONS)("a sortable drags inside a modal dialog and announces there (%s)", async (dir) => {
  await mount(() => <DialogPage />, dir);
  await userEvent.click(byTestId("open"));
  const dialog = document.querySelector("dialog") ?? document.body;

  expect(dialog.hasAttribute("open")).toBe(true);
  const item = byTestId("item-modal-a");
  const handle = byTestId("handle-modal-a").getBoundingClientRect();
  const grip = { x: handle.x + 16, y: handle.y + 10 };
  const mouse = pointer.create();
  mouse.down({ x: handle.x + 10, y: handle.y + 10 });
  await mouse.move(grip, 2);
  expect(item.hasAttribute("data-dnd-dragging")).toBe(true);
  expect(item.matches(":popover-open")).toBe(true);
  // The item's center onto c's center: it takes c's place.
  const middle = pointer.centerOf(item);
  const target = pointer.centerOf(byTestId("item-modal-c"));
  await mouse.move({ x: target.x - (middle.x - grip.x), y: target.y - (middle.y - grip.y) }, 12);
  mouse.up();
  await expect.poll(() => order("modal")).toBe("b,c,a,d");
  expect(dialog.hasAttribute("open")).toBe(true);
  await expect.poll(() => live(dialog)).toMatch(/^Dropped Item a at position 3 of 4 in Dialog list\.\s?$/);
  expect(item.hasAttribute("popover")).toBe(false);
});
