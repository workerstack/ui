import { expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../../test/hydration.ts";
import { MenuFixture, MenuOpenFixture } from "./__fixtures__/menu.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/menu.hydration.fixture.tsx", import.meta.url), {
  MenuFixture,
  MenuOpenFixture,
});

const CLIENT_SIDE: Parameters<typeof mismatch>[1] = ["warnings", "replaced", "added"];

function openMenus(): Element[] {
  return [...document.querySelectorAll('[role="menu"]')].filter((el) => el.matches(":popover-open"));
}

it("hydrating Menu claims the server's nodes without warnings (closed)", async () => {
  expect(mismatch(await hydrate("MenuFixture"), CLIENT_SIDE)).toStrictEqual({});
});

it("hydrating Menu opens from the server's trigger and runs the chosen action", async () => {
  await hydrate("MenuFixture");
  await userEvent.click(page.getByRole("button", { name: "Actions" }));
  await vi.waitFor(() => expect(openMenus()).toHaveLength(1));
  await userEvent.click(page.getByRole("menuitem", { name: "Rename" }));
  await expect.element(page.getByRole("status")).toHaveTextContent("rename");
});

it("hydrating Menu claims the server's nodes without warnings (open)", async () => {
  expect(mismatch(await hydrate("MenuOpenFixture"), CLIENT_SIDE)).toStrictEqual({});
});

it("hydrating Menu makes an open menu an open popup whose items work", async () => {
  await hydrate("MenuOpenFixture");
  await vi.waitFor(() => expect(openMenus()).toHaveLength(1));
  await expect.element(page.getByRole("menuitemcheckbox", { name: "Pinned" })).toHaveAttribute("aria-checked", "true");
  await userEvent.click(page.getByRole("menuitem", { name: "Delete" }));
  await expect.element(page.getByRole("status")).toHaveTextContent("delete");
});
