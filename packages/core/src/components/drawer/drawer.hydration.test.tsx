import { expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../../test/hydration.ts";
import { DrawerFixture, DrawerOpenFixture } from "./__fixtures__/drawer.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/drawer.hydration.fixture.tsx", import.meta.url), {
  DrawerFixture,
  DrawerOpenFixture,
});

function visibleDrawer(): Element | undefined {
  return [...document.querySelectorAll('[role="dialog"]')].find((el) => el.checkVisibility());
}

it("hydrating Drawer claims the server's nodes without warnings (closed)", async () => {
  expect(mismatch(await hydrate("DrawerFixture"))).toStrictEqual({});
});

it("hydrating Drawer opens from the server's trigger", async () => {
  await hydrate("DrawerFixture");
  await userEvent.click(page.getByRole("button", { name: "Share" }));
  await vi.waitFor(() => expect(visibleDrawer()).toBeDefined());
  await expect.element(page.getByRole("status")).toHaveTextContent("open");
});

it("hydrating Drawer claims the server's nodes without warnings (open)", async () => {
  expect(mismatch(await hydrate("DrawerOpenFixture"))).toStrictEqual({});
});

it("hydrating Drawer shows an open drawer that closes on Escape", async () => {
  await hydrate("DrawerOpenFixture");
  await vi.waitFor(() => expect(visibleDrawer()).toBeDefined());
  await userEvent.keyboard("{Escape}");
  await vi.waitFor(() => expect(visibleDrawer()).toBeUndefined());
  await expect.element(page.getByRole("status")).toHaveTextContent("closed");
});
