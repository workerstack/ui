import { pointer } from "@workerstack/testing/web/dom";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { GridPage, HorizontalPage } from "../__fixtures__/list-pages.fixture.tsx";
import { DIRECTIONS, mount, NEXT_KEY, unmount } from "../__fixtures__/mount.fixture.ts";
import { byTestId, order } from "../__fixtures__/page.fixture.ts";

afterEach(unmount);

it.each(DIRECTIONS)("a wrap grid moves a tile across a row wrap (%s)", async (dir) => {
  await mount(() => <GridPage />, dir);
  await pointer.drag(byTestId("handle-tiles-a"), { to: pointer.centerOf(byTestId("item-tiles-d")) });

  await expect.poll(() => order("tiles")).toBe("b,c,d,a,e,f,g");
});

it.each(DIRECTIONS)("a wrap grid moves a tile back to the start (%s)", async (dir) => {
  await mount(() => <GridPage />, dir);
  await pointer.drag(byTestId("handle-tiles-f"), { to: pointer.centerOf(byTestId("item-tiles-a")) });

  await expect.poll(() => order("tiles")).toBe("f,a,b,c,d,e,g");
});

it.each(DIRECTIONS)("a wrap grid moves by rows from the keyboard (%s)", async (dir) => {
  await mount(() => <GridPage />, dir);
  byTestId("handle-tiles-b").focus();
  await userEvent.keyboard(" ");
  await userEvent.keyboard("{ArrowDown}");
  await userEvent.keyboard(" ");

  await expect.poll(() => order("tiles")).toBe("a,c,d,e,b,f,g");
});

it.each(DIRECTIONS)("a horizontal list drags a chip along the row in the reading direction (%s)", async (dir) => {
  await mount(() => <HorizontalPage />, dir);
  // The chip's center onto c's center: it lands where c was, in either direction.
  const to = pointer.centerOf(byTestId("item-row-c"));
  await pointer.dragCenterTo({ axis: "x", handle: byTestId("handle-row-a"), item: byTestId("item-row-a"), to });

  await expect.poll(() => order("row")).toBe("b,c,a,d,e");
});

it.each(DIRECTIONS)("a horizontal list's arrow keys follow the visual direction (%s)", async (dir) => {
  await mount(() => <HorizontalPage />, dir);
  byTestId("handle-row-a").focus();
  await userEvent.keyboard(" ");
  await userEvent.keyboard(NEXT_KEY[dir]);
  await userEvent.keyboard(" ");

  await expect.poll(() => order("row")).toBe("b,a,c,d,e");
});
