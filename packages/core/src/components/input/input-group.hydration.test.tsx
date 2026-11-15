import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { inputElement } from "../../test/dom.ts";
import { AddonGroupFixture } from "./__fixtures__/input-group.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/input-group.hydration.fixture.tsx", import.meta.url), {
  AddonGroupFixture,
});

it("hydrating a group with addons claims the server's nodes without mismatch", async () => {
  const { mismatches } = await hydrate("AddonGroupFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating a group with addons keeps the value and reports typing", async () => {
  await hydrate("AddonGroupFixture");
  const input = page.getByRole("textbox", { name: "Amount" });
  expect(inputElement(input.element()).value).toBe("12");
  await userEvent.click(input);
  await userEvent.keyboard("{End}3");
  await expect.element(page.getByRole("status")).toHaveTextContent("123");
});
