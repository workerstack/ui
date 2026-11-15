import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { required } from "../../test/required.ts";
import { TabsFixture, TabsLineFixture } from "./__fixtures__/tabs.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/tabs.hydration.fixture.tsx", import.meta.url), {
  TabsFixture,
  TabsLineFixture,
});

it("hydrating Tabs claims the server's nodes without a mismatch", async () => {
  const { mismatches } = await hydrate("TabsFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating Tabs claims the server's nodes without a mismatch (line variant)", async () => {
  const { mismatches } = await hydrate("TabsLineFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating Tabs switches tabs from the server's elements", async () => {
  const hydrated = await hydrate("TabsFixture");
  const billing = required(hydrated.container.querySelector('[role="tab"]:nth-child(2)'), "the server's tab");
  await userEvent.click(page.getByRole("tab", { name: "Billing" }));
  await expect.element(page.getByRole("status")).toHaveTextContent("billing");
  await expect.element(page.getByRole("tabpanel")).toHaveTextContent("Billing content");
  expect(billing.getAttribute("aria-selected")).toBe("true");
  expect(hydrated.container.querySelector('[role="tab"]:nth-child(2)')).toBe(billing);
});

it("hydrating Tabs keeps the selected line tab after hydration", async () => {
  await hydrate("TabsLineFixture");
  await expect.element(page.getByRole("tab", { name: "Billing" })).toHaveAttribute("aria-selected", "true");
  await expect.element(page.getByRole("tabpanel")).toHaveTextContent("Billing content");
});
