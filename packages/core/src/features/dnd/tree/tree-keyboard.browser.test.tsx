import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { DIRECTIONS, type Direction, mount, unmount } from "../__fixtures__/mount.fixture.ts";
import { live, order } from "../__fixtures__/page.fixture.ts";
import { TREE_START, TreePage, treeRow } from "../__fixtures__/tree-page.fixture.tsx";

afterEach(unmount);

/** Alt with the arrow toward the inline end, and toward its start. */
const INWARD: Record<Direction, string> = { ltr: "{Alt>}{ArrowRight}{/Alt}", rtl: "{Alt>}{ArrowLeft}{/Alt}" };
const OUTWARD: Record<Direction, string> = { ltr: "{Alt>}{ArrowLeft}{/Alt}", rtl: "{Alt>}{ArrowRight}{/Alt}" };
const UP = "{Alt>}{ArrowUp}{/Alt}";
const DOWN = "{Alt>}{ArrowDown}{/Alt}";

it.each(DIRECTIONS)("a tree moves a row up and down with Alt+arrows, keeps focus and announces (%s)", async (dir) => {
  await mount(() => <TreePage />, dir);
  treeRow("main.ts").focus();
  await userEvent.keyboard(UP);

  await expect
    .poll(() => order("tree"))
    .toBe("src(app.ts,main.ts,lib(util.ts)),docs(guide.md,api.md),archive(old.txt),README.md,package.json");
  expect(document.activeElement).toBe(treeRow("main.ts"));
  await expect.poll(() => live()).toContain("Moved main.ts into src, position 2 of 3.");
  await userEvent.keyboard(DOWN);
  await expect.poll(() => order("tree")).toBe(TREE_START);
});

it.each(DIRECTIONS)("a tree indents and outdents a row with Alt+arrows (%s)", async (dir) => {
  await mount(() => <TreePage />, dir);
  treeRow("main.ts").focus();
  await userEvent.keyboard(INWARD[dir]);

  await expect
    .poll(() => order("tree"))
    .toBe("src(app.ts,lib(util.ts,main.ts)),docs(guide.md,api.md),archive(old.txt),README.md,package.json");
  expect(document.activeElement).toBe(treeRow("main.ts"));
  await userEvent.keyboard(OUTWARD[dir]);
  await expect.poll(() => order("tree")).toBe(TREE_START);
  treeRow("package.json").focus();
  await userEvent.keyboard(INWARD[dir]);
  await expect.poll(() => live()).toContain("package.json can't move further.");
});

it.each(DIRECTIONS)("a tree moves a row out of its folder past its end with Alt+arrows (%s)", async (dir) => {
  await mount(() => <TreePage />, dir);
  treeRow("app.ts").focus();
  await userEvent.keyboard(DOWN);
  await userEvent.keyboard(DOWN);
  await userEvent.keyboard(OUTWARD[dir]);
  await userEvent.keyboard(DOWN);

  await expect
    .poll(() => order("tree"))
    .toBe("src(lib(util.ts),main.ts),docs(guide.md,api.md),app.ts,archive(old.txt),README.md,package.json");
});
