import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { inputElement } from "../test/dom.ts";
import { hydrator, mismatch } from "../test/hydration.ts";
import { TextInputFixture } from "./__fixtures__/text-input.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/text-input.hydration.fixture.tsx", import.meta.url), {
  TextInputFixture,
});

const NAME = { name: "Name" };

it("hydrating TextInput claims the server's nodes without warnings", async () => {
  expect(mismatch(await hydrate("TextInputFixture"), ["serverWarnings", "warnings", "replaced"])).toStrictEqual({});
});

it("hydrating TextInput reports typing and cleans on Tab", async () => {
  await hydrate("TextInputFixture");
  const input = page.getByRole("textbox", NAME);
  await userEvent.click(input);
  await userEvent.keyboard(" Ada ");
  await expect.element(page.getByRole("status")).toHaveTextContent("[ Ada ]");
  await userEvent.tab();
  expect(inputElement(input.element()).value).toBe("Ada");
  await expect.element(page.getByRole("status")).toHaveTextContent("[Ada]");
});
