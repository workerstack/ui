import { expect, it } from "vitest";
import { page } from "vitest/browser";

import { hydrator, mismatch } from "../../test/hydration.ts";
import { EmptyViewFixture, ViewFixture } from "./__fixtures__/view.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/view.hydration.fixture.tsx", import.meta.url), {
  EmptyViewFixture,
  ViewFixture,
});

it("hydrating View claims the server's nodes without warnings", async () => {
  expect(mismatch(await hydrate("ViewFixture"))).toStrictEqual({});
});

it("hydrating View keeps each label naming its output", async () => {
  await hydrate("ViewFixture");
  await expect.element(page.getByRole("status", { name: "Name" })).toHaveTextContent("Ada");
  await expect.element(page.getByRole("status", { name: "Active" })).toHaveTextContent("Yes");
  await expect.element(page.getByRole("status", { name: "Priority" })).toHaveTextContent("UrgentNormal");
});

it("hydrating an empty View claims the server's nodes without warnings", async () => {
  expect(mismatch(await hydrate("EmptyViewFixture"))).toStrictEqual({});
});
