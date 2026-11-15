import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../../test/hydration.ts";
import { ProjectMenuFixture, ProjectMenuOpenFixture } from "./__fixtures__/menu-filter.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/menu-filter.hydration.fixture.tsx", import.meta.url), {
  ProjectMenuFixture,
  ProjectMenuOpenFixture,
});

// The server's own warnings are left out: UI SDK's MenuContent writes a signal on the server
// (SERVER_WRITE), which menu.server.test.tsx pins.
const IGNORED: Parameters<typeof mismatch>[1] = ["warnings", "replaced", "added"];

it("hydrating a filtered Menu claims the server's nodes without warnings (closed)", async () => {
  expect(mismatch(await hydrate("ProjectMenuFixture"), IGNORED)).toStrictEqual({});
});

it("hydrating a filtered Menu claims the server's nodes without warnings (open)", async () => {
  expect(mismatch(await hydrate("ProjectMenuOpenFixture"), IGNORED)).toStrictEqual({});
});

it("hydrating an open filtered Menu narrows its items as the query is typed", async () => {
  await hydrate("ProjectMenuOpenFixture");
  await expect.element(page.getByRole("searchbox", { name: "Filter" })).toBeVisible();
  await userEvent.fill(page.getByRole("searchbox", { name: "Filter" }), "pay");
  await expect.element(page.getByRole("menuitem", { name: "Payments" })).toBeVisible();
  await expect.element(page.getByRole("menuitem", { name: "Onboarding" })).not.toBeInTheDocument();
  await expect.element(page.getByRole("menuitem", { name: "Café redesign" })).not.toBeInTheDocument();
});
