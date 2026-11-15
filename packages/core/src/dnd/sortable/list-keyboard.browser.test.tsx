import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { beside, drag, frames } from "../../test/pointer.ts";
import { ListPage } from "../__fixtures__/list-pages.fixture.tsx";
import { DIRECTIONS, mount, unmount } from "../__fixtures__/mount.fixture.ts";
import { byTestId, live, order, outcome } from "../__fixtures__/page.fixture.ts";

afterEach(unmount);

it.each(DIRECTIONS)("a list moves by keyboard with announcements (%s)", async (dir) => {
  await mount(() => <ListPage />, dir);
  byTestId("handle-handles-b").focus();
  await userEvent.keyboard(" ");

  await expect.poll(() => live()).toMatch(/^Picked up Item b\. Position 2 of 5 in Handles\.\s?$/);
  await userEvent.keyboard("{ArrowDown}");
  await expect.poll(() => live()).toMatch(/^Item b, position 3 of 5 in Handles\.\s?$/);
  await userEvent.keyboard(" ");
  await expect.poll(() => order("handles")).toBe("a,c,b,d,e");
  await expect.poll(() => live()).toMatch(/^Dropped Item b at position 3 of 5 in Handles\.\s?$/);
  await expect.poll(() => document.activeElement).toBe(byTestId("handle-handles-b"));
});

it.each(DIRECTIONS)("a list moves to its ends with Home and End, Escape cancels (%s)", async (dir) => {
  await mount(() => <ListPage />, dir);
  byTestId("handle-handles-c").focus();
  await userEvent.keyboard(" ");
  await userEvent.keyboard("{End}");

  await expect.poll(() => live()).toMatch(/^Item c, position 5 of 5 in Handles\.\s?$/);
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => outcome("handles")).toBe("cancel");
  expect(order("handles")).toBe("a,b,c,d,e");
  await userEvent.keyboard(" ");
  await userEvent.keyboard("{Home}");
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => order("handles")).toBe("c,a,b,d,e");
});

it.each(DIRECTIONS)("a list lifts a whole item with Space (%s)", async (dir) => {
  await mount(() => <ListPage />, dir);
  byTestId("item-whole-a").focus();
  await userEvent.keyboard(" ");
  await userEvent.keyboard("{ArrowDown}");
  await userEvent.keyboard("{ArrowDown}");
  await userEvent.keyboard(" ");

  await expect.poll(() => order("whole")).toBe("b,c,a,d");
});

it.each(DIRECTIONS)("a link lifts its item with Space and keeps focus; Enter follows it (%s)", async (dir) => {
  await mount(() => <ListPage />, dir);
  byTestId("link-links-a").focus();
  await userEvent.keyboard(" ");

  await expect.poll(() => byTestId("item-links-a").hasAttribute("data-dnd-keyboard")).toBe(true);
  await userEvent.keyboard("{ArrowDown}");
  await userEvent.keyboard(" ");
  await expect.poll(() => order("links")).toBe("b,a,c");
  await expect.poll(() => document.activeElement).toBe(byTestId("link-links-a"));
  byTestId("link-links-c").focus();
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => location.hash).toBe("#c");
  expect(byTestId("item-links-c").hasAttribute("data-dnd-keyboard")).toBe(false);
});

it.each(DIRECTIONS)("a pointer drag on a link moves its item without following it (%s)", async (dir) => {
  await mount(() => <ListPage />, dir);
  await drag(byTestId("link-links-a"), beside(byTestId("item-links-c"), "after"));

  await expect.poll(() => order("links")).toBe("b,c,a");
  expect(location.hash).toBe("");
});

it.each(DIRECTIONS)("a core list drags by pointer alone and leaves Space to the page (%s)", async (dir) => {
  await mount(() => <ListPage />, dir);
  const handle = byTestId("handle-core-a");

  expect(handle.getAttribute("aria-describedby") ?? "").not.toMatch(/dnd-instructions/);
  handle.focus();
  await userEvent.keyboard(" ");
  await frames();
  expect(byTestId("item-core-a").hasAttribute("data-dnd-keyboard")).toBe(false);
  expect(order("core")).toBe("a,b,c");
  await drag(handle, beside(byTestId("item-core-c"), "after"));
  await expect.poll(() => order("core")).toBe("b,c,a");
});

it.each(DIRECTIONS)("a keyboard drop never takes back focus the user moved (%s)", async (dir) => {
  await mount(() => <ListPage />, dir);
  byTestId("link-links-a").focus();
  await userEvent.keyboard(" ");
  await userEvent.keyboard("{ArrowDown}");
  const output = document.querySelector('[data-order="links"]') ?? document.body;
  let wasMoved = false;

  // Focus link c in the commit's own microtask, before the frame that restores focus.
  const observer = new MutationObserver(() => {
    if (output.textContent !== "b,a,c") return;
    observer.disconnect();
    byTestId("link-links-c").focus();
    wasMoved = true;
  });

  observer.observe(output, { characterData: true, childList: true, subtree: true });
  await userEvent.keyboard(" ");

  await expect.poll(() => wasMoved).toBe(true);
  await frames(2);
  expect(document.activeElement).toBe(byTestId("link-links-c"));
});
