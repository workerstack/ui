import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { inputElement } from "../../test/dom.ts";
import { required } from "../../test/required.ts";
import { DefaultsForm, TextInputFixture } from "./__fixtures__/text-input.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/text-input.hydration.fixture.tsx", import.meta.url), {
  DefaultsForm,
  TextInputFixture,
});

const NAME = { name: "Name" };

it("hydrating TextInput claims the server's nodes without warnings", async () => {
  const { mismatches } = await hydrate("TextInputFixture");
  expect(mismatches).toStrictEqual({});
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

it("hydrating TextInput keeps its default value, editable and read-only", async () => {
  const { container, mismatches } = await hydrate("DefaultsForm");
  const form = container.querySelector("form");
  expect(mismatches).toStrictEqual({});
  expect(Object.fromEntries(new FormData(required(form, "a form")).entries())).toStrictEqual({
    company: "Analytical Engines Ltd",
    team: "Research",
  });
});
