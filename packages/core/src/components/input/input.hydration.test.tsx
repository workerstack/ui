import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { inputElement } from "../../test/dom.ts";
import { hydrator, mismatch } from "../../test/hydration.ts";
import { InputGroupFixture } from "./__fixtures__/input.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/input.hydration.fixture.tsx", import.meta.url), {
  InputGroupFixture,
});

const SEARCH = { name: "Search" };

it("hydrating Input claims the server's nodes without warnings", async () => {
  expect(mismatch(await hydrate("InputGroupFixture"), ["serverWarnings", "warnings", "replaced"])).toStrictEqual({});
});

// UI SDK 0.1.0-beta.2 leaves InputClear out of the server HTML (see input.server.test.tsx), so
// hydration has to add it: the field grows a button after load. Drop `.fails` when fixed.
it.fails("hydrating Input adds nothing the server didn't render", async () => {
  const hydrated = await hydrate("InputGroupFixture");
  await expect.poll(() => hydrated.container.querySelector('[data-slot="input-clear"]')?.isConnected).toBe(true);
  expect(hydrated.server.html).toContain('data-slot="input-clear"');
});

it("hydrating Input keeps the server's value and reports typing", async () => {
  await hydrate("InputGroupFixture");
  const input = page.getByRole("textbox", SEARCH);
  expect(inputElement(input.element()).value).toBe("solid");
  await userEvent.click(input);
  await userEvent.keyboard("{End}-js");
  await expect.element(page.getByRole("status")).toHaveTextContent("solid-js");
});

it("hydrating Input clears from the clear button", async () => {
  await hydrate("InputGroupFixture");
  await userEvent.click(page.getByRole("button", { name: "Clear search" }));
  expect(inputElement(page.getByRole("textbox", SEARCH).element()).value).toBe("");
});
