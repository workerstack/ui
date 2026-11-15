import { pointer, type Pointer } from "@workerstack/testing/web/dom";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { DIRECTIONS, mount, NEXT_KEY, unmount } from "../__fixtures__/mount.fixture.ts";
import { byTestId, order } from "../__fixtures__/page.fixture.ts";
import { TablePage } from "../__fixtures__/table-page.fixture.tsx";

afterEach(unmount);

/** The body cells that follow column `id`. */
function cells(id: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`td[data-dnd-follow="${id}"]`)];
}

/** Lifts the role column by its handle and moves it `dx` pixels along the row. */
async function liftRole(dx: number, steps: number): Promise<Pointer> {
  const from = pointer.centerOf(byTestId("handle-role"));
  const mouse = pointer.create();
  await mouse.lift(from, "x");
  await mouse.move({ x: from.x + dx, y: from.y + 6 }, steps);

  return mouse;
}

it.each(DIRECTIONS)("a table column's header and body cells move together (%s)", async (dir) => {
  await mount(() => <TablePage />, dir);
  const head = byTestId("head-role");
  const mouse = await liftRole(60, 6);

  expect(head.hasAttribute("data-dnd-dragging")).toBe(true);
  // The engine writes translates in its next animation frame.
  await expect.poll(() => head.style.translate).not.toBe("");
  expect(new Set(cells("role").map((cell) => cell.style.translate))).toStrictEqual(new Set([head.style.translate]));
  expect(cells("role").every((cell) => cell.hasAttribute("data-dnd-dragging"))).toBe(true);
  expect(getComputedStyle(head).zIndex).toBe("1");
  mouse.up();
  await expect.poll(() => head.hasAttribute("data-dnd-dragging")).toBe(false);
  expect(cells("role").filter((cell) => cell.hasAttribute("data-dnd-dragging"))).toStrictEqual([]);
});

it.each(DIRECTIONS)("a table drop reorders the columns and their cells (%s)", async (dir) => {
  await mount(() => <TablePage />, dir);
  const to = pointer.centerOf(byTestId("head-team"));
  await pointer.dragCenterTo({ axis: "x", handle: byTestId("handle-role"), item: byTestId("head-role"), to });

  await expect.poll(() => order("columns")).toBe("name,team,role,city");
  const first = [...document.querySelectorAll("tbody tr:first-child td")].map((cell) => cell.textContent);
  expect(first).toStrictEqual(["Person 1", "Core", "Engineer", "London"]);
});

it.each(DIRECTIONS)("a displaced table column moves its body cells with its header (%s)", async (dir) => {
  await mount(() => <TablePage />, dir);
  const shifted = byTestId("head-team");
  const mouse = await liftRole(pointer.centerOf(shifted).x - pointer.centerOf(byTestId("head-role")).x, 8);

  await expect.poll(() => shifted.style.translate).not.toMatch(/^(|0px 0px)$/);
  expect(new Set(cells("team").map((cell) => cell.style.translate))).toStrictEqual(new Set([shifted.style.translate]));
  await userEvent.keyboard("{Escape}");
  mouse.up();
  await expect.poll(() => order("columns")).toBe("name,role,team,city");
});

it.each(DIRECTIONS)("a table column moves by keyboard in the reading direction (%s)", async (dir) => {
  await mount(() => <TablePage />, dir);
  byTestId("handle-name").focus();
  await userEvent.keyboard(" ");
  await userEvent.keyboard(NEXT_KEY[dir]);
  await userEvent.keyboard(" ");

  await expect.poll(() => order("columns")).toBe("role,name,team,city");
});
