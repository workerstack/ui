import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { PopoverFixture, PopoverOpenFixture } from "./__fixtures__/popover.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/popover.hydration.fixture.tsx", import.meta.url), {
  PopoverFixture,
  PopoverOpenFixture,
});

function shown(): boolean {
  return page.getByRole("dialog").query()?.checkVisibility() ?? false;
}

it("hydrating Popover claims the server's nodes without warnings (closed)", async () => {
  const { mismatches } = await hydrate("PopoverFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating Popover opens from the server's trigger", async () => {
  await hydrate("PopoverFixture");
  await userEvent.click(page.getByRole("button", { name: "Dimensions" }));
  await vi.waitFor(() => expect(shown()).toBe(true));
  await expect.element(page.getByRole("status")).toHaveTextContent("open");
});

it("hydrating Popover claims the server's nodes without warnings (open)", async () => {
  const { mismatches } = await hydrate("PopoverOpenFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating Popover makes an open popover shown and closable", async () => {
  await hydrate("PopoverOpenFixture");
  await vi.waitFor(() => expect(shown()).toBe(true));
  await userEvent.keyboard("{Escape}");
  await vi.waitFor(() => expect(shown()).toBe(false));
  await expect.element(page.getByRole("status")).toHaveTextContent("closed");
});
