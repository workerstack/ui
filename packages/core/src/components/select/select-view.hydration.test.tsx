import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";
import { page } from "vitest/browser";

import { SelectViewFixture } from "./__fixtures__/select-view.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/select-view.fixture.tsx", import.meta.url), { SelectViewFixture });

it("hydrating SelectView claims the server's nodes without warnings", async () => {
  const { mismatches } = await hydrate("SelectViewFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating SelectView keeps the label naming its output", async () => {
  await hydrate("SelectViewFixture");
  await expect.element(page.getByRole("status", { name: "Role" })).toHaveTextContent("Member");
});
