import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { a11yProblems } from "../__fixtures__/a11y.fixture.ts";
import { ListPage } from "../__fixtures__/list-pages.fixture.tsx";
import { DIRECTIONS, mount, unmount } from "../__fixtures__/mount.fixture.ts";
import { byTestId } from "../__fixtures__/page.fixture.ts";
import { TablePage } from "../__fixtures__/table-page.fixture.tsx";
import { TreePage } from "../__fixtures__/tree-page.fixture.tsx";

afterEach(unmount);

it.each(DIRECTIONS)("a sortable list has no ARIA problems at rest or during a keyboard drag (%s)", async (dir) => {
  await mount(() => <ListPage />, dir);

  expect(a11yProblems()).toStrictEqual([]);
  byTestId("handle-handles-b").focus();
  await userEvent.keyboard(" ");
  await expect.poll(() => byTestId("item-handles-b").hasAttribute("data-dnd-keyboard")).toBe(true);
  expect(a11yProblems()).toStrictEqual([]);
  expect(byTestId("handle-handles-b").getAttribute("aria-describedby")).toBe("dnd-instructions");
  expect(document.getElementById("dnd-instructions")?.textContent).toMatch(/^Press Space to pick up\./);
  await userEvent.keyboard("{Escape}");
});

it.each(DIRECTIONS)("a sortable tree and a sortable table have no ARIA problems (%s)", async (dir) => {
  await mount(() => <TreePage />, dir);

  expect(a11yProblems()).toStrictEqual([]);
  await unmount();
  await mount(() => <TablePage />, dir);
  expect(a11yProblems()).toStrictEqual([]);
});

it("the ARIA check finds the problems it looks for", async () => {
  await mount(() => (
    <div>
      <button type="button" aria-describedby="missing" />
      <div aria-hidden="true">
        <a href="#x">x</a>
      </div>
      <div role="treeitem">orphan</div>
      <p aria-expanded="false">p</p>
      <span id="twice" />
      <span id="twice" />
    </div>
  ));

  expect(a11yProblems()).toHaveLength(6);
});
