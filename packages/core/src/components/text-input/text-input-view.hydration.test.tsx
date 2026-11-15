import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";
import { page } from "vitest/browser";

import { NameViews } from "./__fixtures__/text-input-view.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/text-input-view.fixture.tsx", import.meta.url), { NameViews });

it("hydrating TextInputView claims the server's nodes without warnings", async () => {
  const { mismatches } = await hydrate("NameViews");
  expect(mismatches).toStrictEqual({});
  await expect.element(page.getByRole("status", { name: "Name" })).toHaveTextContent("Ada Lovelace");
});
