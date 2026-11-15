import { afterEach, beforeEach, expect, it } from "vitest";

import { centerOf, createPointer, frames } from "../../test/pointer.ts";
import { ListPage } from "../__fixtures__/list-pages.fixture.tsx";
import { mount, unmount } from "../__fixtures__/mount.fixture.ts";
import { byTestId, order, outcome } from "../__fixtures__/page.fixture.ts";

beforeEach(() => mount(() => <ListPage />));

afterEach(unmount);

it("a long touch press lifts a whole item, then it drags", async () => {
  const touch = createPointer("touch");
  const item = byTestId("item-whole-a");
  const from = centerOf(item.querySelector("span") ?? item);
  touch.down(from);

  await expect.poll(() => item.hasAttribute("data-dnd-dragging")).toBe(true);
  // The item's center onto c's center: it takes c's place.
  await touch.move({ x: from.x, y: centerOf(byTestId("item-whole-c")).y }, 10);
  touch.up();
  await expect.poll(() => order("whole")).toBe("b,c,a,d");
});

it("a quick touch swipe on a whole item doesn't drag", async () => {
  const touch = createPointer("touch");
  const item = byTestId("item-whole-a");
  const from = centerOf(item.querySelector("span") ?? item);
  touch.down(from);
  await touch.move({ x: from.x, y: from.y + 60 }, 4);
  touch.up();
  await frames();

  expect(item.hasAttribute("data-dnd-dragging")).toBe(false);
  expect(order("whole")).toBe("a,b,c,d");
  expect(outcome("whole")).toBe("");
});

it("a touch on a handle drags at once, without a long press", async () => {
  const touch = createPointer("touch");
  const from = centerOf(byTestId("handle-handles-a"));
  touch.down(from);
  await touch.move({ x: from.x, y: from.y + 8 }, 2);

  expect(byTestId("item-handles-a").hasAttribute("data-dnd-dragging")).toBe(true);
  await touch.move({ x: from.x, y: centerOf(byTestId("item-handles-b")).y + 30 }, 10);
  touch.up();
  await expect.poll(() => order("handles")).toBe("b,a,c,d,e");
});
