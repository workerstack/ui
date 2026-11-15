import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { ProjectMenuFixture, ProjectMenuOpenFixture } from "./__fixtures__/menu-filter.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/menu-filter.hydration.fixture.tsx", import.meta.url), {
  ProjectMenuFixture,
  ProjectMenuOpenFixture,
});

it("hydrating a filtered Menu claims the server's nodes without warnings (closed)", async () => {
  const { mismatches } = await hydrate("ProjectMenuFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating a filtered Menu claims the server's nodes without warnings (open)", async () => {
  const { mismatches } = await hydrate("ProjectMenuOpenFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating an open filtered Menu narrows its items as the query is typed", async () => {
  await hydrate("ProjectMenuOpenFixture");
  await expect.element(page.getByRole("searchbox", { name: "Filter" })).toBeVisible();
  await userEvent.fill(page.getByRole("searchbox", { name: "Filter" }), "pay");
  await expect.element(page.getByRole("menuitem", { name: "Payments" })).toBeVisible();
  await expect.element(page.getByRole("menuitem", { name: "Onboarding" })).not.toBeInTheDocument();
  await expect.element(page.getByRole("menuitem", { name: "Café redesign" })).not.toBeInTheDocument();
});
