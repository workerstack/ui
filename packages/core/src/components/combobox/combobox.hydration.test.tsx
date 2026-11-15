import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { required } from "../../test/required.ts";
import {
  ComboboxChildrenFixture,
  ComboboxChipsFixture,
  ComboboxFixture,
  ComboboxViewFixture,
} from "./__fixtures__/combobox.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/combobox.hydration.fixture.tsx", import.meta.url), {
  ComboboxChildrenFixture,
  ComboboxChipsFixture,
  ComboboxFixture,
  ComboboxViewFixture,
});

const FRUIT = { name: "Fruit" };

it("hydrating Combobox claims the server's nodes without warnings (`items`)", async () => {
  const { mismatches } = await hydrate("ComboboxFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating Combobox claims the server's nodes without warnings (items as children)", async () => {
  const { mismatches } = await hydrate("ComboboxChildrenFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating Combobox claims the server's nodes without warnings (multiple, with chips)", async () => {
  const { mismatches } = await hydrate("ComboboxChipsFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating Combobox shows the chosen label from `items` on the server and after hydration", async () => {
  const hydrated = await hydrate("ComboboxFixture");
  expect(hydrated.server.html).toContain('value="Banana"');
  await expect.element(page.getByRole("combobox", FRUIT)).toHaveValue("Banana");
});

it("hydrating Combobox opens and picks from the server's input", async () => {
  const hydrated = await hydrate("ComboboxFixture");
  const input = required(hydrated.container.querySelector('[role="combobox"]'), "the server's input");
  await userEvent.click(page.getByRole("combobox", FRUIT));
  await userEvent.click(page.getByRole("option", { name: "Cherry" }));
  await expect.element(page.getByTestId("value")).toHaveTextContent("cherry");
  await expect.element(page.getByRole("combobox", FRUIT)).toHaveValue("Cherry");
  expect(hydrated.container.querySelector('[role="combobox"]')).toBe(input);
});

it("hydrating Combobox filters by typing and picks when its items are children", async () => {
  await hydrate("ComboboxChildrenFixture");
  await userEvent.click(page.getByRole("combobox", FRUIT));
  await userEvent.keyboard("ora");
  await expect.element(page.getByRole("option", { name: "Orange" })).toBeVisible();
  expect(page.getByRole("option", { name: "Apple" }).query()).toBeNull();
  await userEvent.click(page.getByRole("option", { name: "Orange" }));
  await expect.element(page.getByTestId("value")).toHaveTextContent("orange");
});

it("hydrating Combobox clears the value from the server's clear button", async () => {
  await hydrate("ComboboxFixture");
  await userEvent.click(page.getByRole("button", { name: "Clear" }));
  await expect.element(page.getByRole("combobox", FRUIT)).toHaveValue("");
  await expect.element(page.getByTestId("value")).toHaveTextContent("");
});

it("hydrating Combobox multiple adds a chip and removes one", async () => {
  await hydrate("ComboboxChipsFixture");
  await userEvent.click(page.getByRole("combobox", FRUIT));
  await userEvent.click(page.getByRole("option", { name: "Banana" }));
  await expect.element(page.getByTestId("value")).toHaveTextContent("apple,banana");
  await userEvent.click(page.getByRole("button", { name: "Remove" }).first());
  await expect.element(page.getByTestId("value")).toHaveTextContent("banana");
});

it("hydrating ComboboxView claims the server's nodes and keeps its labels", async () => {
  const { mismatches } = await hydrate("ComboboxViewFixture");
  expect(mismatches).toStrictEqual({});
  await expect.element(page.getByRole("status", { name: "Fruit" })).toHaveTextContent("Apple, Banana");
});
