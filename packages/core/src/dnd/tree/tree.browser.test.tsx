import { afterEach, expect, it } from "vitest";

import { centerOf, type Pointer, type Spot } from "../../test/pointer.ts";
import { DIRECTIONS, type Direction, mount, unmount } from "../__fixtures__/mount.fixture.ts";
import { byTestId, order } from "../__fixtures__/page.fixture.ts";
import { holdRow, TREE_START, TreePage, treeRow } from "../__fixtures__/tree-page.fixture.tsx";

afterEach(unmount);

/** Pixels per tree level; inward travel runs toward the inline end. */
const INDENT: Record<Direction, number> = { ltr: 20, rtl: -20 };

/** A spot on row `id`, a share of its height from the top. */
function on(id: string, share: number): Spot {
  const box = treeRow(id).getBoundingClientRect();

  return { x: box.x + box.width / 2, y: box.y + box.height * share };
}

/** What a tree drag does: which row, where to, how many levels deeper, and what to check before the release. */
type TreeDrag = { id: string; to: Spot; deeper?: number; during?: (pointer: Pointer) => Promise<void> };

/** Lifts row `id` from its center, moves to `to` plus `deeper` levels of travel, runs `during`, and releases. */
async function treeDrag(dir: Direction, { id, to, deeper = 0, during }: TreeDrag): Promise<void> {
  const x = centerOf(treeRow(id)).x + deeper * INDENT[dir];
  const pointer = await holdRow(id, { x, y: to.y });
  await pointer.move({ x, y: to.y }, 2);
  await during?.(pointer);
  pointer.up();
}

/** The tree page in `dir`, at its start order. */
async function tree(dir: Direction): Promise<void> {
  await mount(() => <TreePage />, dir);
  expect(order("tree")).toBe(TREE_START);
}

it.each(DIRECTIONS)("a tree drops before a row at the source depth, with a line and a chip (%s)", async (dir) => {
  await tree(dir);
  await treeDrag(dir, {
    during: async () => {
      await expect.poll(() => byTestId("indicator").hasAttribute("data-active")).toBe(true);
      expect(byTestId("chip").textContent).toBe("package.json");
      expect(treeRow("package.json").hasAttribute("data-dnd-source")).toBe(true);
    },
    id: "package.json",
    to: on("docs", 0.1),
  });

  await expect
    .poll(() => order("tree"))
    .toBe("src(app.ts,lib(util.ts),main.ts),package.json,docs(guide.md,api.md),archive(old.txt),README.md");
  expect(byTestId("indicator").hasAttribute("data-active")).toBe(false);
  await expect.poll(() => byTestId("chip").checkVisibility()).toBe(false);
});

it.each(DIRECTIONS)("a tree drops after a leaf at the depth of the rows around the gap (%s)", async (dir) => {
  await tree(dir);
  await treeDrag(dir, { id: "README.md", to: on("app.ts", 0.85) });

  await expect
    .poll(() => order("tree"))
    .toBe("src(app.ts,README.md,lib(util.ts),main.ts),docs(guide.md,api.md),archive(old.txt),package.json");
});

it.each(DIRECTIONS)("a tree drops inside a folder as its last child (%s)", async (dir) => {
  await tree(dir);
  await treeDrag(dir, {
    during: async () => {
      await expect.poll(() => treeRow("src").hasAttribute("data-dnd-target")).toBe(true);
      expect(byTestId("indicator").hasAttribute("data-active")).toBe(false);
    },
    id: "package.json",
    to: on("src", 0.5),
  });

  await expect
    .poll(() => order("tree"))
    .toBe("src(app.ts,lib(util.ts),main.ts,package.json),docs(guide.md,api.md),archive(old.txt),README.md");
  expect(treeRow("src").hasAttribute("data-dnd-target")).toBe(false);
});

it.each(DIRECTIONS)("a tree outdents and indents by horizontal travel (%s)", async (dir) => {
  await tree(dir);
  await treeDrag(dir, { deeper: -1, id: "util.ts", to: on("util.ts", 0.5) });

  await expect
    .poll(() => order("tree"))
    .toBe("src(app.ts,lib(),util.ts,main.ts),docs(guide.md,api.md),archive(old.txt),README.md,package.json");
  await treeDrag(dir, { deeper: 1, id: "util.ts", to: on("util.ts", 0.5) });
  await expect.poll(() => order("tree")).toBe(TREE_START);
});
