import { afterEach, expect, it } from "vitest";

import { centerOf, type Spot } from "../../test/pointer.ts";
import { DIRECTIONS, mount, unmount } from "../__fixtures__/mount.fixture.ts";
import { order } from "../__fixtures__/page.fixture.ts";
import { holdRow, TREE_START, TreePage, treeRow } from "../__fixtures__/tree-page.fixture.tsx";

afterEach(unmount);

/** The middle of row `id`. */
function middle(id: string): Spot {
  return centerOf(treeRow(id));
}

it.each(DIRECTIONS)("a tree expands a collapsed folder after a hover, then drops inside it (%s)", async (dir) => {
  await mount(() => <TreePage />, dir);

  expect(treeRow("guide.md").checkVisibility()).toBe(false);
  const pointer = await holdRow("README.md", { y: middle("docs").y });
  await expect.poll(() => treeRow("docs").getAttribute("aria-expanded")).toBe("true");
  expect(treeRow("guide.md").checkVisibility()).toBe(true);
  // The rows below moved down: hover the folder's middle again.
  await pointer.move({ x: pointer.at.x, y: middle("docs").y }, 2);
  await expect.poll(() => treeRow("docs").hasAttribute("data-dnd-target")).toBe(true);
  pointer.up();
  await expect
    .poll(() => order("tree"))
    .toBe("src(app.ts,lib(util.ts),main.ts),docs(guide.md,api.md,README.md),archive(old.txt),package.json");
});

it.each(DIRECTIONS)("a tree never drops a folder into its own subtree (%s)", async (dir) => {
  await mount(() => <TreePage />, dir);
  const pointer = await holdRow("src", { y: middle("lib").y });

  expect(treeRow("lib").hasAttribute("data-dnd-target")).toBe(false);
  expect(treeRow("util.ts").hasAttribute("data-dnd-source")).toBe(true);
  pointer.up();
  await expect.poll(() => treeRow("src").hasAttribute("data-dnd-source")).toBe(false);
  expect(order("tree")).toBe(TREE_START);
});

it.each(DIRECTIONS)("a tree shows a blocked folder and cancels a drop there (%s)", async (dir) => {
  await mount(() => <TreePage />, dir);
  const pointer = await holdRow("README.md", { y: middle("archive").y });

  await expect.poll(() => treeRow("archive").hasAttribute("data-dnd-blocked")).toBe(true);
  pointer.up();
  await expect.poll(() => treeRow("archive").hasAttribute("data-dnd-blocked")).toBe(false);
  expect(order("tree")).toBe(TREE_START);
});
